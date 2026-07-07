# 취업 포털용 프로필 업데이트 가이드 (cv.md 기반)

이 문서는 `cv.md` 내용을 바탕으로 원티드(Wanted), 사람인(Saramin), 잡코리아(Jobkorea)의 입력 양식에 맞게 최적화된 텍스트입니다. 각 포털의 이력서 등록 페이지에서 아래 내용을 복사하여 붙여넣으시면 됩니다.

---

## 1. 원티드 (Wanted)
*원티드는 성과와 기술적 문제 해결 과정을 중시하며, 요약(이력서 상단)이 가장 중요합니다.*

### [간단 소개글 (Summary)]
3년 이상 Java/Spring Boot 백엔드 개발자 박준호입니다.
운영 안정성과 데이터 정합성을 개선하는 Java/Spring Boot 백엔드 개발자입니다.
검색 장애 대응, 인증 상태 관리, 배치 재실행 안정화, 관리자 API, Redis 상태 정합성처럼 실제 운영에서 문제가 되는 흐름을 줄이는 작업을 해왔습니다. 특히 Python/Airflow로 회사 FTP 배치를 이관하며 실패 지점 추적과 재실행 안정성을 개선했고, 개인 서비스에서는 Lua Script와 잠금(Lock)을 활용해 실시간 세션 동시성 문제를 해결했습니다.

### [경력 상세 및 성과]
**(주)엔셀 | 백엔드 개발자 (2025.01 ~ 현재)**
- **Prism (데이터 처리 파이프라인 마이그레이션)**
  - FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어 Java 배치를 Python/Airflow 기반 파이프라인으로 이관
  - 다운로드/검증/변환/저장/업로드/원본 정리 단계를 분리해 배치 실패 지점 추적과 재처리 흐름 개선
  - 업로드 성공과 DB commit 이후 원본을 삭제하도록 순서를 고정하고 `source_file` unique constraint와 upsert 적재 로직으로 동일 파일 중복 적재 방지
- **DataForge (Spring 검색/인증/관리 API)**
  - 검색 엔진 장애 시 야근 신청 조회가 중단될 수 있어 DB fallback 검색 경로를 설계하고 ES/DB 응답 정책을 통일
  - 인덱스와 Unique Constraint 최적화로 조회 성능 개선 및 중복 신청/승인 방지
  - Refresh Token을 Redis TTL 기준으로 일원화해 인증 상태 판단 기준 단순화
- **SMIP (공통 예외 처리 및 테스트 도입)**
  - API마다 달랐던 오류 응답과 validation 메시지 기준을 공통화하고 JUnit5/Mockito 회귀 테스트를 도입해 동일 오류 재발률 30% 감소, 장애 분석 시간 40분 ➔ 12분으로 단축

**헥토 | 백엔드 개발자 (2022.08 ~ 2024.07)**
- **KMS (CI/CD 파이프라인 표준화)**
  - 수동 배포 누락과 환경 차이 리스크를 줄이기 위해 GitLab CI/CD, Docker, Nginx 기반 빌드·테스트·배포 파이프라인 표준화
  - 배포 리드타임 1시간 ➔ 25분 단축 및 수동 배포 실패율 0% 달성
- **SmartQ (RAG 기반 검색 API 도입)**
  - 키워드 검색만으로는 사내 문서의 맥락을 찾기 어려운 문제를 OpenAI API, LangChain 기반 RAG 검색 API로 보완해 질의응답 정확도 향상 (60% ➔ 80%)

---

## 2. 사람인 (Saramin) / 잡코리아 (Jobkorea)
*사람인과 잡코리아는 '경력기술서' 항목에 프로젝트별 기간, 담당 업무, 성과를 구조화해서 적는 것이 유리합니다.*

### [핵심 역량 및 요약]
- **총 경력:** 3년 이상
- **주요 기술:** Java, Spring Boot, JPA, PostgreSQL, Redis, Elasticsearch, Airflow, CI/CD, Docker
- **핵심 역량:**
  1. 레거시 시스템 개선: Java 배치 시스템을 Python/Airflow로 이관하여 실패 추적, 중복 적재 방지, 재실행 정합성 개선
  2. 시스템 안정화: Redis Lua Script, 비관적 락(Pessimistic Lock) 등을 활용한 동시성 이슈 제어
  3. 인프라 및 운영: GitLab CI/CD 배포 자동화, SSL/DNS 설정 등 운영 전반 경험

### [상세 경력기술서]

**1. (주)엔셀 (2025.01 ~ 현재) / 백엔드 개발자**
**[Prism - Airflow 데이터 처리 파이프라인 구축]**
- **내용:** 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있던 Java/FTP 기반 배치 시스템을 Python/Airflow 기반으로 이관
- **성과:** 
  - 단계별 로직 분리로 에러 발생 지점 파악과 해당 지점부터의 재처리 흐름 개선
  - 업로드 성공과 DB commit 이후 원본을 삭제하도록 순서를 고정해 데이터 유실 없는 재실행 구조 확보
  - `source_file` unique constraint와 upsert 기반 적재로 동일 파일 중복 적재 방지

**[DataForge - 검색 및 인증 백엔드 개발]**
- **내용:** 검색 장애 상황에서도 야근 신청/승인 조회와 운영 대응이 가능하도록 관리자 API 및 인증(JWT/OAuth2) 관리 흐름 개선
- **성과:**
  - 검색 엔진(Elasticsearch) 비활성화 시 DB fallback 검색으로 전환되도록 설계해 검색 중단 위험 완화
  - Redis TTL을 활용한 Refresh Token 관리로 로그인/갱신/로그아웃 상태 판단 기준 일원화

**[SMIP - 예외 처리 및 테스트 고도화]**
- **내용:** API별로 달랐던 오류 응답과 validation 메시지 기준을 공통화하고 JUnit5/Mockito 기반 회귀 테스트 작성
- **성과:** 표준 오류 응답 통합으로 장애 분석 리드타임 70% 단축 (40분 ➔ 12분)

**2. 헥토 (2022.08 ~ 2024.07) / 백엔드 개발자**
**[KMS - CI/CD 표준화]**
- **성과:** 수동 배포 누락과 환경 차이를 줄이기 위해 GitLab CI/CD, Docker 기반 빌드/배포 자동화 (배포 리드타임 1시간 ➔ 25분 단축)
**[SmartQ - 지식 검색 자동화]**
- **성과:** 키워드 검색의 맥락 한계를 보완하기 위해 LangChain 및 OpenAI API 기반 RAG 검색 API 구축 (답변 대기시간 5분 ➔ 1분 단축)
**[SafeCash - 정기 배치 자동화]**
- **성과:** 수동 실행과 개발자 DB 확인 의존도를 줄이기 위해 Crontab 기반 정기 데이터 동기화와 관리자 API 재처리 흐름 구축

**3. VoiceLink (2024 ~ 현재) / 1인 개인 서비스**
**[실시간 매칭 및 통화 서비스 설계·운영]**
- **내용:** LiveKit, WebRTC 기반의 실시간 음성 매칭 서비스 기획 및 전체(백엔드/인프라) 개발
- **성과:**
  - 취소 직후 stale match와 동일 후보 중복 선점 문제를 Redis ZSET 대기열 및 Lua Script 기반 원자적(Atomic) 처리로 차단
  - Pub/Sub 유실, 유령 세션, 종료 후 재매칭 충돌 문제를 DB Outbox 패턴 및 PESSIMISTIC_WRITE 적용으로 정리
  - Docker, Nginx Reverse Proxy, Let's Encrypt SSL 적용 등 단독 서버 인프라 구축 및 상용 배포

---

### [스킬 태그 (입력용)]
`Java`, `Spring Boot`, `JPA`, `PostgreSQL`, `MySQL`, `Redis`, `Elasticsearch`, `Airflow`, `Python`, `GitLab CI/CD`, `Docker`, `WebRTC`, `LiveKit`, `OAuth2`, `JWT`
