---
post_id: 719
title: Docker가 있는데도 PostgreSQL 테스트는 건너뛰었다
description: Docker API 버전 때문에 빠진 PostgreSQL 16 테스트를 실행하고, 두 트랜잭션의 잠금 경쟁을 어떤 순서로 검증했는지 따라간다.
date: '2026-06-14'
revised: '2026-10-10'
url: https://so-dak.com/testcontainers%eb%a5%bc-%ed%99%9c%ec%9a%a9%ed%95%9c-spring-boot-%ec%8b%a4%ec%8b%9c%ea%b0%84-%eb%a7%a4%ec%b9%ad-%eb%a1%9c%ec%a7%81-e2eend-to-end-%ed%86%b5%ed%95%a9-%ed%85%8c%ec%8a%a4%ed%8a%b8/
---

2026년 10월 10일 Linux에서 VoiceLink 백엔드 테스트를 실행했다. Java 17.0.20.1·Spring Boot 3.2.5 환경에서 실패는 없었다.

```text
Tests:    196
Passed:   195
Skipped:    1
Failures:   0
Errors:     0
```

건너뛴 하나는 PostgreSQL 16에서 [Outbox 선점 경쟁](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)을 확인하는 테스트였다. Docker도 실행 중이었다. 그런데 왜 빠졌을까?

## 설치 여부보다 로그 한 줄이 정확했다

해당 테스트만 로그를 켜고 다시 실행하니 Docker 클라이언트 요청이 거절되고 있었다.

```text
client version 1.32 is too old. Minimum supported API version is 1.40
```

이 환경의 Testcontainers 클라이언트는 API 1.32로 요청했고, 서버는 최소 1.40을 요구했다. **Docker 프로세스가 있다는 사실과 테스트가 Docker를 쓸 수 있다는 사실은 달랐다.**

프로젝트 파일은 그대로 두고 임시 Gradle 초기화 스크립트에서 테스트 JVM에 다음 값을 지정했다. 이번 환경에서 원인을 좁히기 위한 설정이며, 모든 환경에 고정할 권장 버전은 아니다.

```groovy
systemProperty 'api.version', '1.40'
```

같은 `MatchOutboxRepositoryPostgresTest`를 다시 실행하자 PostgreSQL 16 컨테이너가 시작됐고, 테스트 한 개가 통과했다. 이제 빠졌던 테스트는 채웠다. 다만 저장소의 기본 설정을 고친 것은 아니므로, 재현할 때도 이 추가 조건을 함께 적어야 한다.

## 잠긴 첫 행을 정말 건너뛰었나

이 테스트가 답하려는 질문은 작다. Outbox에 두 행이 있고 A가 첫 행을 잠갔을 때, B는 A를 기다리지 않고 다른 행을 가져올 수 있을까?

`MatchOutboxRepository.lockBatchForClaim`의 SQL은 다음 조건으로 처리할 행을 고른다. 조회할 개수를 1로 줄여 선점 경쟁을 만들었다.

```sql
SELECT * FROM match_outbox
WHERE sent_at IS NULL
  AND status IN ('PENDING', 'PROCESSING')
  AND (next_attempt_at IS NULL OR next_attempt_at <= :now)
  AND (locked_until IS NULL OR locked_until <= :now)
ORDER BY COALESCE(next_attempt_at, created_at), id
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

가짜 저장소가 다른 행을 반환하게 하면 그 뒤의 서비스 동작은 검사할 수 있다. 여기서는 **DB가 잠긴 행을 실제로 건너뛰는지**가 궁금하다. 그래서 실제 엔진과 별도 트랜잭션을 쓴다.

## 동시에 출발했다고 꼭 마주치는 건 아니다

두 작업을 동시에 제출해도 A가 먼저 끝나면 잠금 경쟁은 일어나지 않는다. 테스트는 A가 잠금을 잡았다는 신호를 받은 뒤, **A를 멈춘 상태에서 B의 완료를 기다린다.**

실제 검증 부분을 발췌했다. 트랜잭션 생성과 실패 시 정리 코드는 생략했다.

```java
assertThat(firstLocked.await(5, TimeUnit.SECONDS)).isTrue();
Future<Long> secondClaim = workers.submit(() -> inNewTransaction(() ->
        repository.lockBatchForClaim(LocalDateTime.now(), 1).get(0).getId()
));
Long secondClaimedId = secondClaim.get(5, TimeUnit.SECONDS);
releaseFirst.countDown();
Long firstClaimedId = firstClaim.get(5, TimeUnit.SECONDS);

assertThat(List.of(firstClaimedId, secondClaimedId))
        .containsExactlyInAnyOrder(firstId, secondId);
```

`secondClaim.get`이 `releaseFirst.countDown`보다 앞에 있다. A를 풀기 전에 B의 결과를 받는 순서다. 단지 두 작업이 끝난 뒤 서로 다른 ID만 비교하는 것보다 확인 범위가 분명하다.

이번 재실행은 이 순서와 ID 검증을 모두 통과했다. 실패할 때도 첫 작업의 대기를 풀고 실행기를 닫도록 정리해야 다음 테스트에 남은 작업이 섞이지 않는다.

## 통과 숫자 대신 남은 질문을 본다

이 테스트가 빠진 것은 처음이 아니다. 이전 기록과 이번 결과의 차이는 통과 개수보다 실행한 대상에 있다.

| 실행 기록 | 확인한 범위 |
| --- | --- |
| 9월 28일 선택 실행: 152개 통과·1개 건너뜀 | PostgreSQL 컨테이너 테스트 제외 |
| 10월 9일 선택 실행: 90개 통과·1개 건너뜀 | 위 테스트 제외, 별도 PostgreSQL 14.20 SQL 실험에서 A=1·B=2 선점 확인 |
| 10월 10일 기본 실행: 195개 통과·1개 건너뜀 | 이번 Docker API 호환 문제로 저장소 테스트 제외 |
| 같은 날 API 버전을 지정해 한 개 재실행 | 프로젝트 매핑·트랜잭션을 거친 PostgreSQL 16 선점 검증 통과 |

실행 대상이 다르므로 숫자가 늘어난 것을 품질의 전후 비교로 쓰지는 않는다. 별도 SQL 실험은 SQL의 동작을 보여줬고, 이번 프로젝트 테스트는 JPA 매핑과 트랜잭션 설정까지 거친 결과를 더했다.

차단한 상대를 후보에서 빼는 규칙은 서비스 테스트로 확인할 수 있다. 반면 두 작업의 DB 잠금이나 실제 기기의 음성 수신은 각각 그 경로를 실행해야 한다. 같은 기능 주변에 있다고 전부 하나의 거대한 E2E 테스트로 묶을 이유는 없다.

이번에는 실패가 아니라 건너뜀 한 줄에 원인이 숨어 있었다. 초록색 결과를 읽을 때도, **확인하려던 질문이 실행 대상에 들어갔는지**부터 봐야 했다.

## 참고 자료

- [Testcontainers JUnit 5 통합](https://java.testcontainers.org/test_framework_integration/junit_5/)
- [Spring Boot 테스트](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [PostgreSQL 16 SELECT와 행 잠금](https://www.postgresql.org/docs/16/sql-select.html)

근거: VoiceLink `1704b46`의 전체 백엔드 실행 로그와 `MatchOutboxRepositoryPostgresTest` 재실행, 저장소 SQL·테스트 설정. 관련 백엔드 파일은 `b159c1d`와 동일하다. 조건부 재실행 환경은 Java 17.0.20.1·Spring Boot 3.2.5·Testcontainers 1.19.7이며 테스트 JVM의 Docker API 버전은 1.40이다. 브라우저·실기기 E2E 결과는 아니다.
