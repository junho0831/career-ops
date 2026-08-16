# 박준호 | Data/Batch Backend Engineer

데이터 정합성과 배치 안정성을 개선하는 Java/Spring Boot 백엔드 개발자입니다. 회사 업무에서는 Python/Airflow 기반 FTP 데이터 처리 자동화, ER Dose RAW/EUV 로그 파싱 경로 분리, 구조화 적재, 중복 적재 방지, 재실행 가능한 배치 흐름, 검색 장애 대응, 인증 상태 관리, 운영자 재처리 API처럼 실제 운영 중 문제가 되는 데이터·백엔드 흐름을 줄이는 작업을 맡았습니다. 개인 서비스 VoiceLink에서는 Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반으로 실시간 매칭·통화 세션의 동시성 문제를 해결하고 배포·운영까지 직접 수행했습니다.

Email: junho6667@gmail.com | Phone: 010-3525-6275 | GitHub: https://github.com/junho0831

서비스: https://voice-link.co.kr

---

## Summary

- Java/Spring Boot 기반 백엔드 개발 경력 3년+
- Python/Airflow 기반 FTP 데이터 처리 자동화, 로그 파싱, 구조화 적재, 배치 재실행 안정화 경험
- 운영 중단, 중복 처리, 데이터 유실, 재처리 실패 가능성을 줄이는 데이터/백엔드 흐름 개선 경험
- Elasticsearch fallback, Redis TTL 인증 상태, RDB index/unique constraint, transaction/lock 기반 정합성 관리 경험
- Admin 재처리 API, GitLab CI/CD, Docker/Nginx 기반 운영 자동화 경험
- Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반 실시간 상태 정합성 구현 경험
- AI를 구현·디버깅·문서화 보조 도구로 활용해 1인 서비스를 설계·개발·배포·운영한 경험

## Core Skills

- **Backend:** Java, Spring Boot, JPA, REST API
- **Data / Infra:** PostgreSQL, MySQL, Redis, Elasticsearch
- **Realtime / Ops:** LiveKit, WebRTC, Docker, Nginx, SSL, DNS
- **Automation / Batch:** GitLab CI/CD, Airflow, Crontab, FTP, Log Parsing
- **Testing / Auth:** JUnit5, Mockito, JWT, OAuth2, Spring Security
- **AI / Search:** OpenAI API, LangChain, RAG

---

## Experience

### 엔셀 | 백엔드 개발자
`2025.01 ~ 현재`

#### Prism - Airflow 데이터 처리 자동화
`Python` `Airflow` `PostgreSQL` `FTP`
- FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어, Java 배치를 Python/Airflow DAG로 이관하며 처리 단계를 재설계
- 다운로드, 검증, 변환, 저장, 업로드, 원본 정리 단계를 task로 분리해 어느 단계에서 실패했는지 확인하고 해당 지점부터 재처리할 수 있도록 개선
- ER Dose RAW warning 파싱과 EUV root cause 파싱을 별도 실행 경로로 분리하고, `mbeat.er_data_raw_euv.contents`를 구조화 컬럼으로 적재하는 processor/repository 경로 구성
- `Root clause`, `Exposesue I D`, 문자열 `\\n`, 단위 제거, `3.0 -> 3` 정수 변환 같은 운영 로그 변형을 파서에 반영하고, 개별 필드 실패 시 `NULL` 처리로 전체 row 유실 방지
- 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정해 장애 발생 시 데이터 유실 없이 재실행 가능하도록 설계
- `source_file` unique constraint와 upsert 적재 로직을 적용해 동일 파일이 반복 실행에서 중복 적재되는 문제 방지
- 입력일+전일 FTP 폴더 병행 스캔, `max_active_runs=1`, `catchup=false`, scratch 파일 정리로 날짜 경계 누락과 반복 실행 리스크 축소
- 전체 데이터를 메모리에 올리지 않고 `chunk 조회 -> 파싱 -> 파티션 COPY 적재`를 반복하고, `code_occur_time` 기준 range partition 적재와 chunk별 처리량 로그로 운영 중 병목과 실패 구간을 확인할 수 있게 개선

#### DataForge - Spring 검색/인증/관리 API
`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- 검색 엔진 비활성 또는 예외 상황에서 야근 신청 조회가 중단될 수 있어, Elasticsearch 실패 조건을 분리하고 DB fallback 검색 경로를 설계
- ES/DB 응답 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 사용자와 운영자가 동일한 조회 결과를 해석할 수 있도록 개선
- `requester_id`, `start_at`, `status` 인덱스와 unique constraint를 함께 적용해 조회 성능과 중복 신청·승인 방지 정합성을 동시에 관리
- Refresh Token 저장, 검증, 회전, 삭제를 Redis TTL 기준으로 일원화해 로그인·갱신·로그아웃 상태 판단 기준을 단순화
- 야근 신청, 승인/반려, 알림, 관리자 수정, 재색인, 시트 동기화, 공통 예외·validation 응답을 연결해 운영자가 복구·확인할 수 있는 API 흐름 구축

#### SMIP - 공통 예외 처리 및 회귀 테스트
`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- API마다 오류 응답과 validation 메시지 해석 방식이 달라 장애 분석 기준이 흔들리는 문제가 있어, 공통 예외 처리 계층과 표준 오류 응답으로 통합
- 프론트엔드, 운영자, 개발자가 같은 오류 포맷을 기준으로 원인을 파악하도록 validation 정책과 메시지 구조 정리
- 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정해 담당자 기억이 아니라 테스트로 재발 여부를 확인하도록 개선
- Vue.js 화면 상태를 MVVM + 공통 스토어 구조로 재정리해 변경 영향 범위와 인수인계 비용 축소
- 장애 분석 리드타임 `40분 → 12분`, 동일 오류 재발률 `30% 감소`

### 헥토 | 백엔드 개발자
`2022.08 ~ 2024.07`

#### KMS - CI/CD 표준화
`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx`

- 수동 배포 과정에서 빌드 산출물, 실행 환경, 배포 경로가 달라져 배포 누락과 환경 차이 리스크가 발생할 수 있는 구조를 개선
- GitLab CI/CD와 Docker 기반으로 빌드·테스트·배포 단계를 표준화하고, Nginx + Staging 환경으로 배포 전 API 검증 경로 분리
- 배포 절차를 개인 숙련도에 의존하지 않는 팀 공통 흐름으로 정리
- 릴리스 리드타임 `1시간 → 25분`, 배포 실패 비율 `5% → 0%`

#### SmartQ - RAG 검색 API
`Java` `Spring Boot` `OpenAI API` `LangChain`

- 사내 문서 검색이 키워드 일치에 의존해 원하는 답을 찾기 어렵고, 상담·운영 담당자가 문서를 직접 찾아야 하는 병목이 있어 LangChain 기반 RAG 검색 API 구축
- 문서 맥락 기반 질의응답 API를 분리된 모듈로 적용해 기존 시스템 변경 범위를 줄인 상태로 적용
- 질의 응답 정확도 `60% → 80%`, 답변 대기 시간 `5분 → 1분`, 상담팀 주당 `12시간` 절감

#### SafeCash - 정기 배치 및 Admin 재처리 API
`Java` `Spring Boot` `Crontab`

- 정기 데이터 동기화가 수동 실행과 개발자 DB 확인에 의존해 누락, 중복, 복구 지연이 발생할 수 있는 구조를 개선
- Crontab 기반 정기 배치로 동기화 작업을 자동화하고, 실행 이력과 결과 로그를 남겨 운영자가 이상 징후를 직접 확인할 수 있도록 개선
- Admin UI/API에 조회·수정·재처리 기능을 연결해 장애 발생 시 개발자가 직접 DB를 확인하던 복구 흐름을 운영자 중심의 재처리 흐름으로 전환
- 데이터 정합성 이슈 `월 3건 → 0건`

---

## Project

### VoiceLink | 실시간 매칭·통화 서비스
`2024 ~ 현재` · 개인 서비스 · `Java` `Spring Boot` `Redis` `Lua Script` `DB Outbox` `Pub/Sub` `LiveKit` `Docker` `Nginx` `WebRTC`

서비스: https://voice-link.co.kr

- AI를 구현·디버깅·문서화·실험 보조 도구로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영
- 실시간 매칭에서 취소 직후 stale 결과가 반환되거나 동일 후보가 중복 선점되는 문제가 있어, Redis ZSET 대기열, Presence TTL, Lua Script 기반 Atomic Claim으로 후보 조회·선점 흐름을 원자화
- 재매칭 직후 이전 결과가 반환되는 문제를 막기 위해 Cancel Marker를 매칭 확정 전후로 재검증하고 stale 결과를 즉시 폐기하는 구조 적용
- Pub/Sub 유실 또는 노드 재시작 시 결과 전달이 끊길 수 있어, DB Outbox + Redis Pub/Sub + TTL result key와 `FOR UPDATE SKIP LOCKED` 기반 발행 구조로 매칭 결과 회수 가능성 확보
- 이전 SSE 종료 콜백이 새 대기열을 삭제하는 race condition을 막기 위해 `DeferredResult` 정리 범위를 현재 연결 인스턴스로 제한
- LiveKit webhook과 `/match/end`를 DB `CallSession.ended_at` 기준으로 통합하고 `PESSIMISTIC_WRITE`로 세션 종료 처리를 직렬화해 유령 세션과 종료 후 재매칭 충돌 해결
- Docker, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 직접 구성해 실서비스 운영

---

## Education

### 동명대학교 (4년제)
`2015.03 ~ 2019.03` · 졸업
- **전공**: 로봇시스템공학과 (이과계열)
- **학점**: 3.72 / 4.5
- **졸업 작품/논문**: 도립진자 제어 시스템 설계 및 구현

---

## Education & Training

### Loopers 백엔드 코스
`2025.07 ~ 2025.10`
- Spring Boot 기반 대용량 이커머스 플랫폼 설계·구현 과정 수료 (도메인 모델링, API 설계, 계층 분리, 기술 선택 기준 정립)

### 비트컴퓨터 | 헥토그룹 Java Full-Stack 채용교육 (헥스퍼트IT아카데미)
`2022.04 ~ 2022.07` (640시간)
- Java/Spring 기반 풀스택 인텐시브 개발 교육 수료

### 더조은컴퓨터학원 | 응용소프트웨어 JAVA개발자 양성과정
`2019.10 ~ 2020.03` (840시간)
- Java/RDBMS 애플리케이션 개발 전문과정 수료

### 포스텍 (포항공과대학교) | 포스코 AI / Big Data 교육
`2019.04 ~ 2019.06` (480시간)
- AI 및 데이터 분석 파이프라인 교육 수료 및 최우수조 선정

### 공공빅데이터 교육
`2020.08 ~ 2020.09`
- 빅데이터 활용 과정 수료 및 우수상 수상

---

## Certifications & Awards

- **공공빅데이터 우수상** | `2020.09`
- **포스코 Big Data 최우수조 수상** | `2020.05`

---

## Activities & Volunteer

- **동명대학교 로봇시스템공학과 학생회장** | `2016.03 ~ 2016.12`
- **대한적십자 헌혈은장 (120회 이상)** | `2010.07 ~ 2019.09`

---

## Additional Project

### 와글와글 소모임
`2023.09 ~ 2023.10` · `Java` `Spring Boot` `Spring Security` `OAuth2` `JWT`

- Spring Security 기반 인증·권한 관리 구현
- 카카오·네이버·구글 OAuth 2.0 소셜 로그인 및 JWT 발급/세션 관리 구현

---

**GitHub** https://github.com/junho0831 | **포트폴리오** https://voice-link.co.kr
