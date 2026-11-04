---
post_id: 716
title: sent_at이 있다고 발송 성공은 아니었다
description: 발송을 포기해도 sent_at을 채우던 Outbox에서 과거 실패가 SENT로 바뀌는 조건과 상태 변환 전에 확인할 기록을 살펴본다.
date: '2026-06-14'
revised: '2026-11-05'
url: https://so-dak.com/jpa-ddl-autoupdate%ec%9d%98-%ec%9c%84%ed%97%98%ec%84%b1%ea%b3%bc-flyway%eb%a5%bc-%ed%99%9c%ec%9a%a9%ed%95%9c-%ec%95%88%ec%a0%84%ed%95%9c-db-%eb%a7%88%ec%9d%b4%ea%b7%b8%eb%a0%88%ec%9d%b4%ec%85%98/
---

`sent_at`에 시각이 있으면 발송 성공한 행 아닐까. 이름은 분명 ‘보낸 시각’인데, VoiceLink의 옛 코드는 발송을 포기할 때도 이 값을 채웠다.

변경 이력 `5091eba` 이전의 `MatchOutbox.abandon`은 실패한 행에 `sentAt=now`를 넣었다. 이후에는 `FAILED` 상태를 따로 남긴다. 전환 SQL에서 어려운 부분은 새 컬럼을 만드는 문법보다 **옛 행의 성공과 실패를 다시 구분하는 일**이었다. 코드를 대조한 분석이며, 운영 DB를 변환한 경험담은 아니다.

## 같은 모양으로 남은 두 행

다음 두 행을 생각해보자. 실제 운영 데이터가 아닌 설명용 예시다.

| 실제 경과 | sent_at | last_error |
| --- | --- | --- |
| 발송 성공 | 10:00 | NULL |
| 실패 후 포기 | 10:00 | NULL |

옛 `markFailed`는 예외 메시지가 `null`이면 `last_error`도 비워 뒀고, `abandon`은 시각을 채웠다. **이 두 컬럼만 보면 성공과 실패가 똑같이 생겼다.** 오류 메시지가 없다는 사실을 성공의 증거로 쓸 수 없는 이유다.

그런데 현재 전환 파일의 분류는 바로 이 두 컬럼을 사용한다.

```sql
UPDATE match_outbox
SET status = CASE
    WHEN sent_at IS NULL THEN 'PENDING'
    WHEN last_error IS NULL THEN 'SENT'
    ELSE 'FAILED'
END
WHERE status IS NULL;
```

첫 조건 때문에 시각이 없으면 오류가 있어도 `PENDING`이다. 시각과 오류가 모두 있으면 `FAILED`로 옮긴다. 하지만 예시의 두 행은 둘 다 두 번째 조건에 걸려 `SENT`가 된다. 문법 오류 없이 실행돼도 분류는 틀릴 수 있다.

`WHERE status IS NULL`은 이미 새 상태가 있는 행을 덮어쓰지 않도록 한다. 따라서 잘못 `SENT`로 분류한 뒤 같은 SQL을 한 번 더 돌리는 것으로는 바로잡을 수 없다.

## 빈칸 검사로는 잡히지 않는 오류

이 파일은 nullable 컬럼 추가 → 기존 상태 채우기 → 기본값과 `NOT NULL` 설정 순서로 진행한다. 잘못 분류된 행도 `SENT`라는 값은 있으니 빈칸 검사에 걸리지 않는다.

Hibernate `validate` 역시 컬럼과 엔티티의 구조를 검사할 뿐, 그 행이 과거에 성공했는지는 알 수 없다. 새 테이블을 만드는 `create-drop` 테스트에 더해 **과거 행을 넣고 변환 결과를 검사하는 테스트**가 필요한 이유다.

우선 대조할 대상은 `sent_at`은 있지만 `last_error`는 없는 행이다. 당시 발행 로그나 별도 처리 기록으로 성공 여부를 확인할 수 있어야 한다. 근거가 부족하면 자동으로 성공 처리하기보다 검토 대상으로 남기는 방안을 정해야 한다. 이는 개선 제안이며, 현재 전환 SQL에 그런 보류 상태가 구현돼 있지는 않다.

반대로 `FAILED`로 분류된 행은 후속 SQL에서 `sent_at`을 비운다. 새 코드의 최종 실패 테스트도 `FAILED`와 빈 시각을 함께 기대한다. [Outbox의 재시도와 최종 실패](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)를 새 상태로 구분하는 부분이다.

실행 순서도 중요하다. 변환 도중 구버전 앱이 새 행을 쓰면 그 행은 한 번 끝난 변환에서 빠질 수 있다. 쓰기를 멈추거나, 호환되는 쓰기와 추가 변환이 필요하다.

이 파일은 수동 실행용이다. `CREATE INDEX CONCURRENTLY`가 포함돼 전체를 한 트랜잭션으로 묶을 수 없으니, 중간에 멈췄다면 어디까지 적용됐는지부터 확인한다.

이 변환에서 먼저 필요한 것은 더 강한 `NOT NULL` 제약이 아니다. **같이 생긴 두 행을 구분할 기록이 남아 있는지**다. 그 기록이 없으면 SQL만으로 과거의 성공을 복원할 수 없다.

근거: 2026년 10월 27일 VoiceLink `46282d5`의 전환 SQL·Outbox 엔티티·임대 서비스 테스트·JPA 설정·인덱스 적용 문서와 `5091eba` 이전 코드를 대조했다. Java 17에서 임대 서비스 테스트 3개가 통과했으며 최종 실패 검사도 포함된다. 이는 새 상태의 동작에 대한 근거다. 이 글의 예시를 운영 데이터에서 발견했거나 과거 행의 변환 SQL을 실행한 것은 아니다.

- [Hibernate 스키마 도구](https://docs.hibernate.org/orm/6.4/userguide/html_single/#schema-generation)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html)
