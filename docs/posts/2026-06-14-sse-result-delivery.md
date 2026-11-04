---
post_id: 704
title: SSE는 서버를 건너도 연결 객체는 건너가지 않는다
description: 서버 B에서 만든 매칭 결과가 브로커와 서버 A의 로컬 대기를 거쳐 앱에 도착하는 과정, 전달을 놓쳤을 때의 조회 경로를 설명한다.
date: '2026-06-14'
evidence_review: 'VoiceLink 46282d5 (2026-11-01)'
revised: '2026-11-05'
url: https://so-dak.com/spring-boot-sseserver-sent-events%eb%a1%9c-%ec%8b%a4%ec%8b%9c%ea%b0%84-%eb%a7%a4%ec%b9%ad-%ec%83%81%ed%83%9c-%ed%91%b8%ec%8b%9c-%ea%b5%ac%ed%98%84%ed%95%98%ea%b8%b0/
---

사용자는 서버 A에 연결돼 있는데 매칭은 서버 B에서 끝났다고 하자. B가 “상대 찾았어요”를 만들어도 A의 연결 객체에 바로 쓸 수는 없다. 그 객체는 A의 메모리에 있다.

**서버 사이로 보내야 할 것은 매칭 결과다.** VoiceLink의 Java 17·Spring Boot 3.2.5 구현을 두 서버 예시로 따라가 보자.

```mermaid
flowchart TD
 B["서버 B · 매칭 결과 생성"] --> M["RabbitMQ · 각 서버로 전달"]
 M --> A["서버 A · 사용자 ID로<br/>로컬 대기 요청 찾기"]
 A --> S["현재 연결에 결과 반영"]
 S --> E["SSE match 이벤트"]
 E --> P["앱 · 이벤트 읽기"]
```

그림에는 A로 이어지는 경로만 표시했다. 브로커는 다른 서버의 큐에도 같은 결과를 전달한다.

## 결과는 여러 서버에, 응답은 연결이 있는 서버에서

B는 사용자 ID와 매칭 결과를 RabbitMQ에 보낸다. 브로커는 각 서버의 큐에 같은 결과를 전달한다. 이를 fanout이라고 한다. B가 사용자의 연결 위치까지 찾아서 A를 지정할 필요는 없다.

A는 사용자 ID로 자기 메모리의 대기 요청을 찾아 결과를 넣는다. 다른 서버에도 알림은 도착하지만, 그 사용자의 대기 요청이 없으면 완료할 요청도 없다. **같은 소식을 받아도 응답할 연결은 A가 가지고 있다.**

A의 `MatchStreamSession`은 이 결과를 SSE의 `event: match`로 쓴다. 상태가 `MATCHED`이면 스트림을 끝내고, `WAITING`이면 다음 대기를 예약한다.

앱의 `MatchSseParser`가 그 이벤트의 JSON을 읽으면 매칭 결과를 사용할 수 있다. `: ping`은 연결을 유지하기 위한 주석이라 건너뛴다. 여기까지가 B에서 만든 결과가 앱에 도착하는 길이다.

## 중간에 끊겼다면

RabbitMQ 발행이 실패하면 Redis Pub/Sub로 한 번 더 시도하고, 둘 다 실패하면 예외를 올린다. 다만 첫 메시지는 전달됐는데 발행 확인만 유실된 경우에는 결과가 중복 도착할 수 있다. **브로커의 발행 확인은 앱의 수신 확인도 아니다.**

사용자가 연결을 끊은 사이 알림이 도착할 수도 있다. [Outbox 워커](https://so-dak.com/%eb%b6%84%ec%82%b0-%ec%8b%9c%ec%8a%a4%ed%85%9c-%ec%a0%95%ed%95%a9%ec%84%b1-%eb%b3%b4%ec%9e%a5-transactional-outbox-pattern%ec%9c%bc%eb%a1%9c-%eb%a7%a4%ec%b9%ad-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%eb%b0%9c/)는 발행 전에 결과를 Redis 캐시에도 남긴다. 그렇다고 재조회가 캐시부터 읽는 것은 아니다. `MatchService.connect()`는 다음 순서로 찾는다.

1. 재사용할 활성 세션이 있으면 그 세션의 응답을 다시 만든다.
2. 없으면 결과 캐시를 읽고, 거기에 담긴 세션이 종료되지 않았는지 확인한다.
3. 기존 결과를 쓸 수 없을 때 새 매칭으로 넘어간다.

**캐시가 비어 있어도 이미 만든 통화방은 있을 수 있다.** 그래서 첫 단계가 필요하다. 캐시는 기본 55초 뒤 만료되며 서버가 대기 요청을 완료하면서 지울 수도 있다. 앱이 읽을 때까지 보관하는 우편함은 아니다.

SSE는 지금 연결된 앱에 결과를 전하고, 재조회는 **알림을 놓친 앱이 이미 만들어진 세션을 찾게 한다.** 둘은 맡은 일이 다르다. 이 조회 경로가 있다고 모든 끊김이 복구되거나 결과가 딱 한 번만 반영된다는 뜻은 아니다.

## 참고 자료

- [SSE 표준](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [RabbitMQ 발행 확인과 소비 확인](https://www.rabbitmq.com/docs/confirms)
- [Redis Pub/Sub 전달 특성](https://redis.io/docs/latest/develop/pubsub/)

근거: 2026-10-15 VoiceLink `37109d5`의 발행·수신·SSE·캐시 코드, `MatchService`·활성 세션 조회와 관련 테스트, Flutter 파서와 매칭 흐름 문서를 대조했다. 10월 12일 Linux·Java 17에서 통과한 관련 테스트 31개는 대역·가상 시간 검증이며 실제 다중 서버 장애나 앱 화면의 중복 전환 시험은 포함하지 않았다.
