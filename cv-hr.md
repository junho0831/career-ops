# 박준호 | 백엔드 개발자

> 운영 중인 실시간 매칭·통화 서비스 VoiceLink를 1인 개발하고, 배포·운영까지 직접 맡은 백엔드 개발자
Spring Boot, Redis, LiveKit, Docker, Nginx 기반으로 서비스 설계부터 운영까지 전 과정을 책임졌습니다. Redis를 빠른 상태 저장소로, DB를 최종 기준 데이터로 분리해 실시간 매칭과 통화 종료 정합성을 설계했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 1인 운영 | 60% | 30% |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 실시간 서비스 1인 운영 | CI/CD 자동화로 배포 시간 단축 | 테스트 코드 도입으로 장애 재발률 감소 |

- Spring Boot, Redis, LiveKit, Docker, Nginx 기반 실시간 서비스 설계·구현·운영
- 회사 업무에서 Spring 기반 업무 시스템, 공통 예외/검증 정책, 검색 장애 fallback, Redis 인증, 배포 자동화, 배치 자동화 수행
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

## 엔셀 - Prism

📅 `2026.02 ~ 현재`

`Python` `Airflow` `SQLite` `FTP`

- Java 기반 FTP 파일 처리 배치를 Python/Airflow 구조로 마이그레이션
- 입력일+전날 FTP 폴더 스캔, 업로드/DB commit 성공 후 원본 삭제, Rupi `source_file` unique + upsert 구조로 재실행 리스크를 낮춘 파일 처리 흐름 구축

## 엔셀 - DataForge

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- Elasticsearch 비활성/검색 예외 상황에서 DB fallback 검색으로 전환하는 구조 구현
- RDB 인덱스와 unique constraint로 야근 신청 조회 성능과 중복 신청/중복 승인 방지 정합성을 함께 고려
- JWT + Redis 기반 인증 구조로 Refresh Token 저장/검증/회전/삭제 흐름 일원화
- 관리자 API, 표준 오류 응답, 알림 메일, 전체 재색인, 선택적 시트 CSV 동기화로 운영 흐름 보강

## 엔셀 - SMIP 유지보수

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- 공통 예외 처리 계층, 표준 오류 응답, 검증 메시지 기준, 테스트 코드 도입으로 장애 분석 리드타임 단축
- MVVM + 공통 스토어 구조로 화면 상태 관리 복잡도와 인수인계 비용 개선

## 헥토 - AI/개발팀

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- LangChain·RAG 기반 사내 문서 검색 기능 구현
- GitLab CI/CD + Docker 기반 배포 자동화 파이프라인 구축
- Nginx + Staging 환경 표준화로 배포 전 검증 절차와 API 협업 흐름 정리

## 헥토 - 세이프캐시 마이데이터개발팀

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

- 정기 배치 자동화, 실행 이력/결과 로깅, Admin UI/API 재처리 흐름으로 데이터 정합성 이슈 감소

---

**GitHub** https://github.com/junho0831
