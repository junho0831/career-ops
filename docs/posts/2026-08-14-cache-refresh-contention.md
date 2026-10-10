---
post_id: 1248
title: 잠금 안에서 캐시를 한 번 더 읽는 이유
description: VoiceLink의 변경 이력과 동시 요청 테스트로 캐시 재확인을 설명하고, 1초 수명·64개 잠금·LiveKit 조회 실패가 판정에 미치는 영향을 살펴본다.
date: '2026-08-14'
revised: '2026-10-10'
url: https://so-dak.com/redis-cache-stampede-%ed%98%84%ec%83%81-%ea%b7%b9%eb%b3%b5%ea%b8%b0-%ec%ba%90%ec%8b%9c-%ec%a0%81%ec%9a%a9%ed%95%98%eb%a9%b4-db-%eb%b6%80%ed%95%98-%eb%81%9d-%ec%95%84%eb%8b%8c%ea%b0%80/
---

VoiceLink에서 사용자가 다시 매칭을 요청하면, 먼저 기존 통화 세션을 계속 사용할 수 있는지 확인한다. DB에 활성 세션이 남아 있다는 사실만으로는 부족하다. 실제 통화방의 참가자도 확인해야 한다.

이때 같은 방으로 재접속 요청이 몰리면 참가자 조회도 함께 늘어난다. 프로젝트의 동시성 점검 문서가 짚은 문제다. `adf997c`의 변경에서는 짧은 캐시와 잠금을 넣었다. 이번에는 `1704b46`과 글에서 다루던 `b159c1d`의 관련 코드가 동일한지 확인하고 테스트도 다시 실행했다. 아래 구현은 Java 17·Spring Boot 3.2.5 기준이다.

그 코드에서 눈에 걸리는 부분이 있다. 캐시를 잠금 밖에서 읽고, 안에서 또 읽는다.

방금 확인했는데 왜 다시 확인할까?

## 캐시가 있어도 갱신이 겹칠 수 있다

`ActiveSessionResolver`의 캐시는 Redis가 아니라 서버 프로세스 안의 `ConcurrentHashMap`이다. 저장하는 값은 방 참가자가 부족한지와 조회 시각이며, 기본 수명은 1초다. 유효한 값이 있으면 LiveKit을 다시 부르지 않는다.

하지만 캐시가 처음 비어 있거나 만료된 순간에는 여러 요청이 동시에 같은 상태를 볼 수 있다. A가 LiveKit을 조회하는 사이 B도 “캐시 없음”을 확인했다면, 두 요청 모두 원본을 읽으러 갈 수 있다. 캐시는 갱신이 겹치는 순간을 혼자 막아주지 않는다.

잠금으로 순서를 정해도 한 가지가 더 남는다. B가 기다리는 사이 A가 값을 채웠을 수 있다. 잠금을 얻은 B가 원본부터 다시 조회한다면 기다린 보람이 없어진다.

| 순서 | A | B |
| --- | --- | --- |
| 1 | 캐시가 비었거나 만료됨을 확인 | 같은 상태를 확인 |
| 2 | 잠금을 얻고 LiveKit 조회 | 잠금 대기 |
| 3 | 새 값을 저장하고 잠금 해제 | 잠금 획득 |
| 4 | 결과 반환 | 캐시를 다시 읽고 새 값 반환 |

이 표는 구현을 설명하는 요청 순서다. **잠금을 기다리기 전의 관찰은 잠금을 얻은 뒤의 판단 근거로 그대로 쓸 수 없다.** 안쪽의 두 번째 조회가 필요한 이유다.

## 같은 코드지만 두 조회의 일이 다르다

현재 `hasInsufficientParticipantsWithCache()`의 실제 구현이다. `RoomStateSnapshot`에는 부족 여부와 조회 시각을 함께 담는다.

```java
RoomStateSnapshot snapshot = roomStateCache.get(sessionId);
if (isFresh(snapshot)) {
    return snapshot.insufficientParticipants();
}

synchronized (lockFor(sessionId)) {
    RoomStateSnapshot refreshed = roomStateCache.get(sessionId);
    if (isFresh(refreshed)) {
        return refreshed.insufficientParticipants();
    }

    boolean insufficientParticipants =
            rtcRoomStatePort.hasInsufficientParticipants(sessionId);
    roomStateCache.put(sessionId,
            new RoomStateSnapshot(insufficientParticipants, Instant.now()));
    return insufficientParticipants;
}
```

바깥 조회는 유효한 값이 있을 때 기다리지 않고 반환하는 길이다. 안쪽 조회는 누군가 먼저 갱신했는지 확인하는 길이다. 원본 조회와 값 저장까지 같은 잠금 안에 있어야, 다음 요청이 그 갱신을 보고 반환할 수 있다.

이 잠금은 방마다 새 객체를 만드는 방식도 아니다. 객체 64개를 미리 만들고 다음 코드로 하나를 고른다.

```java
return roomStateLocks[
        Math.floorMod(sessionId.hashCode(), ROOM_STATE_LOCK_STRIPE_COUNT)
];
```

따라서 같은 세션은 같은 잠금을 쓰지만, 다른 세션도 해시가 겹치면 기다릴 수 있다. 잠금 객체 수를 고정한 대신 일부 관계없는 요청의 대기를 받아들인 구조다. 모든 방이 완전히 독립적으로 갱신된다고 설명하면 실제 코드와 다르다.

## 여덟 요청을 같이 출발시켜 확인했다

`concurrentResolvesReuseCachedRoomStateForSameSession`은 스레드 여덟 개를 `CyclicBarrier`에서 모았다가 같은 세션을 조회하게 한다. LiveKit 역할의 Mockito 대역은 응답 전에 120ms 기다린다. 원본 조회가 진행되는 동안 다른 요청도 캐시가 비어 있는 상황을 만나도록 한 것이다.

테스트가 확인하는 핵심은 다음 세 가지다.

```java
assertThat(maxInFlight.get()).isEqualTo(1);
verify(rtcRoomStatePort, times(1))
        .hasInsufficientParticipants("shared-session");
assertThat(elapsed).isLessThan(Duration.ofMillis(250));
```

동시에 진행된 원본 호출의 최대 개수가 하나인지, 전체 호출도 한 번인지 검사한다. 각 Future가 반환한 세션이 비어 있지 않은지도 확인한다. 250ms는 이 테스트의 판정 기준이며 서비스의 실제 응답 속도 목표로 가져온 숫자는 아니다. 로컬 환경 부하가 커도 시간 조건은 실패할 수 있다.

2026년 10월 10일 백엔드 기본 테스트 실행에서도 이 검사가 통과했다. 참가자 조회는 실제 LiveKit 대신 Mockito 대역이므로, 확인한 것은 **같은 프로세스의 여덟 요청을 외부 조회 한 번으로 합치는 동작**이다.

캐시 테스트에는 오래된 세션 정리, 참가자 부족 시 정리, 정상 세션 유지도 들어 있다. 하지만 정상 반환값만 넣은 대역으로는 조회 자체가 실패했을 때의 의미까지 알 수 없다. 여기서 반환값을 만드는 쪽으로 한 단계 더 들어가 봤다.

## 1초를 늘리기 전에 반환값의 의미를 봐야 한다

캐시를 오래 두면 외부 호출은 줄어들 수 있다. 반면 참가자가 나간 뒤에도 잠시 전 값을 재사용한다. 이 값은 세션을 유지할지 결정하는 데 쓰인다. 기본 1초가 모든 서비스에 맞는 정답은 아니다.

설정 `active-session-room-state-cache-ms`가 0이면 `isFresh()`가 항상 거짓을 반환한다. 이때 같은 잠금으로 호출 순서는 정해지지만, 기다린 요청도 캐시를 재사용하지 않고 원본을 조회한다. **잠금이 있다는 사실과 원본 호출이 한 번이라는 결과는 같지 않다.** 위 동시성 테스트는 캐시 수명 1,000ms 조건에서 실행된다.

원본 호출의 반환값도 살펴봤다. `LiveKitRoomStateService`는 참가자가 두 명 미만이면 참을 반환한다. 방이 없다는 404 응답은 참가자 0명으로 취급한다. 그런데 그 밖의 HTTP 실패나 `IOException`에서는 참가자 수를 알 수 없어 `null`을 반환하고, 부족 여부 비교 결과는 거짓이 된다.

이 경로의 `false`에는 두 의미가 섞인다. “참가자가 충분하다”와 “조회에 실패해 부족 여부를 모른다”다. 캐시는 boolean 하나만 받으므로 둘 다 같은 방식으로 저장한다. **캐시가 신선하다는 말이 조회에 성공했다는 말은 아니었다.** 이는 코드에서 확인한 실패 경로이며 네트워크 장애 주입 실험은 아니다.

다음에 이 부분을 바꾼다면 단순히 수명을 늘리기보다, 정상 조회와 조회 실패를 다른 상태로 표현할지 먼저 판단해야 한다. 알 수 없다는 이유로 통화를 바로 종료하는 것도 비용이 있으므로 실패 상태의 재조회 간격과 사용자 영향까지 함께 정해야 한다.

서버가 두 대인 경우에는 각자의 Map과 잠금이 따로 있다. 이번 구현이 줄이는 것은 한 서버에 몰린 같은 세션의 중복 조회다. Redis 기반 후보 선점과는 다른 문제이며, 그 흐름은 [Lua 이후의 매칭 확정과 복구](https://so-dak.com/voicelink-distributed-matching-concurrency-redis-lua/)에서 이어진다.

처음 눈에 들어온 것은 두 번의 `get`이었다. 코드를 끝까지 따라가면 더 중요한 질문이 남는다. **그 사이 값이 바뀔 수 있는가, 그리고 저장한 값이 실제로 무엇을 확인한 결과인가.** 캐시 재확인과 실패 판정을 함께 봐야 이 메서드를 제대로 읽을 수 있다.

## 참고 자료

- [Java 17 ConcurrentHashMap](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)
- [Java 17 CyclicBarrier](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CyclicBarrier.html)
- [Java 언어 명세: synchronized와 메모리 모델](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html)

프로젝트 근거: 관련 구현이 동일한 VoiceLink `1704b46`·`b159c1d`의 `ActiveSessionResolver`, `MatchProperties`, `LiveKitRoomStateService`, 관련 테스트와 `docs/concurrency-hotspots.md`; 캐시 도입 변경 `adf997c`. 외부 주소·인증값·실사용자 데이터는 포함하지 않았다.
