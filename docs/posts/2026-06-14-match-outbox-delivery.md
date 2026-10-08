---
post_id: 715
title: 'Outbox 한 행의 수명: 저장·선점·발행·재시도'
description: 워커 두 개가 Outbox 행을 선점하는 과정과 발행 후 완료 기록 실패를 상태도와 실제 SQL로 설명한다.
date: '2026-06-14'
revised: '2026-10-08'
url: https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/
---

통화방은 저장됐는데 결과를 보내기 전에 서버가 꺼지면, 사용자는 계속 기다릴 수 있다. VoiceLink의 Outbox는 통화방과 “보낼 결과”를 같은 DB 트랜잭션에 남겨 이 틈을 다룬다.

하지만 메모만 남긴다고 배달이 끝나지는 않는다. 워커가 둘이면 담당자를 정해야 하고, 담당자가 멈추면 다른 워커가 이어받아야 한다. Java 17·Spring Boot 3.2.5 구현에서 행 하나가 넘어가는 과정을 따라가 보자. 아래 워커 A·B의 순서는 설명용이다.

## 1번 행을 기다리는 대신 2번 행 처리하기

A가 1번 행을 잡았는데 B도 같은 행을 기다린다면 워커를 늘린 의미가 줄어든다. 저장소는 지금 처리할 수 있는 미완료 행을 고르되, 잠긴 행은 건너뛴다.

```sql
SELECT *
FROM match_outbox
WHERE sent_at IS NULL
  AND status IN ('PENDING', 'PROCESSING')
  AND (next_attempt_at IS NULL OR next_attempt_at <= :now)
  AND (locked_until IS NULL OR locked_until <= :now)
ORDER BY COALESCE(next_attempt_at, created_at), id
LIMIT :limit
FOR UPDATE SKIP LOCKED
```

A가 1번을 잠근 동안 B는 다른 행으로 간다. 대신 **오래된 행부터 엄격하게 완료되는 순서는 포기한다.** `ORDER BY`가 있어도 잠긴 행을 건너뛰기 때문이다.

고른 행에는 임대 토큰과 만료 시각을 적고 트랜잭션을 끝낸다. 외부 발행은 그 뒤에 실행한다. 네트워크 응답을 기다리는 동안 DB 잠금을 계속 잡지 않으려면, 잠금이 풀린 뒤에도 담당자를 구별할 방법이 필요하다.

## 잠금 다음에는 임대 토큰

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING: 토큰과 만료 시각으로 선점
    PROCESSING --> SENT: 발행 후 완료 기록
    PROCESSING --> SKIPPED: 취소되거나 종료된 세션
    PROCESSING --> PENDING: 재시도 가능한 실패
    PROCESSING --> FAILED: 재시도 한도 초과
    PROCESSING --> PROCESSING: 임대 만료 뒤 다시 선점
```

예를 들어 A의 작업이 오래 걸려 임대가 만료되면 B가 새 토큰으로 가져갈 수 있다. 이때 뒤늦게 돌아온 A가 “완료”를 적으면 B의 작업을 덮어쓴다.

완료·실패 기록에서 행 ID와 임대 토큰을 함께 확인하는 이유다. 토큰이 바뀌었으면 A의 갱신을 반영하지 않는다. `PROCESSING`도 “아직 안 보냈다”보다는 “현재 누군가 맡고 있다”로 읽어야 한다.

토큰 검사는 DB 기록을 보호한다. 이미 밖으로 보낸 메시지까지 회수해 주지는 않는다.

## 완료 도장을 못 찍은 메시지는 다시 나갈 수 있다

브로커가 메시지를 받은 직후, `SENT`를 적기 전에 프로세스가 끝났다고 하자. DB에는 미완료 행이 남아 다음 워커가 다시 보낸다. [소비 측은 같은 결과를 다시 받는다](https://so-dak.com/spring-boot-sseserver-sent-events%eb%a1%9c-%ec%8b%a4%ec%8b%9c%ea%b0%84-%eb%a7%a4%ec%b9%ad-%ec%83%81%ed%83%9c-%ed%91%b8%ec%8b%9c-%ea%b5%ac%ed%98%84%ed%95%98%ea%b8%b0/).

이 상태에서 중복을 무조건 피하려고 재발행을 막으면, 실제로 보내지 못한 결과도 포기할 수 있다. **다시 보낼 수 있게 하되, 받는 쪽에서 같은 결과를 중복 반영하지 않게 하는 설계**가 함께 필요하다.

현재 워커는 취소·종료된 세션을 건너뛰고, 유효한 결과를 캐시에 남긴 뒤 발행한다. 실패하면 다음 시각을 늦춰 재시도하고 한도를 넘으면 `FAILED`로 끝낸다. “언젠가 반드시 도착”을 보장하는 무한 재시도는 아니다.

또 하나 구분할 점이 있다. 매칭 확정 코드에는 트랜잭션 메서드 안에서 로컬 대기 응답을 완료하는 경로도 있다. Outbox를 넣었다고 모든 응답이 커밋 이후로 옮겨지는 것은 아니다.

다음에 끊어 볼 지점은 발행 직후다. 그때 워커를 멈추고 다시 실행했을 때, **행은 회수되면서 같은 세션의 화면 전환은 한 번만 일어나는지**를 봐야 저장부터 수신까지 이어진다.

## 참고 자료

- [PostgreSQL SELECT 잠금 절](https://www.postgresql.org/docs/16/sql-select.html)
- [PostgreSQL 명시적 잠금](https://www.postgresql.org/docs/16/explicit-locking.html)
- [Spring 트랜잭션 경계](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

검토 범위: VoiceLink `1704b46`의 매칭 확정·Outbox 저장소·임대·발행 코드와 설정, 매칭 문서, 단위 및 PostgreSQL 저장소 테스트. 테스트 소스의 잠금·토큰·재시도 분기를 확인했으며 발행 직후 강제 종료와 화면 중복 반영은 추가 검증 대상이다.
