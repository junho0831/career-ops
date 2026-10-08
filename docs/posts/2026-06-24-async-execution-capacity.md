---
post_id: 921
title: 열세 번째 작업을 거절한 스레드 풀
description: 끝나지 않는 작업을 열세 개 제출한 Java 실험으로 작업자 수, 큐, 접수 거절과 업무 완료를 구분한다.
date: '2026-06-24'
revised: '2026-10-08'
url: https://so-dak.com/%eb%b0%b1%ec%97%94%eb%93%9c-%ec%95%84%ed%82%a4%ed%85%8d%ec%b2%98-spring-boot-async%ec%99%80-threadpool%ec%9d%84-%ed%99%9c%ec%9a%a9%ed%95%9c-%eb%8c%80%ea%b7%9c%eb%aa%a8-%ed%8a%b8%eb%9e%98%ed%94%bd/
---

스레드 풀의 `max=4`를 보면 작업 네 개를 먼저 실행하고 나머지를 기다리게 할 것 같다. 큐가 있는 풀도 그 순서로 움직일까? Java 17에서 작업 열세 개를 제출해 확인했다.

```text
accepted=12, rejected=1
```

설정은 `core=2`, `max=4`, 큐 크기 `8`이다. 접수 한도만 보기 위해 **앞선 작업이 하나도 끝나지 못하게 막았다.** 이 숫자는 초당 처리량이 아니라 그 상태에서 받아들인 작업 수다.

## 최대 네 명인데, 일단 두 명만 출근한다

| 제출 순서 | 이 실험에서 가는 곳 | 누적 실행/대기 |
| --- | --- | --- |
| 1~2 | 기본 작업자 | 실행 2 |
| 3~10 | 크기 8의 큐 | 실행 2, 대기 8 |
| 11~12 | 최대 크기까지 추가 작업자 | 실행 4, 대기 8 |
| 13 | AbortPolicy 거절 | 접수되지 않음 |

기본 작업자 두 개가 생긴 다음에는 큐에 넣는다. 큐도 찼을 때 최대 크기까지 작업자를 늘린다. 네 작업자가 실행 중이고 여덟 개가 대기하면 다음 제출은 `AbortPolicy`에 의해 거절된다.

눈여겨볼 건 3번 작업이다. 최대 작업자 수에 여유가 있어도 큐로 간다. 따라서 최대 크기만 늘려 놓고 곧바로 병렬 실행이 늘어나길 기대하면 어긋날 수 있다. 실제 서비스에서는 앞 작업이 끝나 빈자리가 생기는 속도도 함께 작용한다.

## 끝나지 않는 작업으로 접수 한도를 확인했다

다음 독립 실행 예제는 `CountDownLatch`로 작업 완료를 막는다. 출력 후에는 대기를 풀고 풀을 종료한다.

```java
import java.util.concurrent.*;

public class AsyncCapacityDemo {
    public static void main(String[] args) throws Exception {
        var gate = new CountDownLatch(1);
        var pool = new ThreadPoolExecutor(
            2, 4, 30, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(8),
            new ThreadPoolExecutor.AbortPolicy());
        int accepted = 0;
        int rejected = 0;
        try {
            for (int i = 0; i < 13; i++) {
                try {
                    pool.execute(() -> {
                        try {
                            gate.await();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    });
                    accepted++;
                } catch (RejectedExecutionException e) {
                    rejected++;
                }
            }
            System.out.println("accepted=" + accepted + ", rejected=" + rejected);
        } finally {
            gate.countDown();
            pool.shutdown();
            if (!pool.awaitTermination(5, TimeUnit.SECONDS)) {
                pool.shutdownNow();
                throw new IllegalStateException("Worker shutdown timed out");
            }
        }
    }
}
```

출력이 찍힐 때 실행 중인 네 작업은 `gate.await()`에서 막혀 있고, 나머지 여덟 작업은 큐에 남아 있다. **`accepted=12`는 접수증이지 완료증이 아니다.** 이 차이는 호출자에게 언제 성공을 응답할지 정할 때 중요해진다.

## 알림 열세 번째가 거절됐다면

설명용으로 알림 발송 API를 생각해보자. 열세 번째 작업은 큐에 들어가지도 못했다. 호출부가 거절 예외를 삼키고 “발송 완료”를 응답하면 나중에 실행될 작업도 없다.

따라서 접수 실패를 호출자에게 알리거나 다시 처리할 수 있게 저장해야 한다. 메모리 큐에 접수된 작업도 프로세스가 종료되면 사라질 수 있다. 꼭 남아야 하는 작업이라면 영속 기록과 복구가 별도로 필요하다.

[VoiceLink의 Outbox](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)는 고정 작업자 풀에 배치를 제출하고, DB에는 선점 상태와 임대를 남긴다. 이 실험의 제한 큐와 동일한 구조가 아니다. 풀 크기만 보고 대기열도 제한돼 있다고 설명할 수는 없다.

접수된 작업을 다시 시도할 때는 첫 실행이 늦게 완료될 수도 있다. **기다리기를 끝냈다는 이유로 작업까지 취소됐다고 보면 안 된다.**

이 실험에서 먼저 정할 것은 작업자 수보다 거절 이후의 처리다. 즉시 실패를 알릴지, 기록을 남겨 다시 처리할지 결정하지 않으면 풀 크기를 늘려도 같은 질문이 뒤로 밀릴 뿐이다.

## 참고 자료

- [Java 17 ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- [Java 17 Future](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Future.html)
- [Spring 작업 실행과 스케줄링](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)

근거: 위 Java 17 예제를 2026-10-08 다시 실행해 `accepted=12, rejected=1`을 확인했다. VoiceLink `1704b46`의 Outbox 작업자·임대 서비스·관련 테스트도 대조했다. 운영 부하 측정은 아니다.
