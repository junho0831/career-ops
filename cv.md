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
- 문제·원인·해결·성과를 명확히 정리해 팀과 공유하며, 리팩토링과 자동화로 운영 리스크를 낮춤

---

# 대표 프로젝트

---

## VoiceLink - 실시간 매칭·통화 서비스

📅 `2024 ~ 현재` · 개인 서비스 (1인 개발·운영)

`Java` `Spring Boot` `Redis` `Lua Script` `DB Outbox` `Pub/Sub` `LiveKit` `Docker` `Nginx` `CI/CD` `WebRTC`

서비스: https://voice-link.co.kr

> 랜덤 음성 매칭을 제공하는 실시간 통화 서비스입니다. 기획부터 백엔드 API, Redis Lua Script 기반 매칭 큐, DB Outbox + Redis Pub/Sub 결과 전파, LiveKit/WebRTC 음성 연결, TURN/STUN, Docker 배포, Nginx/SSL/도메인 운영까지 전 과정을 1인으로 구축하고 운영했습니다. 특히 재매칭 시 stale match, 유령 세션, 연결 종료 누락 같은 실시간 세션 정합성 문제를 코드와 운영 구조 양쪽에서 해결했습니다.
>

### 🔴 문제

- 실시간 매칭에서 취소 직후 stale 결과가 다시 반환되거나, 종료되지 않은 세션이 재매칭 시 충돌하는 동시성 문제가 발생
- WebRTC 기반 통화 연결은 애플리케이션 코드뿐 아니라 홈서버 네트워크, TURN/STUN, 방화벽, 포트포워딩, HTTPS, 도메인/SNI 설정까지 함께 맞아야 안정적으로 동작
- 로컬에서만 동작하는 프로젝트가 아니라 실제 사용 가능한 서비스로 배포하기 위해 운영 중 장애 원인을 직접 추적해야 했음

### 🔵 해결

- Redis ZSET 대기열과 Presence TTL을 분리하고, Lua Script(`find_opponent.lua`, `purge_user.lua`) 기반 Atomic Claim으로 후보 조회·선점·presence 삭제를 단일 원자 연산으로 묶어 동일 후보 중복 선점 Race Condition을 차단
- Cancel Marker를 매칭 확정 전·결과 발행 전 재검증하고, 취소 시 `markCancelled -> discardMatchResult -> removeAndComplete` 순서로 stale 결과 캐시와 대기열 상태를 즉시 폐기해 "나가기 직후 재매칭" stale match 문제를 해결
- 매칭 결과 전달을 DB Outbox + Redis Pub/Sub + TTL result key 구조로 분리하고, Outbox 발행은 `FOR UPDATE SKIP LOCKED`로 작업을 선점해 Pub/Sub 유실이나 노드 재시작 상황에서도 다음 `/connect`에서 결과를 회수할 수 있도록 설계
- `DeferredResult`를 현재 연결 인스턴스 기준으로만 제거하도록 `removeAndCompleteIfCurrent`를 적용해, 이전 SSE 종료 콜백이 새 대기열을 삭제하는 race condition을 방지
- LiveKit webhook(`room_finished`, `participant_left`, `participant_disconnected`)과 `/match/end`를 DB `CallSession.ended_at` 기준으로 통합하고, 세션 종료 처리는 `PESSIMISTIC_WRITE`로 직렬화해 통화 종료 후 기존 active session 재사용 문제를 해결
- LiveKit 참가자 수 기반 활성 세션 검증을 추가해 DB에는 열려 있지만 실제 방이 비어 있는 유령 세션 진입을 차단
- 홈서버에 Docker 기반 런타임을 직접 구성하고, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 운영 환경 전체를 설계
- 외부 접속 테스트와 로그, curl 검증을 바탕으로 DNS/네트워크 이슈를 직접 추적하며 실제 서비스가 안정적으로 연결되도록 조정

### 🟢 성과

- 단순 CRUD가 아닌 동시성, 실시간성, WebRTC 네트워크, 홈서버 인프라 운영 이슈가 포함된 실서비스를 직접 구축·운영
- Redis Lua Script 기반 Atomic Claim, Cancel Marker, DB Outbox + Redis Pub/Sub, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` source of truth를 결합해 stale match, 중복 매칭, 유령 세션, 종료 후 재매칭 충돌을 구조적으로 해결
- `https://voice-link.co.kr` 도메인으로 실제 접속 가능한 서비스를 홈서버 기반으로 상시 운영한 경험 확보
- 장애 발생 시 API, Redis 상태, LiveKit 연결, 홈서버 네트워크, Nginx, SSL, DNS, 포트포워딩까지 이어지는 운영 디버깅 경험 축적
- self-hosted 배포 환경에서 공유 서비스와 애플리케이션 재배포 단계를 분리해 운영 중단 위험을 낮춘 배포 흐름 구축

---

# 경력

---

## 엔셀 - Prism

📅 `2026.02 ~ 현재`

`Python` `Airflow` `SQLite` `FTP`

### **🔴 문제**

- 타팀의 자바 기반 FTP 파일 처리 배치를 우리 팀 Python/Airflow 구조로 마이그레이션해야 했으며,

    반복 실행 환경에서 중복 처리·누락·재실행 정합성 문제를 함께 해결해야 했음


---

### **🔵 해결**

- Rubi(txt) / Rupi(tif) 도메인으로 분리해 텍스트 파싱, 이미지 변환, 매칭·업로드 책임을 명확화
- Airflow DAG 기반 주기 실행 구조와 `max_active_runs=1` 설정으로 반복 실행 흐름 관리
- 입력일과 전날 폴더를 함께 스캔해 날짜 경계에서 들어온 FTP 파일 누락 리스크 완화
- 업로드 성공과 DB commit 이후 FTP 원본을 삭제하도록 처리 순서를 배치해 재실행 시 손실 리스크를 줄임
- Rupi `source_file` unique 제약과 upsert 구조로 동일 이미지 파일의 중복 적재를 방지

---

### **🟢 성과**

- 자바 기반 배치를 Python/Airflow 구조로 안정적으로 이관
- 성공 조건을 늦게 확정하고 원본 삭제를 마지막 단계로 배치해 재실행 리스크를 줄인 배치 운영 구조 구축
- FTP 다운로드/업로드 크기 검증과 로컬 scratch 파일 정리로 파일 처리 실패 시 추적과 복구가 쉬운 구조 마련

---

## 엔셀 - DataForge (데이터 처리 플랫폼)

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

### 🔴 문제

- 폐쇄망 환경에서 야근 기록을 엑셀로 수기 작성 -> 상급자가 모바일로 입력 불가
- 수동 집계로 인한 관리 부담과 데이터 정합성 문제 발생
- ES 비활성 또는 검색 예외 상황에서 야근 승인/조회 흐름이 끊어질 수 있는 상황 발생
- 동시 로그인·토큰 재발급이 빈번한 환경에서 토큰 상태 불일치로 세션 혼선 발생
- 운영자가 직원 정보, 야근 신청, 승인 상태, 검색 인덱스를 한 흐름에서 관리할 수 있는 내부 도구 필요

### 🔵 해결

- ES 비활성 또는 검색 예외 발생 시 DB fallback 검색으로 전환 - ES는 검색 성능, DB는 정합성 보장 역할을 분리해 장애 시에도 서비스 연속성 확보
- ES/DB 결과 포맷을 공통 응답 스키마로 통합해 권한 스코프와 정렬 정책(`startAt desc`, `id desc`) 정합성 유지
- `requester_id`, `start_at`, `status` 인덱스와 `(requester_id, start_at, end_at)`, `overtime_approvals.request_id` unique constraint를 적용해 조회 성능과 중복 승인/중복 신청 방지 정합성을 함께 고려
- **JWT + Redis** Stateless 인증 설계 - Refresh Token 저장/검증/회전/삭제 경로를 Redis TTL 기반으로 일원화해 토큰 상태 관리의 기준점을 명확화
- 관리자 API를 통해 직원 부서/직책/비밀번호 수정 흐름을 제공하고, `@Transactional` 경계 안에서 변경 사항을 일관되게 저장
- 공통 예외 응답과 validation 실패 응답을 표준화해 프론트엔드와 운영자가 같은 형태로 오류를 해석할 수 있도록 정리
- 신청/수정/반려 알림 메일, 전체 재색인 API, 선택적 시트 CSV 동기화 구조를 마련해 운영자가 수기 확인 없이 업무 흐름을 추적할 수 있게 함

### 🟢 성과

- 장애 구간에서 검색 완전 중단 없이 **부분 성능 저하로 완충**, 운영 대응 속도 향상
- Refresh Token 라이프사이클을 Redis 기준으로 단일화해 로그인/갱신/로그아웃 흐름의 상태 불일치 리스크 감소
- RDB 인덱스와 unique constraint를 기반으로 조회 성능과 업무 데이터 정합성을 함께 고려한 설계 경험 확보
- 관리자 API, 표준 오류 응답, 알림/재색인/동기화 흐름을 묶어 단순 CRUD가 아닌 운영 가능한 업무 시스템으로 확장

---

## 엔셀 - SMIP 유지보수

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

### 🔴 문제

- API마다 예외 처리 방식이 달라 장애 원인 추적이 오래 걸리고, 동일 오류가 반복 재발
- Vue.js 상태를 화면에서 직접 관리 -> 복잡도 급증, 인수인계 어려움
- 유지보수 인력이 바뀌어도 같은 기준으로 오류를 해석하고 재현할 수 있는 공통 처리 기준이 필요했음

### 🔵 해결

- **공통 예외 처리 계층·데이터 검증 정책** 설계 - API마다 다른 예외 처리를 단일 진입점으로 통합하고, 표준 오류 응답/검증 메시지 기준을 맞춰 원인 추적 경로를 표준화
- JUnit5/Mockito 기반 회귀 테스트를 추가해 동일 장애 재발 가능성이 높은 케이스를 배포 전 검증 흐름에 포함
- **MVVM 패턴 + 공통 스토어** 적용 - 화면마다 흩어진 상태를 스토어로 집중시켜 변경 영향 범위를 줄이고 인수인계 비용을 낮추기 위해 선택, UI-비즈니스 로직 분리 및 상태 흐름 문서화

### 🟢 성과

| 지표 | 전 | 후 |
| --- | --- | --- |
| 장애 분석 리드타임 | 40분 | **12분** |
| 동일 오류 재발률 | 기준 | **30% 감소** |

---

## 헥토 - AI/개발팀

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `OpenAI API` `LangChain`

### 🔴 문제

- 기존 키워드 검색이 맥락을 이해하지 못해 원하는 인터뷰 정보를 찾기 어려움 (스마트큐)
- 수동 배포로 리드타임이 길고 휴먼 에러에 지속 노출, 비정형 데이터로 API 협업 비효율 (KMS)
- 개발/검증/배포 환경이 분리되지 않아 배포 직전 이슈를 사전에 걸러내기 어려웠음

### 🔵 해결

- **스마트큐** LangChain·RAG 기반 사내 문서 벡터 검색 구현 - 키워드 매칭 한계를 넘어 의미 기반 검색이 필요했고, 기존 인프라 변경 없이 도입 가능한 RAG 구조를 선택, 질의응답 API 모듈화 및 큐 기반 즉시 응답 구조 설계
- **KMS** GitLab CI/CD + Docker로 빌드/테스트/배포 단계를 표준화 - 환경 차이로 인한 배포 문제를 줄이기 위해 Docker로 실행 환경을 고정하고, GitLab CI/CD로 사람 손을 거치지 않는 배포 파이프라인 구성, Nginx + Staging 환경 표준화로 배포 검증 절차 확립
- 배포 전 Staging 검증과 Nginx 라우팅 구성을 정리해 API 협업과 릴리스 확인 절차를 팀이 반복 가능한 형태로 문서화

### 🟢 성과

**스마트큐**

| 지표 | 전 | 후 |
| --- | --- | --- |
| 질의 응답 정확도 | 60% | **80%** |
| 답변 대기 시간 | 5분 | **1분** |
| 상담팀 주당 절감 | - | **12시간** |

**KMS**

| 지표 | 전 | 후 |
| --- | --- | --- |
| 릴리스 리드타임 | 1시간 | **25분** |
| 배포 실패 비율 | 5% | **0%** |

---

## 헥토 - 세이프캐시 마이데이터개발팀

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

### 🔴 문제

- 정기 데이터 동기화·배치 작업 수동 수행 -> 휴먼 에러·지연 빈발
- 처리 결과 확인 수단 부재로 이상 발생 시 인지 지연
- 데이터 이상 발생 시 개발자가 DB를 직접 확인해야 하는 운영 의존도가 높았음

### 🔵 해결

- Crontab 기반 정기 배치 자동화로 수동 개입 제거, 작업 실행 이력 및 결과 로깅 체계 구축
- Admin UI·API 고도화로 데이터 조회·수정·재처리 흐름을 내부 운영 도구로 통합
- 운영자가 직접 조회/수정/재처리를 수행할 수 있도록 복구 경로를 API와 화면에 연결해 개발자 수동 대응 범위를 축소

### 🟢 성과

| 지표 | 전 | 후 |
| --- | --- | --- |
| 데이터 정합성 이슈 | 월 3건 | **0건** |

---

# 기타 활동

---

## Loopers 백엔드 코스

📅 `2025.07 ~ 2025.10` · 교육

`Java` `Spring Boot`

### 🔵 내용

- Spring Boot로 가상의 이커머스 플랫폼을 설계·구현하며 상황별 기술 선택과 모듈 설계 학습

---

## 와글와글 소모임

📅 `2023.09 ~ 2023.10` · 프로젝트

`Java` `Spring Boot` `Spring Security` `OAuth2` `JWT`

### 🔵 내용

- Spring Security 기반 인증·권한 관리, 카카오·네이버·구글 OAuth 2.0 소셜 로그인 및 JWT 발급/세션 관리 구현

---

**GitHub** https://github.com/junho0831
