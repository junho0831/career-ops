---
post_id: 716
title: sent_at이 있다고 발송 성공은 아니었다
description: 발송을 포기해도 sent_at을 채우던 Outbox에서 과거 실패가 SENT로 바뀌는 조건과 상태 변환 전에 확인할 기록을 살펴본다.
date: '2026-06-14'
revised: '2026-10-12'
url: https://so-dak.com/jpa-ddl-autoupdate%ec%9d%98-%ec%9c%84%ed%97%98%ec%84%b1%ea%b3%bc-flyway%eb%a5%bc-%ed%99%9c%ec%9a%a9%ed%95%9c-%ec%95%88%ec%a0%84%ed%95%9c-db-%eb%a7%88%ec%9d%b4%ea%b7%b8%eb%a0%88%ec%9d%b4%ec%85%98/
---

`sent_at`에 시각이 있으면 발송 성공한 행 아닐까. 이름은 분명 ‘보낸 시각’인데, 사연이 좀 있다. VoiceLink의 [Outbox 전환 SQL](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)은 그렇게만 분류하지 않는다. 과거 구현은 최대 재시도 실패에도 이 값을 채웠기 때문이다.

변경 이력 `5091eba` 이전의 `MatchOutbox.abandon`은 실패한 행에도 `sentAt=now`를 넣었다. 이후 코드는 `FAILED` 상태를 따로 남긴다. 문제는 컬럼을 만드는 문법보다 **한 컬럼에 섞여 있던 성공과 실패를 어떻게 나누느냐**다. PostgreSQL 전환 파일의 규칙을 확인한 것이며 운영 DB에 적용한 기록은 아니다.

## 같은 시각이 있어도 성공과 실패가 나뉜다

예를 들어 보낸 시각과 오류가 모두 남은 행이 있다고 하자. 시각만 보고 `SENT`로 옮기면 과거 실패를 성공으로 바꾸게 된다. 실제 변환 규칙은 다음과 같다.

| 기존 sent_at | 기존 last_error | 새 상태 |
| --- | --- | --- |
| 없음 | 유무와 무관 | PENDING |
| 있음 | 없음 | SENT |
| 있음 | 있음 | FAILED |

```sql
UPDATE match_outbox
SET status = CASE
    WHEN sent_at IS NULL THEN 'PENDING'
    WHEN last_error IS NULL THEN 'SENT'
    ELSE 'FAILED'
END
WHERE status IS NULL;
```

조건 순서도 중요하다. 보낸 시각이 없다면 오류가 있어도 첫 조건에서 `PENDING`이 된다. `WHERE status IS NULL`은 이미 새 상태가 있는 행을 다시 분류하지 않도록 제한한다.

파일은 `FAILED`로 옮긴 행의 보낸 시각도 비운다. 옛 컬럼까지 새 의미와 맞추는 것이다. `MatchOutboxLeaseServiceTest`의 최종 실패 검사도 `FAILED` 상태와 빈 `sent_at`을 함께 기대한다.

여기서 변환 규칙을 한 번 더 의심할 이유가 생긴다. 이전 `markFailed`는 예외 메시지가 `null`이면 `last_error`도 비워 두었다. 그 상태로 재시도를 포기해 시각을 채우면 표의 두 번째 줄, `SENT`로 간다. **오류 기록이 없다는 사실만으로 성공을 증명할 수는 없다.** 이 조합은 당시 로그나 별도 발송 기록을 대조해야 분류할 수 있다.

## 컬럼을 채워도 과거의 의미까지 채워지지는 않는다

변환 파일은 새 컬럼을 nullable로 추가하고 기존 행을 채운 뒤 기본값과 `NOT NULL`을 설정한다. 하지만 빈칸을 없앴다는 사실이 분류까지 맞았다는 뜻은 아니다. 앞의 실패 행도 `SENT`라는 값이 있으니 빈칸 검사에는 걸리지 않는다.

앱 시작 때 사용하는 Hibernate `validate`도 같은 한계가 있다. 컬럼과 엔티티의 구조는 검사하지만, 과거에 포기한 발송을 성공으로 옮겼는지는 알 수 없다. 새 스키마를 만드는 `create-drop` 테스트와 과거 행을 변환하는 테스트를 나눠야 하는 이유다.

변환 중 들어오는 행도 빠뜨리면 안 된다. 구버전 앱이 계속 쓰는 동안 한 번만 상태를 채우면, 그 뒤에 생긴 행은 놓칠 수 있다. 쓰기를 잠깐 멈출지, 호환되는 쓰기와 추가 변환을 준비할지 결정해야 한다.

이 SQL은 앱에서 자동 실행되지 않으며, 뒤의 `CREATE INDEX CONCURRENTLY` 때문에 파일 전체를 한 트랜잭션으로 묶을 수도 없다. 중간 실패 시 어디까지 적용됐는지 확인해야 한다.

이 SQL에서 가장 먼저 대조할 대상은 **시각은 있지만 오류 메시지는 없는 행**이다. 정상 발송과 메시지 없이 포기한 실패가 같은 모양으로 남을 수 있다. 둘을 나눌 기록이 없다면 컬럼 이름이나 `NOT NULL`만으로 성공을 확정할 수 없다.

## 참고 자료

- [Hibernate 스키마 도구](https://docs.hibernate.org/orm/6.4/userguide/html_single/#schema-generation)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html)

근거: VoiceLink `37109d5`의 전환 SQL·Outbox 엔티티·임대 서비스 테스트·JPA 설정·빌드·인덱스 적용 문서와 `5091eba` 이전 코드를 대조했다. 2026-10-10에 확인한 최종 실패 테스트 결과는 새 상태의 동작에 대한 근거다. 이번 개정에서 테스트나 과거 행의 변환 SQL을 새로 실행하지는 않았다.
