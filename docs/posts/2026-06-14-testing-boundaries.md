---
post_id: 719
title: '152개 통과, 1개 건너뜀: 테스트 결과에서 빠진 증거'
description: 152개 통과와 한 개 건너뜀이라는 과거 실행 기록에서 실제 DB 잠금 경쟁 검증의 범위를 구분한다.
date: '2026-06-14'
revised: '2026-10-08'
url: https://so-dak.com/testcontainers%eb%a5%bc-%ed%99%9c%ec%9a%a9%ed%95%9c-spring-boot-%ec%8b%a4%ec%8b%9c%ea%b0%84-%eb%a7%a4%ec%b9%ad-%eb%a1%9c%ec%a7%81-e2eend-to-end-%ed%86%b5%ed%95%a9-%ed%85%8c%ec%8a%a4%ed%8a%b8/
---

2026년 9월 28일, VoiceLink의 백엔드 테스트 일부를 Java 17·Spring Boot 3.2.5 환경에서 실행한 기록이다. 실패는 없었다.

```text
Test suites: 32
Tests:       153
Passed:      152
Skipped:       1
Failures:      0
Errors:        0
```

그런데 통과 수보다 눈여겨볼 항목은 `Skipped: 1`이다. 실제 PostgreSQL의 [Outbox 선점 경쟁](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)을 확인하는 테스트였다. **실패가 0개인 것과 확인하려던 질문을 모두 검증한 것은 다르다.**

## 152개로 대신 답할 수 없는 질문

Outbox에 두 행이 있고 A가 첫 행을 잠갔다고 하자. B는 A를 기다리지 않고 다른 행을 가져올 수 있을까? `SKIP LOCKED`가 필요한 바로 그 상황이다.

가짜 저장소가 다른 행을 반환하도록 설정하면 후속 서비스 동작은 검사할 수 있다. 여기서는 그 반환 자체가 궁금하다. **잠긴 행을 실제 DB가 건너뛰는가?** 이 질문에는 별도 트랜잭션이 필요하다.

이를 확인하는 저장소 테스트는 PostgreSQL 16 컨테이너를 띄운다. 당시에는 Docker 사용 불가 조건으로 건너뛰었다. 나머지 152개가 통과해도 이 질문의 답이 채워지지는 않는다.

## 동시에 출발했다고 꼭 마주치는 건 아니다

컨테이너만 띄운다고 충분한 것도 아니다. 두 작업을 동시에 제출해도 A가 먼저 끝나면 서로 잠금을 두고 경쟁하지 않는다. 그래서 테스트는 A가 잠금을 잡았다는 신호를 받은 뒤, **A를 멈춘 상태에서 B의 완료를 기다린다.**

실제 테스트에서 그 순서가 드러나는 부분이다. 트랜잭션을 만드는 헬퍼와 전체 정리 코드는 발췌에서 생략했다.

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

`secondClaim.get`이 `releaseFirst.countDown`보다 앞에 있다. A를 풀기 전에 B의 결과를 받으려는 것이다. 두 작업이 끝난 뒤 서로 다른 ID만 비교하는 테스트와는 확인 범위가 다르다.

작업마다 별도 트랜잭션을 쓰고, 대기에는 제한 시간을 둬야 한다. 실패했을 때도 첫 작업의 대기를 풀고 실행기를 정리해야 다음 테스트가 남은 작업에 영향을 받지 않는다.

## 작은 테스트로 충분한 질문도 있다

차단한 상대를 후보에서 제외하는 규칙이라면, 저장소가 차단 관계를 반환하게 만든 뒤 매칭 결과와 금지된 후속 호출을 확인할 수 있다. 이 질문에 실제 브라우저나 미디어 서버까지 필요하지는 않다.

| 확인하려는 질문 | 필요한 관찰 |
| --- | --- |
| 차단한 상대를 후보에서 제외하는가 | 서비스의 반환과 금지된 후속 호출 |
| 두 작업이 같은 DB 행을 선점하는가 | 실제 엔진의 별도 트랜잭션 |
| 발행 뒤 응답만 잃으면 중복 효과가 생기는가 | 전달과 소비 결과의 조합 |
| 사용자가 마이크를 허용하면 소리가 도착하는가 | 실제 클라이언트와 미디어 경로 |

표의 오른쪽이 필요한 증거다. 같은 기능이라는 이유로 전부 하나의 거대한 E2E 테스트에 넣을 필요는 없다.

작은 테스트는 조건을 빠르게 바꿔 업무 규칙을 검사하기 좋다. 실제 DB를 쓰는 테스트는 느리고 준비도 필요하지만, 잠금처럼 대역으로 대신할 수 없는 동작에 쓴다. 테스트 종류를 고르는 기준은 크기보다 답하려는 질문이다.

이 기록의 다음 할 일은 분명하다. Docker를 사용할 수 있는 환경에서 건너뛴 경쟁 테스트를 실행하는 것이다. 통과 숫자를 더하는 것보다, 비어 있는 답 하나를 채우는 쪽이 먼저다.

## 참고 자료

- [Testcontainers JUnit 5 통합](https://java.testcontainers.org/test_framework_integration/junit_5/)
- [Spring Boot 테스트](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [Flutter 테스트 개요](https://docs.flutter.dev/testing/overview)
- [PostgreSQL SELECT와 행 잠금](https://www.postgresql.org/docs/16/sql-select.html)

근거: 2026-09-28의 선택 실행 기록과, 2026-10-08 다시 읽은 VoiceLink `1704b46`의 PostgreSQL Outbox 경쟁 테스트. 152개 통과는 과거 기록이며 이번 개정에서 전체 테스트나 실기기 E2E를 새로 실행한 결과는 아니다.
