# 박준호 | Data & Backend Engineer

> 💡 **"데이터 정합성과 배치 파이프라인의 안정성을 책임지는 백엔드 엔지니어입니다."**  
> Java/Spring Boot 기반 백엔드 아키텍처와 Python/Airflow 대용량 배치 파이프라인을 두루 운영해 왔습니다. 1,973만 건의 데이터 적재 파이프라인을 30.6% 최적화하고, 검색 Fallback과 Redis 상태 관리, Admin 재처리 API 구축을 통해 시스템 실패 복구와 운영 효율화를 주도했습니다.

---

## 📱 Contact & Links

| 항목 | 정보 |
| :--- | :--- |
| **이메일** | junho6667@gmail.com |
| **연락처** | 010-3525-6275 |
| **생년월일** | 1996.08.31 |
| **GitHub** | [github.com/junho0831](https://github.com/junho0831) |
| **포트폴리오** | [so-dak.com](https://so-dak.com/) |
| **실서비스** | [VoiceLink (voice-link.co.kr)](https://voice-link.co.kr) |

---

## 🛠 Tech Stack

- **Backend**: Java 17/21, Spring Boot, Spring Data JPA, MyBatis, Python, FastAPI
- **Data & Batch**: PostgreSQL (Range Partition, Server-side Cursor, COPY), MySQL, Apache Airflow, Redis
- **Infra & DevOps**: Docker, GitLab CI/CD, Nginx, Linux, Crontab
- **Search & Realtime**: Elasticsearch, LiveKit, WebRTC, WebSocket
- **Auth & Testing**: Spring Security, JWT, OAuth2, JUnit5, Mockito

---

## 💼 Work Experience (총 3년 9개월 / 45개월)

### 1. 엔셀 (주) — 플랫폼개발팀 / 백엔드 개발자
`2025.01 ~ 현재 (재직 중, 21개월)`

> **대용량 제조/설비 데이터 파이프라인 자동화 및 백엔드 API/운영 복구 체계 구축**

#### 🔹 [Prism] Airflow 기반 데이터 배치 파이프라인 구축 및 대용량 적재 최적화
- **기술 스택**: `Python`, `Apache Airflow`, `PostgreSQL`, `FTP`
- **배경 & 과제**: Java 기반 FTP 배치의 단일 지점 실패 및 재실행 시 데이터 중복·유실 리스크 개선 필요.
- **주요 성과**:
  - **DAG 파이프라인 모듈화**: 다운로드 → 정규화/검증 → PostgreSQL 적재 → FTP 원본 정리 단계를 독립 Task로 분리하여 실패 지점부터 즉시 재처리 가능하도록 개선.
  - **대용량 적재 성능 30.6% 단축**: 약 1,973만 건 로그 처리 시 서버사이드 커서와 COPY 대기 큐를 겹쳐 병목을 제거, 처리 시간을 **4,175초에서 2,896초로 단축**.
  - **정합성 보장**: `source_file` Unique 제약 조건과 UPSERT 로직 적용, 커밋 완료 후 원본 삭제 프로세스 고정으로 재실행 안전성 확보.
  - **비정형 로그 정제**: ER Dose RAW 및 EUV root cause 로그의 특수문자, 단위 누락 등 이상 패턴 예외 처리 파서 구축.

#### 🔹 [DataForge] 사내 신청/조회 Spring API 및 Fallback 체계 구축
- **기술 스택**: `Java`, `Spring Boot`, `PostgreSQL`, `Elasticsearch`, `Redis`, `JWT`
- **주요 성과**:
  - **검색 장애 Fallback**: Elasticsearch 장애 시 서비스 중단 없이 동일한 응답 규격으로 PostgreSQL에서 조회되도록 DB Fallback 경로 설계.
  - **Redis TTL 세션 관리**: Refresh Token 검증, 회전, 만료 처리를 Redis TTL 기반으로 일원화하여 인증 상태 일관성 확보.
  - **Admin 재처리 API**: 신청 승인/반려, 재색인 트리거, 공통 예외 validation 응답을 일원화하여 운영자 중심의 복구 플로우 구성.

#### 🔹 [SMIP] 공통 예외 처리 계층 및 JUnit5 회귀 테스트 도입
- **기술 스택**: `Java`, `Spring Boot`, `JUnit5`, `Mockito`
- **주요 성과**:
  - 파편화된 에러 응답 포맷을 일관된 규격으로 통합하여 프론트엔드-운영팀 간 장애 분석 리드타임을 **40분에서 12분으로 70% 단축**.
  - 반복 발생하던 경계값 예외 케이스를 JUnit5/Mockito 단위 테스트로 고정하여 동일 장애 재발 방지.

---

### 2. (주) 헥토이노베이션 / 헥토 — 마이데이터개발팀 & AI개발팀
`2022.08 ~ 2024.07 (24개월)`

> **마이데이터 정기 배치 안정화 및 사내 AI RAG 검색 API·CI/CD 표준화**

#### 🔹 [KMS] GitLab CI/CD & Docker 배포 표준화 (AI개발팀)
- **기술 스택**: `GitLab CI/CD`, `Docker`, `Nginx`, `Spring Boot`
- **주요 성과**:
  - 수동 빌드/배포 환경을 GitLab CI/CD 및 Docker 컨테이너 기반으로 파이프라인 일원화.
  - 릴리스 소요 시간을 **1시간에서 25분으로 단축**하고, 환경 차이로 인한 배포 실패율 0% 달성.

#### 🔹 [SmartQ] 사내 규정 RAG 질의응답 API 구축 (AI개발팀)
- **기술 스택**: `Python`, `LangChain`, `OpenAI API`, `FastAPI`, `Spring Boot`
- **주요 성과**:
  - 사내 규정 문서 기반 LangChain RAG 파이프라인 구축 및 질의응답 API 제공.
  - 문서 검색 질의 응답 정확도 60% → 80% 향상, 상담/운영팀의 주당 탐색 시간 약 12시간 절감.

#### 🔹 [SafeCash] 정기 배치 자동화 및 Admin 정합성 재처리 시스템 (마이데이터개발팀)
- **기술 스택**: `Java`, `Spring Boot`, `MyBatis`, `MySQL`, `Linux Crontab`
- **주요 성과**:
  - 마이데이터 금융 거래 정기 동기화 배치를 자동화하고, 배치 실행 이력 모니터링 구축.
  - 이상 거래 및 동기화 실패 건에 대해 개발자 DB 직접 접근 없이 운영자가 즉시 재처리 가능한 Admin API/화면 제공.
  - 데이터 불일치 이슈를 **월 평균 3건에서 0건으로 완전 해소**.

---

## 🚀 Projects

### VoiceLink | 실시간 1:1 음성 통화 매칭 플랫폼
`2024 ~ 현재` · 개인 프로젝트 (서비스 운영: [voice-link.co.kr](https://voice-link.co.kr))

- **기술 스택**: `Java 17`, `Spring Boot 3`, `Redis (Lua Script, Pub/Sub)`, `PostgreSQL`, `LiveKit (WebRTC)`, `Docker`
- **핵심 구현**:
  - **원자적 매칭 상태 머신**: 동시 접속자 간 매칭 경합 조건을 방지하기 위해 Redis Lua Script를 활용한 원자적 대기열 팝/매칭 로직 구현.
  - **DB Outbox 패턴 & 이벤트 분리**: 매칭 성사 이벤트와 외부 WebRTC 세션(LiveKit) 생성을 트랜잭션과 비동기 이벤트로 분리하여 RDB-실시간 세션 간 정합성 유지.
  - **서버 무중단 배포**: Docker와 Nginx 리버스 프록시를 적용한 운영 환경 구성.

---

## 🎓 Education

- **동명대학교 (부산)**: 로봇시스템공학과 학사 (`2015.03 ~ 2019.03` 졸업, 학점: 3.72 / 4.5)
- **해운대고등학교 (부산)**: 자연계열 (`2012.03 ~ 2015.02` 졸업)
