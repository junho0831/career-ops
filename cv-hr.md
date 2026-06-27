# 박준호 | 백엔드 개발자

> Spring Boot 기반 업무 시스템에서 검색 fallback, Redis 인증, RDB 제약조건, 공통 예외 처리, 배치 재실행 안정성을 개선해온 백엔드 개발자
회사 업무에서는 Elasticsearch 예외 시 DB fallback, Redis 기반 Refresh Token 관리, RDB index/unique constraint, 공통 예외/검증 정책, CI/CD, Airflow FTP batch, ER Dose 로그 파싱 자동화를 다뤘습니다. 개인 서비스 VoiceLink에서는 실시간 매칭·통화 서비스를 1인 개발·운영하며 동시성 정합성과 운영 인프라 문제를 직접 해결했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 운영형 백엔드 | 60% | 30% |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 장애·정합성·배치 개선 | CI/CD 자동화로 배포 시간 단축 | 테스트 코드 도입으로 장애 재발률 감소 |

- 회사 업무에서 Spring 기반 관리자 API, 공통 예외/검증 정책, 검색 장애 fallback, Redis 인증, 배포 자동화, Airflow 배치, 운영 로그 파싱 구조화를 구현
- 야근 신청/승인, 직원 관리, 검색 인덱스, 알림, 재처리 기능을 API, transaction, index, unique constraint 기준으로 설계
- Spring Boot, Redis, LiveKit, Docker, Nginx 기반 실시간 서비스 설계·구현·운영
- 동시성 상황에서 트랜잭션, 락, unique constraint, DB Outbox 패턴으로 데이터 정합성을 지킨 경험
- 설계 -> 구현 -> 배포 -> 운영까지 전 과정을 직접 수행
- 운영 중 발생한 세션 충돌, 재매칭 오류, 배포 이슈를 직접 추적하고 안정화

---

# 대표 프로젝트

## VoiceLink - 실시간 매칭·통화 서비스

📅 `2024 ~ 현재` · 개인 서비스 (1인 개발·운영)

`Java` `Spring Boot` `Redis` `LiveKit` `Docker` `Nginx` `WebRTC`

서비스: https://voice-link.co.kr

- 실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고, Docker·Nginx 기반 운영 환경까지 직접 구축했습니다.
- Redis Lua Script 기반 매칭 큐, DB Outbox + Redis Pub/Sub 결과 전파, LiveKit/WebRTC 연결 구조를 설계했습니다.
- stale match, 유령 세션, 통화 종료 후 재매칭 충돌 문제를 해결하기 위해 원자적 후보 선점, Cancel Marker, 현재 연결 기준 대기열 정리, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` 기준 종료 처리를 적용했습니다.
- SSL, DNS, 포트포워딩, TURN/STUN, HTTPS 설정을 직접 다루며 실제 서비스 운영 경험을 쌓았습니다.

---

# 경력

## 엔셀 - Prism Airflow FTP Batch Migration

📅 `2026.02 ~ 현재`

`Python` `Airflow` `SQLite` `FTP`

- Java 기반 FTP 파일 처리 배치를 Python/Airflow DAG로 마이그레이션
- ER Dose RAW warning 파싱과 EUV root cause 파싱을 분리해, 서로 다른 입력 테이블과 적재 대상에 맞는 배치 경로로 재구성
- 실제 운영 로그의 라벨 변형과 줄바꿈 문자열, 숫자/단위 표현 차이를 흡수하는 파서를 넣어 사람이 손보지 않아도 구조화 적재가 되도록 개선
- `max_active_runs=1`, `catchup=False`, 입력일+전날 FTP 폴더 스캔으로 반복 실행과 날짜 경계 파일을 처리
- 업로드/DB commit 이후 FTP 원본 삭제, Rupi `source_file` unique + upsert, 파일 다운로드/업로드 검증, scratch cleanup을 적용
- 전체 적재를 한 번에 처리하지 않고 `chunk 조회 -> 파싱 -> COPY 적재`로 반복해 대용량 로그도 안정적으로 처리할 수 있게 구성

## 엔셀 - DataForge Spring 검색/인증/관리 API

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- Elasticsearch 비활성/검색 예외 시 DB fallback 검색으로 전환하고 ES/DB 응답 스키마를 맞춰 승인/조회 기능을 유지
- RDB 인덱스와 unique constraint로 야근 신청 조회 성능과 중복 신청/중복 승인 방지 정합성을 함께 고려
- JWT + Redis 기반 인증 구조로 Refresh Token 저장/검증/회전/삭제를 TTL 기반으로 일원화
- 관리자 API, 표준 오류 응답, 알림 메일, 전체 재색인, 선택적 시트 CSV 동기화 기능을 연결
- 신청/승인/반려/검색/알림/관리자 수정 기능을 하나의 백오피스 API로 정리

## 엔셀 - SMIP Spring 공통 예외 처리 및 회귀 테스트

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- 공통 예외 처리 계층, 표준 오류 응답, 검증 메시지 기준, 테스트 코드 도입으로 장애 분석 리드타임 단축
- MVVM + 공통 스토어 구조로 화면 상태 관리 복잡도와 인수인계 비용 개선
- 반복 장애 케이스를 테스트와 문서화 대상으로 분리해 신규 유지보수자도 같은 방식으로 재현·분석 가능하게 개선

## 헥토 - KMS CI/CD 표준화 및 SmartQ RAG 검색 API

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- LangChain·RAG 기반 사내 문서 검색 기능 구현
- GitLab CI/CD + Docker 기반 배포 자동화 파이프라인 구축
- Nginx + Staging 환경을 구성해 배포 전 API 검증 경로 분리
- 빌드 산출물, 실행 환경, 배포 경로를 표준화해 수동 배포 누락과 환경 차이를 줄임

## 헥토 - 세이프캐시 정기 배치 및 Admin 재처리 API

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

- 정기 배치 자동화, 실행 이력/결과 로깅, Admin UI/API 조회·수정·재처리 기능으로 데이터 정합성 이슈 감소
- 수동 배치 실행과 개발자 DB 확인에 의존하던 작업을 자동 실행, 결과 로깅, 재처리 API 구조로 전환

---

**GitHub** https://github.com/junho0831
