---
post_id: 921
title: 열세 번째 작업을 거절한 스레드 풀
description: 끝나지 않는 작업을 열세 개 제출한 Java 실험으로 작업자 수, 큐, 접수 거절과 업무 완료를 구분한다.
date: '2026-06-24'
revised: '2026-10-27'
url: https://so-dak.com/%eb%b0%b1%ec%97%94%eb%93%9c-%ec%95%84%ed%82%a4%ed%85%8d%ec%b2%98-spring-boot-async%ec%99%80-threadpool%ec%9d%84-%ed%99%9c%ec%9a%a9%ed%95%9c-%eb%8c%80%ea%b7%9c%eb%aa%a8-%ed%8a%b8%eb%9e%98%ed%94%bd/
---

스레드 풀의 `max=4`를 보면 작업 네 개를 먼저 실행할 것 같다. 그런데 `core=2`, 큐 크기 `8`을 함께 설정하면 세 번째 작업부터 줄을 선다. 아직 두 명 더 일할 수 있는데도 그렇다.

Java 17에서 작업 열세 개를 제출해 확인했다. `CountDownLatch`로 앞선 작업의 완료를 막았고, 결과는 **접수 12개, 거절 1개**였다. 초당 처리량이 아니라, 빈자리가 생기지 않는 조건에서의 접수 한도다.

## 최대 네 명인데, 일단 두 명만 출근한다

| 제출 순서 | 이 실험에서 가는 곳 | 실행 / 대기 |
| --- | --- | --- |
| 1~2 | 기본 작업자 | 2 / 0 |
| 3~10 | 크기 8의 큐 | 2 / 8까지 증가 |
| 11~12 | 추가 작업자 | 4 / 8 |
| 13 | AbortPolicy가 거절 | 접수되지 않음 |

기본 작업자 수를 채운 다음에는 큐에 넣고, **큐도 찼을 때** 최대 크기까지 작업자를 늘린다. 이 순서는 [ThreadPoolExecutor의 큐 처리 규칙](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)과 같다.

실험에 쓴 풀 설정은 다음과 같다. 전체 실행 코드 중 설정 부분만 발췌했다.

```java
var pool = new ThreadPoolExecutor(
    2, 4, 30, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(8),
    new ThreadPoolExecutor.AbortPolicy());
```

재현할 때는 각 작업이 `gate.await()`에서 기다리도록 하고, 제출한 쪽에서 `RejectedExecutionException`을 센다. 출력 후 `finally`에서 `gate.countDown()`과 `shutdown()`을 호출해 작업을 풀었다. 종료를 5초 기다려도 남으면 `shutdownNow()`로 정리하고 실패 처리했다.

실제 요청은 작업을 마치고 자리를 비운다. 따라서 “이 풀은 항상 열세 번째를 거절한다”로 외우면 안 된다. 이번 실험에서 일부러 막은 것이 바로 그 빈자리다.

## 작업자를 줄였는데 접수는 더 많이 됐다

같은 실험에서 풀 생성만 `Executors.newFixedThreadPool(2)`로 바꿨다.

```text
제한 큐(core=2, max=4, queue=8): accepted=12, rejected=1
고정 풀(작업자 2, 무제한 큐):   accepted=13, rejected=0
```

작업자는 둘로 줄었는데 열세 개를 전부 받았다. 더 빨라진 게 아니라 **기다릴 자리에 제한을 두지 않은 것**이다. 앞의 두 작업이 막혀 있는 동안 나머지 열한 개는 큐에 남는다.

VoiceLink의 `MatchOutboxPublisher`도 `newFixedThreadPool`을 사용한다. `application.yml`의 작업자 수는 8, 한 번 선점하는 배치 크기는 50이다. 작업자 8이라는 값은 아홉 번째를 거절한다는 뜻이 아니고, 배치 50도 실행기 큐 용량을 50으로 제한한 설정은 아니다.

다만 `publishPending()`은 한 배치의 `Future.get()`을 기다린 뒤 끝나고, 다음 예약 실행은 `fixedDelay`로 잡힌다. 이 흐름을 빼고 “매초 50개가 계속 쌓인다”고 설명해도 틀린다.

## 접수증을 완료증으로 주면 곤란하다

알림 API가 작업을 제출한 직후 “발송 완료”를 응답한다고 가정해보자. 첫 실험의 열세 번째는 큐에 들어가지도 못했고, 고정 풀의 열세 번째는 접수됐지만 아직 시작하지 않았다. 두 경우 모두 발송 완료라고 부를 수 없다.

거절됐다면 호출자에게 접수 실패를 알려야 한다. 나중에라도 반드시 처리할 작업이면 메모리 큐 밖에 기록을 남기는 방법도 필요하다. VoiceLink에서 그 기록을 다루는 부분은 [Outbox의 선점과 재시도](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/) 글에 따로 정리했다.

풀 크기를 정하기 전에 API의 성공 응답이 **접수 성공인지, 업무 완료인지**부터 정해두는 편이 좋다. 같은 `accepted=13`도 그 약속에 따라 전혀 다르게 읽힌다.

검증: 2026년 10월 27일 Linux·Java 17.0.20.1에서 두 독립 예제를 실행했다. VoiceLink `46282d5`의 발행기·임대 서비스·설정·관련 테스트와 DB 적용 문서를 대조했다. 이 실험은 작업 접수 비교이며, 서비스 처리량이나 운영 부하를 측정한 결과는 아니다.

- [Java 17 ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- [Java 17 Executors.newFixedThreadPool](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Executors.html#newFixedThreadPool(int))
