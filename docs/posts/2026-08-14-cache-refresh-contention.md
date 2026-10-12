---
post_id: 1248
title: 잠금 안에서 캐시를 한 번 더 읽는 이유
description: 캐시가 비었다고 확인한 요청도 잠금을 기다리는 동안 상황이 달라질 수 있다. VoiceLink의 두 번의 조회와 여덟 요청 테스트로 그 이유를 따라간다.
date: '2026-08-14'
revised: '2026-10-12'
url: https://so-dak.com/redis-cache-stampede-%ed%98%84%ec%83%81-%ea%b7%b9%eb%b3%b5%ea%b8%b0-%ec%ba%90%ec%8b%9c-%ec%a0%81%ec%9a%a9%ed%95%98%eb%a9%b4-db-%eb%b6%80%ed%95%98-%eb%81%9d-%ec%95%84%eb%8b%8c%ea%b0%80/
---

캐시를 읽고, 잠금을 얻고, 같은 캐시를 또 읽는다. VoiceLink의 통화방 조회 코드에 나오는 순서다.

방금 없다고 확인했는데 왜 다시 읽을까? **기다리는 동안 다른 요청이 값을 채웠을 수 있기 때문이다.**

이 코드는 재매칭할 때 기존 통화 세션을 재사용할지 판단하는 데 쓰인다. 초기 입장 보호 시간인 120초가 지난 세션은 LiveKit의 참가자 수도 확인한다. 같은 방을 동시에 조회하는 요청들이 외부 호출을 반복하지 않도록, 결과를 서버 안에 잠깐 보관한다. 아래는 Java 17·Spring Boot 3.2.5 구현을 읽고 동시 요청 테스트로 확인한 내용이다.

## 캐시가 있어도 갱신이 겹칠 수 있다

`ActiveSessionResolver`는 서버 프로세스 안의 `ConcurrentHashMap`에 참가자 부족 여부와 조회 시각을 저장한다. 기본 수명은 1초다. 그 안에 같은 방을 다시 물으면 저장한 값을 돌려준다.

하지만 캐시가 처음 비어 있거나 만료된 순간에는 여러 요청이 동시에 같은 상태를 볼 수 있다. A가 LiveKit을 조회하는 사이 B도 “캐시 없음”을 확인했다면, 두 요청 모두 원본을 읽으러 갈 수 있다. 캐시는 갱신이 겹치는 순간을 혼자 막아주지 않는다.

잠금으로 순서를 정해도 한 가지가 더 남는다. B가 기다리는 사이 A가 값을 채웠을 수 있다. 잠금을 얻은 B가 원본부터 다시 조회한다면 기다린 보람이 없어진다.

| 순서 | A | B |
| --- | --- | --- |
| 1 | 캐시가 비었거나 만료됨을 확인 | 같은 상태를 확인 |
| 2 | 잠금을 얻고 LiveKit 조회 | 잠금 대기 |
| 3 | 새 값을 저장하고 잠금 해제 | 잠금 획득 |
| 4 | 결과 반환 | 캐시를 다시 읽고 새 값 반환 |

구현을 설명하기 위한 요청 순서다. B가 처음 본 “캐시 없음”은 틀린 관찰이 아니었다. 다만 차례를 기다리는 동안 낡은 정보가 됐다.

## 같은 코드지만 두 조회의 일이 다르다

`hasInsufficientParticipantsWithCache()`에서 발췌한 코드다. `RoomStateSnapshot`은 부족 여부와 조회 시각을 묶은 값이다.

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
            new RoomStateSnapshot(insufficientParticipants, clock.instant()));
    return insufficientParticipants;
}
```

바깥 조회는 유효한 값이 있을 때 기다리지 않고 반환하는 길이다. 안쪽 조회는 기다리는 사이 누군가 갱신했는지 확인하는 길이다. 이름은 같은 `get`이지만 묻는 시점이 다르다.

원본 조회와 저장까지 같은 잠금 안에 둬야 다음 요청이 채워진 값을 볼 수 있다. 잠금만 넣고 안쪽 조회를 빼면, 중복 호출이 사라지는 대신 줄을 서서 실행될 뿐이다.

## 여덟 요청을 같이 출발시켜 확인했다

동시 요청 테스트는 스레드 여덟 개를 `CyclicBarrier`에서 모았다가 같은 세션으로 출발시킨다. LiveKit 역할의 Mockito 대역은 응답 전에 120ms 기다린다. 첫 요청이 원본을 조회하는 동안 나머지 요청도 빈 캐시를 보게 하려는 장치다.

캐시 수명은 1,000ms로 설정하고, 테스트용 시계는 고정했다. 검사하는 핵심은 **여덟 요청이 결과를 받되 원본 호출은 한 번인가**다.

```java
assertThat(maxInFlight.get()).isEqualTo(1);
verify(rtcRoomStatePort, times(1))
        .hasInsufficientParticipants("shared-session");
```

위 두 검사는 원본 호출의 최대 동시 실행 수와 총횟수를 각각 확인한다. 여덟 반환값이 모두 유효한 세션인지 보는 검사까지 통과했다. 실제 LiveKit의 처리량을 측정한 것은 아니다.

그럼 잠금이 있으면 언제나 한 번만 조회할까? 캐시 수명을 0으로 설정하면 이야기가 달라진다. `isFresh()`가 항상 거짓이므로 기다린 요청도 새로 조회한다. 값을 재사용하려면 **잠금을 얻은 뒤에도 그 값이 유효해야 한다.** 수명을 늘리면 재사용할 시간은 길어지지만 참가자가 떠난 뒤의 오래된 상태도 더 오래 남는다.

적용 범위도 한 서버 안이다. 각 서버는 자신의 Map과 잠금을 쓰고, 잠금은 미리 만든 64개를 세션 해시로 나눠 쓴다. 서로 다른 방도 같은 잠금에 배정되면 기다릴 수 있다. Redis에서 후보를 선점하는 [서버 간 매칭 흐름](https://so-dak.com/voicelink-distributed-matching-concurrency-redis-lua/)과는 역할이 다르다.

두 번째 `get`은 같은 일을 다시 하는 코드처럼 보인다. 하지만 B에게 필요한 건 처음 봤던 빈 캐시가 아니라, **자기 차례가 왔을 때의 캐시**였다.

## 참고 자료

- [Java 17 ConcurrentHashMap](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)
- [Java 17 CyclicBarrier](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CyclicBarrier.html)
- [Java 언어 명세: synchronized와 메모리 모델](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html)

프로젝트 근거: VoiceLink `37109d5`의 `ActiveSessionResolver`, `MatchProperties`, `LiveKitRoomStateService`, `ActiveSessionResolverTest`와 `docs/matching-call-lifecycle.md`. 2026-10-12 Linux·Java 17에서 관련 테스트 9개가 통과했다. 동시성 테스트의 250ms 미만 조건은 로컬 대역 시험의 판정 기준이며 서비스 응답 시간 목표가 아니다. 참가자 조회 실패도 `false`로 반환될 수 있어, 호출을 합치는 검증을 실제 방 상태의 정확성 검증으로 확대하지 않는다.
