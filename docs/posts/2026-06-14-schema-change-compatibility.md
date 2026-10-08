---
post_id: 716
title: sent_at이 있다고 발송 성공은 아니었다
description: 보낸 시각과 오류가 함께 남은 행을 예로 들어 Outbox 상태 변환, 제약 설정, 부분 적용을 설명한다.
date: '2026-06-14'
revised: '2026-10-08'
url: https://so-dak.com/jpa-ddl-autoupdate%ec%9d%98-%ec%9c%84%ed%97%98%ec%84%b1%ea%b3%bc-flyway%eb%a5%bc-%ed%99%9c%ec%9a%a9%ed%95%9c-%ec%95%88%ec%a0%84%ed%95%9c-db-%eb%a7%88%ec%9d%b4%ea%b7%b8%eb%a0%88%ec%9d%b4%ec%85%98/
---

`sent_at`에 시각이 있으면 발송 성공한 행 아닐까. 이름은 분명 ‘보낸 시각’인데, 사연이 좀 있다. VoiceLink의 [Outbox 전환 SQL](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)은 그렇게만 분류하지 않는다. 과거 구현은 최대 재시도 실패에도 이 값을 채웠기 때문이다.

문제는 컬럼을 만드는 문법보다 **한 컬럼에 섞여 있던 성공과 실패를 어떻게 나누느냐**다. PostgreSQL 전환 파일을 읽으며 변환 규칙과 배포 순서를 살펴봤다. 운영 DB에 적용한 기록은 아니다.

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

파일은 `FAILED`로 옮긴 행의 보낸 시각도 비운다. 옛 컬럼까지 새 의미와 맞추는 것이다. 검증할 때는 표의 세 조합을 실제 행으로 준비해 결과를 비교해야 한다. SQL은 잘못된 변환 규칙도 성실하게 실행하니까.

## 빈 컬럼을 만든 다음에는 누가 쓰고 있나

기존 행이 비어 있는데 곧바로 `NOT NULL`을 걸면 변경이 막힐 수 있다. 흐름을 줄인 설명용 예제는 다음과 같다. 실제 테이블은 아니며 잠금 시간도 측정하지 않았다.

```sql
ALTER TABLE work_items ADD COLUMN status varchar(20);
-- 기존 행의 업무 의미를 검토한 별도 변환 수행
-- 새 코드가 쓰는 값과 미변환 행을 확인
ALTER TABLE work_items ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE work_items ALTER COLUMN status SET NOT NULL;
```

여기서 변환 도중 구버전 앱이 빈 값을 새로 넣는다면 어떨까. 기존 행을 한 번 채워도 뒤에 빈 행이 생길 수 있다. 기본값·호환 쓰기·추가 변환 중 어떤 방식으로 이 틈을 닫을지 정해야 한다.

확인한 파일도 상태를 채운 뒤 기본값과 제약을 설정한다. 배포 중 쓰기를 잠시 멈추면 변환 대상은 단순해지지만 서비스 중단을 감수해야 한다. 쓰기를 계속 받으려면 구버전이 넣는 행까지 새 규칙에 맞게 처리해야 한다. 이 선택 없이 SQL 순서만 정해 두면 그 사이에 들어오는 행이 빠진다.

## 파일 전체가 한 번에 되돌아가지는 않는다

뒤의 부분 인덱스는 `CREATE INDEX CONCURRENTLY`로 만든다. 일반 인덱스 생성처럼 쓰기를 막지 않는 대신, 트랜잭션 블록 안에서는 실행할 수 없다. 파일 전체를 `BEGIN`으로 묶어 한꺼번에 되돌리는 방식과는 함께 쓸 수 없는 선택이다.

예를 들어 상태 변환은 끝났는데 인덱스 생성에서 실패했다면 앞부분은 남아 있을 수 있다. 다시 실행하기 전에 컬럼·상태 분포·인덱스 유효성을 확인해야 한다. `IF NOT EXISTS`도 같은 이름의 인덱스가 올바르다는 검증은 아니다.

## 앱이 켜졌다고 데이터까지 맞는 건 아니다

VoiceLink의 공통 Hibernate 설정은 `validate`, 테스트는 `create-drop`이다. 새 스키마를 만들어 테스트한 결과와 과거 데이터의 변환 결과는 다른 근거다.

`validate`가 컬럼 불일치를 찾더라도, 과거 실패 행이 성공 상태로 잘못 들어간 것까지 판단하지는 않는다. **구조 검사와 변환 규칙 검사를 나눠야 한다.**

그래서 이 전환을 검증한다면 새 DB에서 앱을 켜는 테스트만으로 끝내지 않겠다. **과거 실패 행 하나를 넣고 변환 뒤에도 실패로 남는지**부터 확인하겠다. 컬럼 이름보다 그 한 행이 더 많은 것을 알려 준다.

## 참고 자료

- [Hibernate 스키마 도구](https://docs.hibernate.org/orm/6.4/userguide/html_single/#schema-generation)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html)

검토한 소스: VoiceLink 공통·테스트 JPA 설정, 빌드 의존성, Outbox 임대 전환 SQL, 회사 이메일·사용자 안전 스키마 문서. 이 글을 작성하며 운영 스키마를 변경하지 않았다.
