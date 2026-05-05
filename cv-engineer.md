# 박준호 | 백엔드 개발자

> 운영 중인 실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고, Redis·LiveKit·Nginx·Docker 기반 운영 환경까지 직접 구축한 백엔드 개발자
Spring Boot, Redis Lua Script, DB Outbox, LiveKit, Docker, Nginx 기반으로 실시간 매칭 상태 관리, 세션 정합성, WebRTC 연결, 배포·운영 이슈를 코드와 운영 환경 양쪽에서 직접 설계하고 해결합니다. Redis를 fast path, DB를 source of truth로 분리해 실시간 매칭 상태와 세션 종료 정합성을 설계했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 1인 운영 | 60% | 30% |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 실시간 서비스 1인 운영 | CI/CD 자동화로 배포 시간 단축 | 테스트 코드 도입으로 장애 재발률 감소 |

- Spring Boot, Redis, LiveKit, Docker, Nginx 기반 실시간 매칭·통화 서비스를 설계부터 배포·운영까지 1인으로 구축
- 회사 업무에서는 Spring 기반 업무 시스템, 공통 예외/검증 정책, Elasticsearch fallback, Redis 인증, CI/CD 배포 표준화, 배치 자동화를 수행
- Redis Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub 결과 전파, `CallSession.ended_at` 기준 세션 정합성으로 stale match·유령 세션·재매칭 먹통 문제를 해결
- 동시성 상황에서 트랜잭션, 락, unique constraint, DB Outbox 패턴으로 정합성을 보장한 경험 보유
- 설계 -> 구현 -> 배포 -> 운영까지 전 과정을 책임지고 수행

---

# 대표 프로젝트

## VoiceLink - 실시간 매칭·통화 서비스

📅 `2024 ~ 현재` · 개인 서비스 (1인 개발·운영)

`Java` `Spring Boot` `Redis` `Lua Script` `DB Outbox` `Pub/Sub` `LiveKit` `Docker` `Nginx` `CI/CD` `WebRTC`

서비스: https://voice-link.co.kr

> 랜덤 음성 매칭을 제공하는 실시간 통화 서비스입니다. 기획부터 백엔드 API, Redis Lua Script 기반 매칭 큐, LiveKit/WebRTC 음성 연결, TURN/STUN, Docker 배포, Nginx/SSL/도메인 운영까지 전 과정을 1인으로 구축하고 운영했습니다. 특히 재매칭 시 stale match, 유령 세션, 연결 종료 누락 같은 실시간 세션 정합성 문제를 코드와 운영 구조 양쪽에서 해결했습니다.
>

### 문제

- 실시간 매칭에서 취소 직후 stale 결과가 다시 반환되거나, 종료되지 않은 세션이 재매칭 시 충돌하는 동시성 문제가 발생
- WebRTC 기반 통화 연결은 애플리케이션 코드뿐 아니라 네트워크, TURN/STUN, 방화벽, 포트포워딩, HTTPS, 도메인/SNI 설정까지 함께 맞아야 안정적으로 동작
- 로컬에서만 동작하는 프로젝트가 아니라 실제 운영 가능한 서비스로 배포하기 위해 운영 중 장애 원인을 직접 추적해야 했음

### 해결

- Redis ZSET 대기열과 Presence TTL을 분리하고, Lua Script 기반 Atomic Claim으로 후보 조회·선점·presence 삭제를 단일 원자 연산으로 묶어 동일 후보 중복 선점 Race Condition을 차단
- Cancel Marker를 매칭 확정 전·결과 발행 전 재검증하고, 취소 시 `markCancelled -> discardMatchResult -> removeAndComplete` 순서로 stale 결과 캐시와 대기열 상태를 즉시 폐기
- 매칭 결과 전달을 DB Outbox + Redis Pub/Sub + TTL result key 구조로 분리하고, Outbox 발행은 `FOR UPDATE SKIP LOCKED`로 작업을 선점해 Pub/Sub 유실이나 노드 재시작 상황에서도 다음 `/connect`에서 결과를 회수할 수 있도록 설계
- `DeferredResult` 현재 연결 기준 정리, LiveKit webhook 종료 처리, `PESSIMISTIC_WRITE` 기반 세션 종료 직렬화, 참가자 수 기반 활성 세션 검증을 적용해 유령 세션 진입과 통화 종료 후 재매칭 먹통 문제를 해결
- 홈서버에 Docker 기반 런타임을 직접 구성하고, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 운영 환경 전체를 설계
- self-hosted runner에서 Redis/LiveKit은 유지하고 애플리케이션만 교체하는 배포 흐름으로 운영 중단 위험을 줄임

### 성과

- 단순 CRUD가 아닌 동시성, 실시간성, WebRTC 네트워크, 운영 인프라 이슈가 포함된 실서비스를 직접 구축·운영
- Redis Lua Script 기반 Atomic Claim, Cancel Marker, DB Outbox + Redis Pub/Sub, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` source of truth를 결합해 stale match, 중복 매칭, 유령 세션, 종료 후 재매칭 충돌을 구조적으로 해결
- `https://voice-link.co.kr` 도메인으로 실제 접속 가능한 서비스를 상시 운영한 경험 확보
- 장애 발생 시 API, Redis 상태, LiveKit 연결, 네트워크, Nginx, SSL, DNS, 포트포워딩까지 이어지는 운영 디버깅 경험 축적

---

# 경력

## 엔셀 - Prism

📅 `2026.02 ~ 현재`

`Python` `Airflow` `SQLite` `FTP`

- Java 기반 FTP 파일 처리 배치를 Python/Airflow 구조로 마이그레이션
- 입력일+전날 FTP 폴더 스캔, 업로드/DB commit 성공 후 원본 삭제, Rupi `source_file` unique + upsert 구조로 재실행 리스크를 줄인 파일 처리 흐름 구축

## 엔셀 - DataForge

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- Elasticsearch 비활성/검색 예외 상황에서 DB fallback 검색으로 전환해 서비스 연속성 확보
- `requester_id`, `start_at`, `status` 인덱스와 `(requester_id, start_at, end_at)`, `overtime_approvals.request_id` unique constraint로 조회 성능과 중복 데이터 방지 정합성을 함께 고려
- JWT + Redis 기반 인증 설계로 Refresh Token 저장/검증/회전/삭제 흐름을 TTL 기반으로 일관화
- 관리자 API, 표준 오류 응답, 알림 메일, 전체 재색인, 선택적 시트 CSV 동기화 흐름을 묶어 운영 가능한 업무 시스템으로 확장

## 엔셀 - SMIP 유지보수

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- 공통 예외 처리 계층과 데이터 검증 정책으로 장애 원인 추적 경로 표준화
- 표준 오류 응답/검증 메시지 기준과 JUnit5/Mockito 회귀 테스트를 적용해 동일 장애 재발 가능성이 높은 케이스를 배포 전 검증
- MVVM + Store 구조로 UI 상태 흐름을 분리하고 인수인계 가능한 형태로 문서화

## 헥토 - AI/개발팀

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- LangChain·RAG 기반 사내 문서 검색 기능 구현
- GitLab CI/CD + Docker 기반 빌드·테스트·배포 자동화 파이프라인 구축
- Nginx + Staging 환경 표준화로 배포 전 검증 절차와 API 협업 흐름을 반복 가능한 형태로 정리

## 헥토 - 세이프캐시 마이데이터개발팀

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

- 정기 데이터 동기화 배치를 자동화하고 실행 이력/결과 로깅을 추가해 이상 인지 지연을 줄임
- Admin UI/API에서 조회·수정·재처리 흐름을 통합해 데이터 이상 발생 시 운영자가 직접 복구할 수 있는 경로 마련

---

**GitHub** https://github.com/junho0831
