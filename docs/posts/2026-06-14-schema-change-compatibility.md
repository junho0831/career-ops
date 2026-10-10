---
post_id: 716
title: sent_at이 있다고 발송 성공은 아니었다
description: 보낸 시각과 오류가 함께 남은 행을 예로 들어 Outbox 상태 변환, 제약 설정, 부분 적용을 설명한다.
date: '2026-06-14'
revised: '2026-10-10'
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

## 빈 컬럼을 만든 다음에는 누가 쓰고 있나

변환 파일은 새 컬럼을 nullable로 추가하고 기존 행을 채운 뒤 기본값과 `NOT NULL`을 설정한다. 아래는 파일에서 마지막 제약 설정을 발췌한 부분이다.

```sql
ALTER TABLE match_outbox
    ALTER COLUMN status SET DEFAULT 'PENDING',
    ALTER COLUMN status SET NOT NULL;
```

여기서 변환 도중 구버전 앱이 빈 값을 새로 넣는다면 어떨까. 기존 행을 한 번 채워도 뒤에 빈 행이 생길 수 있다. 기본값·호환 쓰기·추가 변환 중 어떤 방식으로 이 틈을 닫을지 정해야 한다.

배포 중 쓰기를 멈추면 변환 대상은 단순해지지만 중단 시간을 감수해야 한다. 계속 받으려면 구버전이 넣는 행까지 새 규칙으로 처리해야 한다. 이 파일의 순서만으로 무중단 호환성을 보장할 수는 없다.

## 파일 전체가 한 번에 되돌아가지는 않는다

뒤의 부분 인덱스는 `CREATE INDEX CONCURRENTLY`로 만든다. 일반 인덱스 생성처럼 쓰기를 막지 않는 대신, 트랜잭션 블록 안에서는 실행할 수 없다. 파일 전체를 `BEGIN`으로 묶어 한꺼번에 되돌리는 방식과는 함께 쓸 수 없는 선택이다.

예를 들어 상태 변환은 끝났는데 인덱스 생성에서 실패했다면 앞부분은 남아 있을 수 있다. 파일 끝의 `pg_indexes` 조회는 인덱스 정의를 보여 주지만, 유효성까지 확인하려면 아래처럼 `pg_index`를 볼 수 있다. 실제 적용 결과가 아니라 읽기 전용 점검 예제다.

```sql
SELECT c.relname, i.indisvalid, pg_get_indexdef(i.indexrelid)
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
WHERE i.indrelid = 'match_outbox'::regclass
  AND c.relname = 'ix_match_outbox_claimable_due_id';
```

[`indisvalid=false`](https://www.postgresql.org/docs/16/catalog-pg-index.html)는 쿼리에 안전하게 쓸 수 없다는 뜻이다. 같은 이름이 있다는 이유로 완료 처리하면 안 된다. `IF NOT EXISTS`는 이름의 존재를 확인할 뿐, 원하는 정의와 유효한 상태까지 대신 검증하지 않는다.

## 앱이 켜졌다고 데이터까지 맞는 건 아니다

VoiceLink는 이 SQL을 앱 시작 때 자동 실행하지 않는다. 빌드에도 Flyway 의존성은 없고, 공통 Hibernate 설정은 `validate`, 테스트는 `create-drop`이다. 새 스키마를 만들어 테스트한 결과와 과거 데이터의 변환 결과는 다른 근거다.

`validate`가 컬럼 불일치를 찾더라도, 과거 실패 행이 성공 상태로 잘못 들어간 것까지 판단하지는 않는다. **구조 검사와 변환 규칙 검사를 나눠야 한다.**

다음 변환 테스트에는 오류 메시지가 있는 실패뿐 아니라 **메시지 없이 포기한 실패 행**도 넣겠다. 새 상태의 실패 처리가 맞아도 옛 데이터가 그 상태로 들어오는 과정은 따로 틀릴 수 있다. 이번 SQL에서는 바로 그 한 행이 남은 질문이다.

## 참고 자료

- [Hibernate 스키마 도구](https://docs.hibernate.org/orm/6.4/userguide/html_single/#schema-generation)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html)

검토한 소스: 관련 코드가 동일한 VoiceLink `1704b46`·`b159c1d`의 JPA 설정·빌드·전환 SQL·Outbox 엔티티와 `5091eba` 전후 이력. 2026-10-10 백엔드 테스트에서 임대 서비스의 최종 실패 검사도 통과했다. PostgreSQL 16 저장소 선점 검사도 별도 통과했지만, 과거 행을 옮기는 변환 SQL은 실행하지 않았다.
