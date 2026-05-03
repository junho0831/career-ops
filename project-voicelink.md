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
- WebRTC 연결을 위해 필요한 TURN/STUN, SSL, DNS, 포트포워딩, Nginx 라우팅 문제

## 핵심 구현 근거

### 1. Redis Lua Script 기반 매칭 큐 원자성

- `WAITING -> MATCHED -> CONNECTING -> ENDED/CANCELED` 흐름으로 상태 관리
- Redis ZSET + presence TTL로 대기열을 구성
- `find_opponent.lua`에서 후보 조회, 자기 자신 제외, `ZREM` 기반 선점, presence 검증/삭제를 하나의 Lua Script로 처리
- `purge_user.lua`로 ZSET 제거와 presence 삭제를 한 번에 수행
- 취소 시 `markCancelled -> discardMatchResult -> removeAndComplete` 순서로 stale 결과를 즉시 폐기
- 근거:
  - [RedisMatchingStore.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/infrastructure/RedisMatchingStore.java:34)
  - [find_opponent.lua](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/resources/scripts/find_opponent.lua:1)
  - [purge_user.lua](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/resources/scripts/purge_user.lua:1)
  - [MatchService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/MatchService.java:98)

### 2. 재매칭 레이스와 유령 세션 완화

- `DeferredResult` 현재 연결 기준으로만 대기열 정리
- 이전 연결 종료 콜백이 새 연결을 제거하지 않도록 처리
- 근거:
  - [MatchService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/match/service/MatchService.java:104)
  - [match_provider.dart](/Users/parkjunho/IdeaProjects/VoiceLink/frontend/lib/src/features/match/application/match_provider.dart:28)

### 3. LiveKit webhook 기반 세션 종료 처리

- `room_finished`, `participant_left`, `participant_disconnected` 이벤트를 종료 트리거로 처리
- 근거:
  - [LiveKitWebhookService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/livekit/LiveKitWebhookService.java:36)

### 4. 참가자 수 기반 활성 세션 검증

- 참가자 수가 2명 미만이면 비정상 세션으로 판단
- 재접속/재매칭 전에 종료되지 않은 세션 진입을 방지
- 근거:
  - [LiveKitRoomStateService.java](/Users/parkjunho/IdeaProjects/VoiceLink/src/main/java/kr/co/voicelink/livekit/LiveKitRoomStateService.java:34)

### 5. self-hosted 배포 운영

- self-hosted GitHub Actions runner에서 Redis/LiveKit은 유지하고 앱만 교체 배포
- 운영 중단 위험을 줄이기 위해 공유 서비스와 애플리케이션 재배포 단계를 분리
- 근거:
  - [deploy.yml](/Users/parkjunho/IdeaProjects/VoiceLink/.github/workflows/deploy.yml:1)

### 6. 운영 인프라와 네트워크

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

실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고, Redis·LiveKit·Nginx·Docker 기반 운영 환경까지 직접 구축했습니다. 매칭 취소 직후 과거 결과가 재노출되는 문제와 통화 종료 후 재매칭 시 유령 세션에 진입하는 동시성 이슈를 해결하기 위해, Redis Lua Script 기반 원자적 후보 선점, 취소 시 결과 캐시 즉시 폐기, 현재 연결 기준 대기열 정리, LiveKit webhook 기반 세션 종료 처리, 참가자 수 기반 활성 세션 검증 로직을 적용했습니다.

## HR용 짧은 문장

실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고 배포·운영까지 직접 맡았습니다. 운영 과정에서 재매칭 오류와 세션 충돌 문제를 추적하고 안정화했습니다.

## 면접용 30초 답변

VoiceLink는 제가 1인 개발한 실시간 매칭·통화 서비스입니다. 단순히 기능 구현만 한 게 아니라 Redis Lua Script 기반 매칭 큐, LiveKit/WebRTC 연결, Nginx·Docker 운영 환경까지 직접 구성했습니다. 운영 중에는 취소 직후 과거 결과가 다시 보이거나 통화 종료 후 재매칭이 꼬이는 문제가 있었는데, Lua Script로 후보 선점을 원자화하고, 취소 시 결과 캐시 즉시 폐기, 현재 연결 기준 대기열 정리, LiveKit webhook 종료 처리, 참가자 수 검증 로직을 넣어서 세션 정합성을 안정화했습니다.
