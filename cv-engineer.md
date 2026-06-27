# 박준호 | 백엔드 개발자

> Spring Boot 기반 업무 시스템에서 검색 fallback, Redis 인증, RDB 제약조건, 공통 예외 처리, 배치 재실행 안정성을 개선해온 백엔드 개발자
회사 업무에서는 Elasticsearch 예외 시 DB fallback, Refresh Token Redis TTL 관리, RDB index/unique constraint, GlobalExceptionHandler/validation, GitLab CI/CD, Airflow FTP batch, ER Dose RAW/EUV 로그 파싱 배치를 다뤘습니다. VoiceLink에서는 Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`로 실시간 매칭/세션 정합성을 구현했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 운영형 백엔드 | 60% | 30% |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 장애·정합성·배치 개선 | CI/CD 자동화로 배포 시간 단축 | 테스트 코드 도입으로 장애 재발률 감소 |

- 회사 업무에서 Spring 기반 관리자 API, 공통 예외/검증 정책, Elasticsearch fallback, Redis 인증, CI/CD 배포 표준화, Airflow 배치, 운영 로그 파싱 구조화를 구현
- 야근 신청/승인, 직원 관리, 검색 인덱스, 알림, 재처리 기능을 API, transaction, index, unique constraint 기준으로 설계
- Spring Boot, Redis, LiveKit, Docker, Nginx 기반 실시간 매칭·통화 서비스를 설계부터 배포·운영까지 1인으로 구축
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
- WebRTC 기반 통화 연결은 애플리케이션 코드뿐 아니라 네트워크, TURN/STUN, 방화벽, 포트포워딩, HTTPS, 도메인/SNI 설정까지 함께 맞아야 동작
- 로컬 실행을 넘어 실제 도메인으로 서비스하기 위해 API, Redis, LiveKit, Nginx, SSL, DNS 로그를 함께 추적해야 했음

### 해결

- Redis ZSET 대기열과 Presence TTL을 분리하고, Lua Script 기반 Atomic Claim으로 후보 조회·선점·presence 삭제를 단일 원자 연산으로 묶어 동일 후보 중복 선점 Race Condition을 차단
- Cancel Marker를 매칭 확정 전·결과 발행 전 재검증하고, 취소 시 `markCancelled -> discardMatchResult -> removeAndComplete` 순서로 stale 결과 캐시와 대기열 상태를 즉시 폐기
- 매칭 결과 전달을 DB Outbox + Redis Pub/Sub + TTL result key 구조로 분리하고, Outbox 발행은 `FOR UPDATE SKIP LOCKED`로 작업을 선점해 Pub/Sub 유실이나 노드 재시작 상황에서도 다음 `/connect`에서 결과를 회수할 수 있도록 설계
- `DeferredResult` 현재 연결 기준 정리, LiveKit webhook 종료 처리, `PESSIMISTIC_WRITE` 기반 세션 종료 직렬화, 참가자 수 기반 활성 세션 검증을 적용해 유령 세션 진입과 통화 종료 후 재매칭 먹통 문제를 해결
- 홈서버에 Docker 기반 런타임을 직접 구성하고, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 운영 환경 전체를 설계
- self-hosted runner에서 Redis/LiveKit 컨테이너와 애플리케이션 컨테이너를 분리해 애플리케이션만 교체 배포

### 성과

- 단순 CRUD가 아닌 동시성, 실시간성, WebRTC 네트워크, 운영 인프라 이슈가 포함된 실서비스를 직접 구축·운영
- Redis Lua Script 기반 Atomic Claim, Cancel Marker, DB Outbox + Redis Pub/Sub, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` source of truth를 결합해 stale match, 중복 매칭, 유령 세션, 종료 후 재매칭 충돌을 구조적으로 해결
- `https://voice-link.co.kr` 도메인으로 실제 접속 가능한 서비스를 상시 운영한 경험 확보
- 장애 발생 시 API, Redis 상태, LiveKit 연결, 네트워크, Nginx, SSL, DNS, 포트포워딩까지 이어지는 운영 디버깅 경험 축적

---

# 경력

## 엔셀 - Prism Airflow FTP Batch Migration

📅 `2026.02 ~ 현재`

`Python` `Airflow` `SQLite` `FTP`

- Java 기반 FTP 파일 처리 배치를 Python/Airflow DAG로 마이그레이션
- `mbeat.er_data_raw` RAW warning 파싱과 `mbeat.er_data_raw_euv` root cause 파싱을 별도 실행 경로로 분리하고, EUV `contents`를 구조화 컬럼으로 적재하는 배치를 구현
- `Root clause`, `Exposesue I D`, 문자열 `\\n`, 단위 제거, `3.0 -> 3` 정수 변환 같은 운영 데이터 변형을 파서에 반영하고, 개별 필드 실패 시 `NULL` 처리로 전체 row 유실을 방지
- `max_active_runs=1`, `catchup=False`로 중복 실행을 제한하고, 입력일+전날 FTP 폴더를 함께 스캔해 날짜 경계 파일을 처리
- 업로드 성공과 DB commit 이후 FTP 원본을 삭제하도록 순서를 고정하고, Rupi `source_file` unique + upsert로 동일 파일 중복 적재를 방지
- FTP 다운로드/업로드 크기 검증과 scratch 파일 cleanup을 넣어 실패 지점을 파일 처리 단계별로 추적
- `chunk 조회 -> 파싱 -> 파티션 COPY 적재` 반복 구조와 chunk별 처리량 로그로 대용량 로그 파싱 배치의 메모리 사용량과 운영 관측성을 정리

## 엔셀 - DataForge Spring 검색/인증/관리 API

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- Elasticsearch 비활성/검색 예외 발생 시 DB fallback 검색으로 전환하고, ES/DB 응답 스키마를 맞춰 권한 스코프와 정렬 정책을 유지
- `requester_id`, `start_at`, `status` 인덱스와 `(requester_id, start_at, end_at)`, `overtime_approvals.request_id` unique constraint로 조회 성능과 중복 데이터 방지 정합성을 함께 고려
- Refresh Token 저장/검증/회전/삭제를 Redis TTL 기반으로 일원화해 로그인/갱신/로그아웃 상태 기준을 단순화
- 직원 부서/직책/비밀번호 변경 API를 `@Transactional` 경계 안에서 처리하고, 알림 메일/전체 재색인/선택적 CSV 동기화 기능을 연결
- `GlobalExceptionHandler`와 validation 실패 응답을 표준화해 프론트엔드가 동일한 오류 포맷으로 처리하도록 정리

## 엔셀 - SMIP Spring 공통 예외 처리 및 회귀 테스트

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- API별로 흩어진 예외 처리를 공통 예외 처리 계층과 표준 오류 응답으로 통합
- validation 메시지와 오류 코드를 맞추고, 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정
- Vue 화면 상태를 MVVM + Store 구조로 분리해 UI 상태 변경 영향 범위를 줄이고 인수인계 문서에 반영
- 동일 오류를 담당자 기억이 아니라 테스트와 문서로 재현·분석·수정할 수 있게 정리

## 헥토 - KMS CI/CD 표준화 및 SmartQ RAG 검색 API

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- LangChain/RAG 기반 사내 문서 검색 API를 구현해 키워드 검색의 맥락 검색 한계를 보완
- GitLab CI/CD + Docker로 빌드·테스트·배포 단계를 자동화
- Nginx + Staging 환경을 구성해 배포 전 API 검증 경로를 분리
- 빌드 산출물, 실행 환경, 배포 경로를 Docker와 GitLab CI/CD 기준으로 고정

## 헥토 - 세이프캐시 정기 배치 및 Admin 재처리 API

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

- Crontab 기반 정기 데이터 동기화 배치를 자동화하고 실행 이력/결과 로그를 남김
- Admin UI/API에 조회·수정·재처리 기능을 연결해 단순 데이터 이상을 화면에서 처리할 수 있게 개선
- 수동 배치 실행과 개발자 DB 확인에 의존하던 작업을 자동 실행, 결과 로깅, 재처리 API 구조로 전환

---

**GitHub** https://github.com/junho0831
