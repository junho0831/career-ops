# 박준호 | Data/Batch Backend Engineer

데이터 정합성과 배치 안정성을 개선하는 Data/Batch Backend Engineer입니다. Java/Spring Boot 백엔드 경력을 바탕으로 Python/Airflow 기반 FTP 배치, ER Dose RAW/EUV 로그 파싱, PostgreSQL 대용량 적재를 운영하고 있습니다. 약 1,973만 건 처리에서 청크 조회·파싱과 COPY 적재를 겹치는 파이프라인으로 처리 시간을 `4,175초 -> 2,896초`로 30.6% 단축했으며, DIE 수율·불량 유형과 EUV Root Cause를 일별 집계해 재실행 가능한 형태로 적재했습니다. 검색 장애 fallback, Redis 인증 상태, RDB 제약 조건, 운영자 재처리 API처럼 데이터 생성부터 복구까지 이어지는 운영 흐름도 개선해 왔습니다.

Email: junho6667@gmail.com | Phone: 010-3525-6275 | GitHub: https://github.com/junho0831 | Blog: https://so-dak.com | Portfolio: https://github.com/junho0831

- **생년월일:** 1992.08.31
- **병역:** 육군 수송 병장, 만기제대 (`2011.10.24 ~ 2013.07.23`)
- **취미 / 특기:** 야구 / 강속구

---

## Summary

- Java/Spring Boot 기반 백엔드 개발 경력 3년+
- Python/Airflow 기반 FTP 배치 이관, RAW/EUV 로그 파싱, 구조화 적재, 재처리 흐름 운영 경험
- 약 1,973만 건 처리 시간을 `4,175초 -> 2,896초`로 30.6% 단축한 PostgreSQL 청크/COPY 파이프라인 개선 경험
- DIE 수율·불량 유형과 EUV Root Cause를 일별 집계하고 날짜 범위별 DELETE 후 INSERT로 집계를 교체하는 재처리 흐름 구현 경험
- Elasticsearch fallback, Redis TTL 인증 상태, RDB 제약 조건, Admin 재처리 API 기반 운영 복구 경험
- Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반 실시간 상태 정합성 구현 경험

## Core Skills

- **Backend:** Java, Spring Boot, JPA, REST API
- **Data / Infra:** PostgreSQL, MySQL, Redis, Elasticsearch, Server-side Cursor, COPY, Range Partition
- **Realtime / Ops:** LiveKit, WebRTC, RabbitMQ, Redis Pub/Sub, Docker, Nginx, SSL, DNS
- **Automation / Batch:** GitLab CI/CD, Airflow, Crontab, FTP, Log Parsing
- **Testing / Auth:** JUnit5, Mockito, JWT, OAuth2, Spring Security
- **AI / Search:** OpenAI API, LangChain, RAG

---

## Experience

### 엔셀 | 프로 · 백엔드 개발자
`2025.01 ~ 현재`

#### Prism - Airflow 데이터 처리 자동화
`Python` `Airflow` `PostgreSQL` `FTP`
- FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어, Java 배치를 Python/Airflow DAG로 이관하며 처리 단계를 재설계
- FTP DAG의 단일 `run_combined` 작업이 배치 내부 다운로드·검증·변환·업로드·DB 저장·원본 정리 흐름을 실행하도록 구성하고, ER Dose는 별도 DAG의 EUV·RAW 파싱 작업으로 분리
- ER Dose RAW warning 파싱과 EUV root cause 파싱을 별도 실행 경로로 분리하고, `mbeat.er_data_raw_euv.contents`를 구조화 컬럼으로 적재하는 processor/repository 경로 구성
- `Root clause`, `Exposesue I D`, 문자열 `\\n`, 단위 제거, `3.0 -> 3` 정수 변환 같은 운영 로그 변형을 파서에 반영하고, 개별 필드 실패 시 `NULL` 처리로 전체 row 유실 방지
- FTP 이미지·텍스트 결합 처리에서 업로드 성공 후 DB commit, 이후 원본 삭제 순서를 적용하고, 텍스트 단독 경로는 DB commit 이후 삭제하도록 구성
- RUPI 이미지 메타데이터에 `source_file` unique constraint와 upsert를 적용해 동일 이미지 파일의 중복 메타데이터 적재 방지
- 입력일+전일 FTP 폴더 병행 스캔, `max_active_runs=1`, `catchup=false`, scratch 파일 정리로 날짜 경계 누락과 반복 실행 리스크 축소
- `code_occur_time` 기준 range partition에 청크별 COPY 적재하고, 서버사이드 커서 기반 조회와 대기 적재를 1건으로 제한해 이전 청크의 적재와 다음 청크의 조회·파싱을 겹쳐 실행. 약 1,973만 건 RAW 작업, `chunk_size=30000` 조건의 기록된 운영 비교에서 `4,175초 -> 2,896초`로 처리 시간 30.6% 단축
- Lot 시작·종료 이벤트와 DW 오류 로그를 처리 구간별로 결합해 DIE 수율·불량 유형과 EUV Root Cause를 일별 집계. 지정 날짜 범위의 DELETE 후 INSERT 방식으로 집계를 교체하며, 두 SQL은 별도 실행이므로 삽입 실패 시 재시도 필요

<!-- 2026-10-12 사용자 승인 코드 검증 반영. PythonStudy 9a324fe:
dags/ftp_batch_hourly_dag.py, dags/er_dose_daily_dag.py,
ftp_batch/app/batch_runner.py, ftp_batch/processors/rupi_processor.py,
er_dose/raw/raw_repository.py, docs/pr/er_dose_pipeline_reload_optimization.md.
성능 수치는 기록과 일치하나 이번 로컬 검증에서 대용량 운영 작업을 재측정하지 않음. -->

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

### (주) 헥토 | AI개발팀 선임 · 백엔드 개발자
`2023.10 ~ 2024.07` (10개월)

#### KMS - CI/CD 표준화
`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx`

- 수동 배포 과정에서 빌드 산출물, 실행 환경, 배포 경로가 달라져 배포 누락과 환경 차이 리스크가 발생할 수 있는 구조를 개선
- GitLab CI/CD와 Docker 기반으로 빌드·테스트·배포 단계를 표준화하고, Nginx + Staging 환경으로 배포 전 API 검증 경로 분리
- 배포 절차를 개인 숙련도에 의존하지 않는 팀 공통 흐름으로 정리
- 릴리스 리드타임 `1시간 → 25분`, 배포 실패 비율 `5% → 0%`

#### SmartQ - RAG 검색 API
`Java` `Spring Boot` `OpenAI API` `LangChain` `FastAPI`

- 사내 문서 검색이 키워드 일치에 의존해 원하는 답을 찾기 어렵고, 상담·운영 담당자가 문서를 직접 찾아야 하는 병목이 있어 LangChain 기반 RAG 검색 API 구축
- 문서 맥락 기반 질의응답 API를 분리된 모듈로 적용해 기존 시스템 변경 범위를 줄인 상태로 적용
- 질의 응답 정확도 `60% → 80%`, 답변 대기 시간 `5분 → 1분`, 상담팀 주당 `12시간` 절감

### (주) 헥토이노베이션 | 마이데이터팀 선임
`2022.08 ~ 2023.10` (1년 3개월)

#### SafeCash - 정기 배치 및 Admin 재처리 API
`Java` `Spring Boot` `MyBatis` `MySQL` `Crontab`

- 정기 데이터 동기화가 수동 실행과 개발자 DB 확인에 의존해 누락, 중복, 복구 지연이 발생할 수 있는 구조를 개선
- Crontab 기반 정기 배치로 동기화 작업을 자동화하고, 실행 이력과 결과 로그를 남겨 운영자가 이상 징후를 직접 확인할 수 있도록 개선
- Admin UI/API에 조회·수정·재처리 기능을 연결해 장애 발생 시 개발자가 직접 DB를 확인하던 복구 흐름을 운영자 중심의 재처리 흐름으로 전환
- 데이터 정합성 이슈 `월 3건 → 0건`

---

## Project

### 쿠폰 자산 회수·중고거래 준비 앱
`2026.08 ~ 현재` · 진행 중 · 단독 개발 (참여율 100%)

`Flutter` `390×844 모바일 UI` `WebView` `사진 자동 확인` `검색·필터` `판매글 fallback`

- Flutter 기반 쿠폰 관리 앱 **쿠폰포켓**을 단독 개발 — [Google Play](https://play.google.com/store/apps/details?id=com.pocketportal.pocket_portal)
- 쿠폰 자산을 검색·보관·회수하고, 중고거래 판매글 작성까지 이어지는 모바일 흐름을 설계·구현
- 390×844 기준으로 홈·쿠폰 검색 결과·전체 보관함·쿠폰 상세·회수 요약·회수 기록 화면을 점검해 정보 우선순위와 빈 상태를 정리
- 쿠폰 상세의 고정 완료 액션 바와 본문이 겹치지 않도록 불투명 하단 영역과 여백을 적용
- 사진 자동 확인에서 권한 범위와 재확인 행동을 분리하고, 판매글 준비 화면에서 거래 사이트 선택·초안 확인·복사 행동을 세로 흐름으로 구성
- 로그인·작성 URL 이동이 필요한 WebView에서는 자동 입력이 불가능한 경우를 고려해 복사 후 직접 붙여 넣는 fallback 흐름을 제공

---

### VoiceLink | 실시간 매칭·통화 서비스
`2024 ~ 현재` · 개인 서비스 · `Java` `Spring Boot` `Redis` `Lua Script` `DB Outbox` `RabbitMQ` `Pub/Sub` `LiveKit` `Docker` `Nginx` `WebRTC`

서비스: https://voice-link.co.kr

- AI를 구현·디버깅·문서화·실험 보조 도구로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영
- 실시간 매칭에서 취소 직후 stale 결과가 반환되거나 동일 후보가 중복 선점되는 문제가 있어, Redis ZSET 대기열, Presence TTL, Lua Script 기반 Atomic Claim으로 후보 조회·선점 흐름을 원자화
- 재매칭 직후 이전 결과가 반환되는 문제를 막기 위해 Cancel Marker를 매칭 확정 전후로 재검증하고 stale 결과를 즉시 폐기하는 구조 적용
- DB Outbox에 발송 이벤트를 기록하고 TTL result key를 유지해 매칭 결과 회수 경로 확보. RabbitMQ 발행기가 활성화되면 우선 발행하고 실패 시 활성화된 Redis Pub/Sub 발행기로 전환하는 경로 구현
- 2026.07 결과 전달 안정성 개선: `FOR UPDATE SKIP LOCKED` 기반 선점에 유효기간과 lease token을 적용하고, 동일 token의 작업자만 완료·실패 상태를 갱신하도록 구성. 지수 백오프·최대 재시도 횟수와 발행 전 취소·종료 검사 적용
- 이전 SSE 종료 콜백이 새 대기열을 삭제하는 race condition을 막기 위해 `DeferredResult` 정리 범위를 현재 연결 인스턴스로 제한
- LiveKit webhook과 `/match/end`를 DB `CallSession.ended_at` 기준으로 통합하고 `PESSIMISTIC_WRITE`로 세션 종료 처리를 직렬화해 유령 세션과 종료 후 재매칭 충돌 해결
- Docker, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, TURN 포트포워딩, DNS 연결까지 직접 구성해 실서비스 운영

<!-- 2026-10-12 사용자 승인 코드 검증 반영. VoiceLink 37109d5;
2026-07-16 개선 커밋 5091eba: MatchResultRealtimePublisher,
MatchOutboxRepository, MatchOutboxLeaseService, MatchOutboxPublisher.
Outbox 최초 도입은 2026-01-02, Lua 매칭 이력은 2026-01-30이므로
최근 6개월 경험은 7월의 전달 안정성 개선을 중심으로 설명한다.
현재 코드의 선택형 브로커 경로를 확인한 것이며 실제 배포 설정·브로커 장애 복구를 검증한 것은 아님. -->

---

## Education

### 동명대학교 (4년제)
`2015.03 ~ 2019.03` · 졸업
- **전공**: 로봇시스템공학과 (이과계열)
- **학점**: 3.72 / 4.5
- **졸업 작품/논문**: 도립진자 제어 시스템 설계 및 구현

---

### 부산고등학교
`2008.03 ~ 2011.02` · 졸업

---

## Education & Training

### Loopers 백엔드 코스
`2025.07 ~ 2025.10`
- Spring Boot 기반 대용량 이커머스 플랫폼 설계·구현 과정 수료 (도메인 모델링, API 설계, 계층 분리, 기술 선택 기준 정립)

### 비트컴퓨터 | 헥토그룹 Java Full-Stack 채용교육 (헥스퍼트IT아카데미)
`2022.04 ~ 2022.07` (640시간)
- Java/Spring 기반 풀스택 인텐시브 개발 교육 수료

### 공공빅데이터 교육
`2020.08 ~ 2020.09`
- 빅데이터 활용 과정 수료 및 우수상 수상

### 더조은컴퓨터학원 | 응용소프트웨어 JAVA개발자 양성과정
`2019.10 ~ 2020.03` (840시간)
- Java/RDBMS 애플리케이션 개발 전문과정 수료

### 포스텍 (포항공과대학교) | 포스코 AI / Big Data 교육
`2019.04 ~ 2019.06` (480시간)
- AI 및 데이터 분석 파이프라인 교육 수료 및 최우수조 선정

---

## Certifications & Awards

- **공공빅데이터 우수상** | `2020.09`
- **포스코 Big Data 최우수조 수상** | `2020.05`

---

## Activities & Volunteer

- **대한적십자 헌혈은장 (120회 이상)** | `2010.07 ~ 2019.09`
- **동명대학교 로봇시스템공학과 학생회장** | `2016.03 ~ 2016.12`

---

## Additional Project

### 쿠폰포켓 (Pocket Portal)
`2026.11 ~ 현재` · `AI-Assisted Development` `Android` `On-Device OCR` `Google Play Store`
- **Google Play**: https://play.google.com/store/apps/details?id=com.pocketportal.pocket_portal
- AI 코딩 도구를 워크플로우에 적극 도입하여 기획·구현부터 구글 플레이스토어 심사·배포까지 1인 풀사이클로 완주한 모바일 유틸리티 앱
- 개인정보 보호 및 서버 비용 절감을 위해 외부 통신 없는 온디바이스(On-Device) OCR 및 이미지 로컬 처리 파이프라인 채택
- 유효기간 기반 로컬 푸시 알림, 지도 연동 사용처 검색, C2C 중고 판매 지원(바코드 마스킹 및 템플릿 초안 생성) 기능 구현
- 스토어 출시 및 운영: Google Play Store 배포 (`com.pocketportal.pocket_portal`)

### Card Draft: Three Factions
`2026.11 ~ 현재` · `AI-Assisted Development` `Android` `Deck Building RPG` `Google Play Store`
- **Google Play**: https://play.google.com/store/apps/details?id=com.card_draft
- AI 기반 코드 생성 및 반복 프로토타이핑을 활용해 5~10분 세션 호흡의 모바일 싱글플레이 덱빌딩 카드 RPG 1인 제작 및 출시
- 3대 세력 필살기 시스템, 5칸 전장 전투, 상태 이상 및 시너지 연계 등 턴제 전투 규칙 및 데이터 구조 설계
- Android 16 호환성 검증 및 오프라인 환경에 최적화된 모바일 조작 안정성 확보
- 스토어 출시 및 운영: Google Play Store 배포 (`com.card_draft`)

### 와글와글 소모임
`2023.09 ~ 2023.10` · `Java` `Spring Boot` `Spring Security` `OAuth2` `JWT`

- Spring Security 기반 인증·권한 관리 구현
- 카카오·네이버·구글 OAuth 2.0 소셜 로그인 및 JWT 발급/세션 관리 구현

---

**GitHub** https://github.com/junho0831 | **포트폴리오** https://github.com/junho0831
