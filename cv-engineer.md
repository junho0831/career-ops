# 박준호 | Data/Batch Backend Engineer

> 데이터 정합성과 배치 안정성을 개선하는 Java/Spring Boot 기반 Data/Batch Backend Engineer
Python/Airflow 기반 FTP 배치와 ER Dose RAW/EUV 로그 파싱·적재를 운영하고 있습니다. 약 1,973만 건 처리에서 청크 조회·파싱과 PostgreSQL COPY 적재를 겹치는 파이프라인으로 처리 시간을 `4,175초 -> 2,896초`로 30.6% 단축했으며, 일별 DIE 수율·불량 유형과 EUV Root Cause 집계를 UPSERT해 재실행 결과의 정합성을 확보했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831　　🌐 so-dak.com

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 약 1,973만 건 | 30.6% | 데이터/배치 |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 단일 배치 처리 규모 | 처리 시간 단축 | 로그 파싱·적재·재처리 |

- Python/Airflow 기반 FTP 배치 이관과 ER Dose RAW/EUV 로그 파싱·구조화 적재 경험
- 서버사이드 커서, PostgreSQL COPY, range partition을 활용한 대용량 배치 처리 경험
- 일별 DIE 수율·불량 유형과 EUV Root Cause 집계 및 UPSERT 기반 재실행 정합성 확보
- Elasticsearch fallback, Redis TTL 인증 상태, RDB 제약 조건, Admin 재처리 API 기반 운영 복구 경험
- Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반 실시간 상태 정합성 구현 경험
- Spring Boot, Redis, LiveKit, Docker, Nginx 기반 실시간 서비스를 설계부터 배포·운영까지 1인으로 구축

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

- 단순 CRUD가 아닌 동시성, 실시간성, WebRTC 네트워크, 운영 인프라 이슈를 직접 해결한 실서비스 운영 경험 확보
- Redis Lua Script 기반 Atomic Claim, Cancel Marker, DB Outbox + Redis Pub/Sub, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` source of truth를 결합해 stale match, 중복 매칭, 유령 세션, 종료 후 재매칭 충돌을 구조적으로 해결
- `https://voice-link.co.kr` 도메인으로 실제 접속 가능한 서비스를 상시 운영한 경험 확보
- 장애 발생 시 API, Redis 상태, LiveKit 연결, 네트워크, Nginx, SSL, DNS, 포트포워딩까지 이어지는 운영 디버깅 경험 축적

---

# 경력

## 엔셀 - Prism Airflow FTP Batch Migration

📅 `2026.02 ~ 현재`

`Python` `Airflow` `PostgreSQL` `FTP`

- FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어 Java 배치를 Python/Airflow DAG로 이관하며 처리 단계를 재설계
- 다운로드, 검증, 변환, 저장, 업로드, 원본 정리 단계를 task로 분리해 어느 단계에서 실패했는지 확인하고 해당 지점부터 재처리할 수 있도록 개선
- `mbeat.er_data_raw` RAW warning 파싱과 `mbeat.er_data_raw_euv` root cause 파싱을 별도 실행 경로로 분리하고, EUV `contents`를 구조화 컬럼으로 적재하는 배치 구성
- `Root clause`, `Exposesue I D`, 문자열 `\\n`, 단위 제거, `3.0 -> 3` 정수 변환 같은 운영 데이터 변형을 파서에 반영하고, 개별 필드 실패 시 `NULL` 처리로 전체 row 유실 방지
- 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정해 데이터 유실 없이 재실행 가능하도록 설계
- `source_file` unique constraint와 upsert 적재 로직을 적용해 동일 파일이 반복 실행에서 중복 적재되는 문제 방지
- `max_active_runs=1`, `catchup=False`, 입력일+전일 FTP 폴더 스캔, scratch cleanup으로 날짜 경계 누락과 반복 실행 리스크 축소
- 서버사이드 커서 기반 청크 조회와 대기 적재를 1건으로 제한한 파이프라인을 구성해 이전 청크의 PostgreSQL COPY 적재와 다음 청크의 조회·파싱을 겹쳐 실행하고, 약 1,973만 건 처리 시간을 `4,175초 -> 2,896초`로 30.6% 단축
- Lot 시작·종료 이벤트와 DW 오류 로그를 처리 구간별로 결합해 DIE 수율·불량 유형을 집계하고, EUV Root Cause 빈도와 함께 일별 요약 테이블에 UPSERT하여 재실행 시 결과 정합성 확보

## 엔셀 - DataForge Spring 검색/인증/관리 API

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- 검색 엔진 비활성 또는 예외 상황에서 야근 신청 조회가 중단될 수 있어 Elasticsearch 실패 조건을 분리하고 DB fallback 검색 경로를 설계
- ES/DB 응답 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 사용자와 운영자가 동일한 조회 결과를 해석할 수 있도록 개선
- `requester_id`, `start_at`, `status` 인덱스와 unique constraint로 조회 성능과 중복 신청·승인 방지 정합성을 함께 개선
- Refresh Token 저장, 검증, 회전, 삭제를 Redis TTL 기준으로 일원화해 로그인·갱신·로그아웃 상태 관리 단순화
- 직원 정보 변경, 알림 메일, 재색인, 시트 동기화, `GlobalExceptionHandler`와 validation 실패 응답을 연결해 운영 대응 흐름 정리

## 엔셀 - SMIP Spring 공통 예외 처리 및 회귀 테스트

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- API마다 오류 응답과 validation 메시지 해석 방식이 달라 장애 분석 기준이 흔들리는 문제가 있어 공통 예외 처리 계층과 표준 오류 응답으로 통합
- 프론트엔드, 운영자, 개발자가 같은 오류 포맷을 기준으로 원인을 파악하도록 validation 정책과 메시지 구조 정리
- 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정해 담당자 기억이 아니라 테스트로 재발 여부를 확인하도록 개선
- Vue 화면 상태를 MVVM + Store 구조로 분리해 UI 상태 변경 영향 범위와 인수인계 비용 축소

## 헥토 - KMS CI/CD 표준화 및 SmartQ RAG 검색 API

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- 수동 배포 과정에서 빌드 산출물, 실행 환경, 배포 경로가 달라져 배포 누락과 환경 차이 리스크가 발생할 수 있는 구조를 개선
- GitLab CI/CD와 Docker 기반으로 빌드·테스트·배포 단계를 표준화하고, Nginx + Staging 환경으로 배포 전 API 검증 경로 분리
- 배포 절차를 개인 숙련도에 의존하지 않는 팀 공통 흐름으로 정리해 릴리스 리드타임을 `1시간 → 25분`, 배포 실패 비율을 `5% → 0%`로 개선
- 사내 문서 검색이 키워드 일치에 의존해 원하는 답을 찾기 어렵고 상담·운영 담당자가 문서를 직접 찾아야 하는 병목이 있어 LangChain 기반 RAG 검색 API 구축
- 문서 맥락 기반 질의응답 API를 분리된 모듈로 적용해 검색 정확도를 `60% → 80%`, 답변 대기 시간을 `5분 → 1분`으로 개선하고 상담팀 반복 검색 업무를 주당 `12시간` 절감

## 헥토이노베이션 - SafeCash 정기 배치 및 Admin 재처리 API

📅 `2022.08 ~ 2023.10`

`Java` `Spring Boot` `Crontab`

- 정기 데이터 동기화가 수동 실행과 개발자 DB 확인에 의존해 누락, 중복, 복구 지연이 발생할 수 있는 구조를 개선
- Crontab 기반 정기 배치로 동기화 작업을 자동화하고, 실행 이력과 결과 로그를 남겨 운영자가 이상 징후를 직접 확인할 수 있도록 개선
- Admin UI/API에 조회·수정·재처리 기능을 연결해 장애 발생 시 개발자가 직접 DB를 확인하던 복구 흐름을 운영자 중심의 재처리 흐름으로 전환
- 반복되던 데이터 정합성 이슈를 `월 3건 → 0건`으로 개선

---

**GitHub** https://github.com/junho0831
