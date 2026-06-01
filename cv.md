# 박준호 | 백엔드 개발자

Java/Spring Boot 기반 백엔드에서 인증, 검색, 운영 API, Redis 상태 관리, RDB 정합성, CI/CD, 데이터 처리 자동화를 맡아왔습니다. 실무에서는 Elasticsearch 장애 시 DB fallback 검색, Refresh Token Redis TTL 관리, 공통 예외·검증 정책, Airflow 기반 FTP 데이터 처리 자동화, 배치 재처리, 관리자 API를 구현했습니다. 개인 서비스 VoiceLink는 AI를 구현·디버깅 보조 도구로 활용해 1인 개발 범위를 넓혔고, Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반 실시간 매칭과 세션 정합성 설계부터 배포·운영까지 직접 맡았습니다.

Email: junho6667@gmail.com | Phone: 010-3525-6275 | GitHub: https://github.com/junho0831

서비스: https://voice-link.co.kr

---

## Summary

- Java/Spring Boot 기반 백엔드 개발 경력 3년+
- 인증, 검색, 관리자 API, 배치/재처리, 운영 자동화 경험
- Redis TTL, Lua Script, RDB index/unique constraint, transaction/lock을 활용한 정합성 관리 경험
- GitLab CI/CD, Docker, Nginx, SSL, DNS, Airflow 기반 배포·운영 경험
- AI를 구현·디버깅·문서화 보조 도구로 활용해 1인 서비스를 개발·운영한 경험

## Core Skills

- **Backend:** Java, Spring Boot, JPA, REST API
- **Data / Infra:** PostgreSQL, MySQL, Redis, Elasticsearch, SQLite
- **Realtime / Ops:** LiveKit, WebRTC, Docker, Nginx, SSL, DNS
- **Automation / Batch:** GitLab CI/CD, Airflow, Crontab, FTP
- **Testing / Auth:** JUnit5, Mockito, JWT, OAuth2, Spring Security
- **AI / Search:** OpenAI API, LangChain, RAG

---

## Experience

### 엔셀 | 백엔드 개발자
`2025.01 ~ 현재`

#### Prism - Airflow 데이터 처리 자동화
`Python` `Airflow` `SQLite` `FTP`

- Java 기반 FTP 파일 처리 배치를 Python/Airflow 파이프라인으로 이관
- 입력일과 전일 폴더를 함께 스캔해 날짜 경계에 들어온 파일 누락 방지
- 다운로드/업로드 검증, 변환, 저장, 업로드, 원본 정리 단계를 분리해 실패 지점을 추적하기 쉽게 재설계
- 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정해 재실행 시 복구 가능하도록 개선
- `source_file` unique 제약과 upsert 구조로 동일 파일 중복 적재 방지
- scratch 파일 정리와 실행 제어(`max_active_runs=1`, `catchup=false`)로 반복 실행 안정성 개선

#### DataForge - Spring 검색/인증/관리 API
`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- 야근 신청, 승인, 반려, 조회, 알림, 관리자 수정 흐름을 Spring 기반 백엔드로 구현
- Elasticsearch 비활성 또는 검색 예외 시 DB fallback 검색으로 전환해 검색 중단 방지
- ES/DB 결과 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 일관된 응답 유지
- `requester_id`, `start_at`, `status` 인덱스와 unique constraint로 조회 성능을 개선하고 중복 신청/중복 승인을 방지
- Refresh Token 저장·검증·회전·삭제를 Redis TTL 기준으로 일원화해 로그인, 갱신, 로그아웃 상태 관리 개선
- 관리자 API, 공통 예외 응답, validation 실패 응답, 재색인·시트 동기화 기능을 연결해 운영 대응 흐름 정리

#### SMIP - 공통 예외 처리 및 회귀 테스트
`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- API별로 흩어져 있던 예외 처리 로직을 공통 예외 처리 계층과 표준 오류 응답으로 통합
- validation 정책과 오류 메시지 포맷을 정리해 프론트엔드, 운영자, 개발자가 같은 기준으로 장애를 해석하도록 개선
- JUnit5/Mockito 기반 회귀 테스트를 추가해 반복 장애를 배포 전에 검증
- Vue.js 화면 상태를 MVVM + 공통 스토어 구조로 재정리해 변경 영향 범위와 인수인계 비용 축소
- 장애 분석 리드타임 `40분 → 12분`, 동일 오류 재발률 `30% 감소`

### 헥토 | 백엔드 개발자
`2022.08 ~ 2024.07`

#### KMS - CI/CD 표준화
`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx`

- GitLab CI/CD, Docker, Nginx, Staging 환경을 기준으로 빌드·테스트·배포 절차 표준화
- 실행 환경과 배포 경로를 고정해 수동 배포 과정의 누락과 환경 차이 리스크 축소
- 배포 전 검증 경로를 분리해 릴리스 확인 절차를 팀 공통 흐름으로 정리
- 릴리스 리드타임 `1시간 → 25분`, 배포 실패 비율 `5% → 0%`

#### SmartQ - RAG 검색 API
`Java` `Spring Boot` `OpenAI API` `LangChain`

- LangChain 기반 RAG 검색 API를 구현해 키워드 중심 검색을 의미 기반 검색으로 보완
- 질의응답 API를 모듈화하고 큐 기반 응답 흐름을 설계해 기존 환경 변경을 줄인 상태로 적용
- 질의 응답 정확도 `60% → 80%`, 답변 대기 시간 `5분 → 1분`, 상담팀 주당 `12시간` 절감

#### SafeCash - 정기 배치 및 Admin 재처리 API
`Java` `Spring Boot` `Crontab`

- 정기 데이터 동기화 작업을 Crontab 기반 배치로 자동화해 수동 개입 제거
- 실행 이력과 결과 로깅 구조를 추가해 이상 징후를 더 빨리 확인할 수 있도록 개선
- Admin UI/API에 조회·수정·재처리 기능을 연결해 운영자가 직접 복구할 수 있는 흐름 구축
- 데이터 정합성 이슈 `월 3건 → 0건`

---

## Project

### VoiceLink | 실시간 매칭·통화 서비스
`2024 ~ 현재` · 개인 서비스 · `Java` `Spring Boot` `Redis` `Lua Script` `DB Outbox` `Pub/Sub` `LiveKit` `Docker` `Nginx` `WebRTC`

서비스: https://voice-link.co.kr

- AI를 구현·디버깅·문서화·실험 보조 도구로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영
- Redis ZSET 대기열 + Presence TTL + Lua Script 기반 Atomic Claim으로 동일 후보를 중복 선점하는 race condition 차단
- Cancel Marker 재검증과 stale 결과 즉시 폐기 구조로 재매칭 직후 stale match가 반환되는 문제 해결
- DB Outbox + Redis Pub/Sub + TTL result key 구조와 `FOR UPDATE SKIP LOCKED` 기반 발행으로 재시작·유실 상황에서도 매칭 결과를 회수할 수 있도록 설계
- `DeferredResult` 정리 범위를 현재 연결 인스턴스로 제한해 이전 SSE 종료 콜백이 새 대기열을 삭제하는 race condition 방지
- LiveKit webhook과 `/match/end` 흐름을 DB `CallSession.ended_at` 기준으로 통합하고 `PESSIMISTIC_WRITE`로 종료 처리를 직렬화해 유령 세션과 종료 후 재매칭 충돌 해결
- Docker, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 직접 구성해 실서비스 운영
- 실시간 상태 모델링, 세션 정합성, 배포·운영 판단을 직접 수행

---

## Education / Training

### Loopers 백엔드 코스
`2025.07 ~ 2025.10`

- Spring Boot 기반 이커머스 플랫폼 설계·구현 과정 수료

---

## Additional Project

### 와글와글 소모임
`2023.09 ~ 2023.10` · `Java` `Spring Boot` `Spring Security` `OAuth2` `JWT`

- Spring Security 기반 인증·권한 관리 구현
- 카카오·네이버·구글 OAuth 2.0 소셜 로그인 및 JWT 발급/세션 관리 구현

---

**GitHub** https://github.com/junho0831
