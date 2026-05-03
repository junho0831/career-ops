# VoiceLink Project Record

이 문서는 `VoiceLink`를 이력서, 포트폴리오, 면접에서 일관되게 설명하기 위한 기록용 문서다.

레포지토리:
- `/Users/parkjunho/IdeaProjects/VoiceLink`
- 서비스: https://voice-link.co.kr

---

## 프로젝트 한 줄

실시간 매칭·통화 서비스 `VoiceLink`를 1인 개발하고, Redis·LiveKit·Nginx·Docker 기반 운영 환경까지 직접 구축하며 실시간 세션 정합성 문제를 해결했다.

## 어떤 문제를 풀었는가

- 랜덤 음성 매칭과 1:1 실시간 통화 연결
- 취소 직후 과거 매칭 결과가 다시 노출되는 `stale match`
- 통화 종료 후 재매칭 시 이전 세션으로 잘못 진입하는 `유령 세션`
- 사용자가 나갔다가 바로 다시 들어올 때 이전 SSE 종료 콜백이 새 대기열을 제거하는 레이스
- Pub/Sub 유실 또는 노드 재시작 시 매칭 결과 전달이 누락될 수 있는 문제
- LiveKit webhook, 사용자의 `/match/end`, DB 세션 상태가 서로 엇갈릴 때 active session 재사용이 발생할 수 있는 문제
- 통화 종료/연장 이벤트가 브라우저 또는 프록시 idle timeout으로 유실될 수 있는 문제
- Docker 내부망과 외부 클라이언트망에서 LiveKit URL이 달라 서버 API 호출이 실패할 수 있는 문제
- WebRTC 연결을 위해 필요한 TURN/STUN, SSL, DNS, 포트포워딩, Nginx 라우팅 문제

## 핵심 구현 근거

### 1. Redis Lua Script 기반 매칭 큐 원자성

- `WAITING -> MATCHED -> CONNECTING -> ENDED/CANCELED` 흐름으로 상태 관리
- Redis ZSET + presence TTL로 대기열을 구성
- `find_opponent.lua`에서 후보 조회, 자기 자신 제외, `ZREM` 기반 선점, presence 검증/삭제를 하나의 Lua Script로 처리
- `purge_user.lua`로 ZSET 제거와 presence 삭제를 한 번에 수행
- 근거:
  - [RedisMatchingStore.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/infrastructure/RedisMatchingStore.java:34)
  - [find_opponent.lua](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/resources/scripts/find_opponent.lua:1)
  - [purge_user.lua](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/resources/scripts/purge_user.lua:1)

### 2. Cancel Marker 기반 경합 방어

- 취소 시 `markCancelled -> discardMatchResult -> removeAndComplete` 순서로 stale 결과를 즉시 폐기
- 매칭 확정 전·결과 발행 전 Cancel Marker를 재검증해 취소 사용자가 신규 매칭 결과를 받지 않도록 처리
- 취소 감지 시 세션을 조용히 종료하고 양쪽 결과 키를 폐기
- 근거:
  - [MatchService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/MatchService.java:98)
  - [MatchFinalizer.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/MatchFinalizer.java:74)
  - [MatchOutboxPublisher.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/outbox/MatchOutboxPublisher.java:99)

### 3. DB Outbox + Redis Pub/Sub 결과 전파

- 매칭 확정과 결과 전달을 분리하기 위해 DB Outbox에 사용자별 결과를 저장
- publisher가 outbox를 잠금 조회한 뒤 Redis TTL result key에 저장하고 Pub/Sub 채널로 전파
- Pub/Sub 메시지를 놓쳐도 다음 `/connect`에서 `claimMatchResult`로 TTL result key를 회수 가능
- 근거:
  - [MatchOutbox.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/outbox/MatchOutbox.java:13)
  - [MatchOutboxPublisher.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/outbox/MatchOutboxPublisher.java:52)
  - [RedisMatchingStore.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/infrastructure/RedisMatchingStore.java:109)
  - [MatchingQueue.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/infrastructure/MatchingQueue.java:101)

### 4. 재매칭 레이스와 유령 세션 해결

- `DeferredResult` 현재 연결 기준으로만 대기열 정리
- 이전 연결 종료 콜백이 새 연결을 제거하지 않도록 처리
- 근거:
  - [MatchService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/MatchService.java:104)
  - [match_provider.dart](/Users/parkjunho/IdeaProjects/VoiceLink/frontend/lib/src/features/match/application/match_provider.dart:28)

### 5. CallSession.ended_at 기준 세션 정합성

- LiveKit webhook과 `/match/end`가 모두 `CallSession.ended_at`을 기록하도록 통합
- `ended_at is null`인 세션만 active session으로 재사용
- 종료 처리 시 `findBySessionIdForUpdate`로 세션을 잠금 조회해 중복 종료/중복 히스토리 기록을 방지
- 근거:
  - [CallSession.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/call/domain/CallSession.java:42)
  - [CallService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/call/service/CallService.java:25)
  - [CallSessionRepository.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/call/repository/CallSessionRepository.java:25)
  - [ActiveSessionResolver.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/ActiveSessionResolver.java:30)

### 6. LiveKit webhook 기반 세션 종료 처리

- `room_finished`, `participant_left`, `participant_disconnected` 이벤트를 종료 트리거로 처리
- 근거:
  - [LiveKitWebhookService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/livekit/LiveKitWebhookService.java:36)

### 7. 참가자 수 기반 활성 세션 검증

- 참가자 수가 2명 미만이면 비정상 세션으로 판단
- 재접속/재매칭 전에 종료되지 않은 세션 진입을 방지
- 근거:
  - [LiveKitRoomStateService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/livekit/LiveKitRoomStateService.java:34)

### 8. 통화 이벤트 SSE와 연장 흐름

- `/api/match/call-events`를 매칭 SSE와 분리해 통화 종료/연장 이벤트 전파
- 20초 heartbeat comment ping과 프런트 재구독 backoff로 idle timeout과 일시 네트워크 단절에 대응
- 통화 연장은 양쪽 동의 기반으로 처리하고, 확정 시 `CALL_EXTENDED(300초)`를 양쪽에 발행
- 종료 이벤트는 DB 커밋 이후 `CallSessionEndedEventHandler`가 `CALL_ENDED`를 전파하도록 분리
- 근거:
  - [CallEventStreamingService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/CallEventStreamingService.java:1)
  - [CallExtensionService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/CallExtensionService.java:1)
  - [CallSessionEndedEventHandler.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/CallSessionEndedEventHandler.java:1)

### 9. LiveKit 내부/외부 URL 분리

- 클라이언트용 `LIVEKIT_URL`과 백엔드 RoomService API용 `LIVEKIT_API_URL`을 분리
- 운영에서는 외부 WebSocket/TLS URL과 Docker 내부 HTTP API URL을 다르게 사용해 서버 내부 LiveKit 호출 실패를 방지
- 근거:
  - [server-architecture.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/server-architecture.md:1)
  - [LiveKitRoomStateService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/livekit/LiveKitRoomStateService.java:58)

### 10. TURN/STUN과 제한망 대응

- STUN으로 공인 후보를 확보하고, 직접 연결 실패 시 TURN relay 후보로 우회
- 제한적 네트워크를 고려해 TURN UDP/TCP 3478과 TURN/TLS 443 구성을 문서화
- LiveKit 시그널링, RTC 포트, TURN relay 포트를 분리해 운영 체크리스트로 관리
- 근거:
  - [turn-stun-flow.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/turn-stun-flow.md:1)
  - [coturn-setup.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/coturn-setup.md:1)

### 11. self-hosted 배포 운영

- self-hosted GitHub Actions runner에서 Redis/LiveKit은 유지하고 앱만 교체 배포
- 운영 중단 위험을 줄이기 위해 공유 서비스와 애플리케이션 재배포 단계를 분리
- 근거:
  - [deploy.yml](/Users/parkjunho/IdeaProjects/VoiceLink/.github/workflows/deploy.yml:1)

### 12. 운영 인프라와 네트워크

- Nginx 경로 기반 프록시(`/`, `/api`, `/rtc`)
- TURN 서버, 포트포워딩, DNS, SSL 구성
- 근거:
  - [server-architecture.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/server-architecture.md:1)
  - [coturn-setup.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/coturn-setup.md:1)
  - [nginx-current-configuration.md](/Users/parkjunho/IdeaProjects/VoiceLink/docs/nginx-current-configuration.md:1)

## 대표 커밋

- `e3f997d` fix: 통화 종료 직후 재매칭 시 발생하는 동시성 버그(유령방 진입) 해결
- `d93f45e` fix: 통화 종료 후 '다시 연결하기' 시 매칭이 먹통되는 버그 해결
- `9721206` 배포 워크플로 개선 및 Redis Lua/LiveKit webhook 중심 세션 종료 보완
- `4d9a962` fix: 통화 종료 SSE 이벤트 구현 및 클라이언트 대응 로직 추가

## 이력서용 문장

실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고, Redis·LiveKit·Nginx·Docker 기반 운영 환경까지 직접 구축했습니다. 매칭 취소 직후 과거 결과가 재노출되는 문제와 통화 종료 후 재매칭 시 유령 세션에 진입하는 동시성 이슈를 해결하기 위해, Redis Lua Script 기반 Atomic Claim, Cancel Marker 재검증, DB Outbox + Redis Pub/Sub + TTL result key 결과 전파, 현재 연결 기준 대기열 정리, `CallSession.ended_at` 기준 세션 종료 처리, LiveKit webhook, 참가자 수 기반 활성 세션 검증 로직을 적용했습니다. 통화 이벤트는 별도 SSE와 heartbeat/reconnect로 분리했고, LiveKit 내부/외부 URL 및 TURN/TLS 구성을 분리해 실제 네트워크 환경에서의 연결 실패를 추적 가능하게 만들었습니다.

## HR용 짧은 문장

실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고 배포·운영까지 직접 맡았습니다. 운영 과정에서 재매칭 오류와 세션 충돌 문제를 추적하고 안정화했습니다.

## 면접용 30초 답변

VoiceLink는 제가 1인 개발한 실시간 매칭·통화 서비스입니다. 단순히 기능 구현만 한 게 아니라 Redis Lua Script 기반 매칭 큐, DB Outbox + Redis Pub/Sub 결과 전파, LiveKit/WebRTC 연결, Nginx·Docker 운영 환경까지 직접 구성했습니다. 운영 중에는 취소 직후 과거 결과가 다시 보이거나 통화 종료 후 재매칭이 꼬이는 문제가 있었는데, Lua Script로 후보 선점을 원자화하고, Cancel Marker와 TTL result key로 stale 결과를 정리했으며, `CallSession.ended_at`을 최종 세션 상태로 두고 LiveKit webhook/참가자 수 검증을 결합해 세션 정합성을 안정화했습니다. 또한 `/call-events` SSE, heartbeat/reconnect, TURN/TLS 443, LiveKit 내부 API URL 분리까지 다루며 실시간 서비스 운영 범위를 코드 밖 네트워크 계층까지 확장했습니다.
