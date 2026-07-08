# 박준호 | 백엔드 개발자

> 운영 안정성과 데이터 정합성을 개선하는 Java/Spring Boot 백엔드 개발자
회사 업무에서는 검색 장애 대응, 인증 상태 관리, 배치 재실행 안정화, ER Dose RAW/EUV 로그 파싱 자동화, 공통 오류 응답, 운영자 재처리 API처럼 실제 운영 중 문제가 되는 흐름을 줄이는 작업을 맡았습니다. 개인 서비스 VoiceLink에서는 실시간 매칭·통화 서비스를 1인 개발·운영하며 동시성 정합성과 운영 인프라 문제를 직접 해결했습니다.
>

📧 junho6667@gmail.com　　📱 010-3525-6275　　🔗 github.com/junho0831

서비스: https://voice-link.co.kr

---

## 한눈에 보기

| 3년+ | 운영형 백엔드 | 60% | 30% |
| --- | --- | --- | --- |
| 백엔드 개발 경력 | 장애·정합성·배치 개선 | CI/CD 자동화로 배포 시간 단축 | 테스트 코드 도입으로 장애 재발률 감소 |

- 운영 중단, 중복 처리, 데이터 유실, 재처리 실패 가능성을 줄이는 백엔드 개선 경험
- 검색 장애 fallback, Redis TTL 인증 상태, RDB index/unique constraint, transaction 기준으로 운영 API 설계
- Python/Airflow 기반 FTP 배치 이관과 ER Dose RAW/EUV 로그 파싱 구조화 경험
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

- 실시간 매칭에서 취소 직후 이전 결과가 반환되거나 동일 후보가 중복 선점되는 문제가 있어 Redis Lua Script 기반 Atomic Claim과 Cancel Marker 재검증 구조를 적용했습니다.
- Pub/Sub 유실이나 노드 재시작 상황에서도 매칭 결과를 회수할 수 있도록 DB Outbox + Redis Pub/Sub + TTL result key 구조를 설계했습니다.
- 유령 세션과 통화 종료 후 재매칭 충돌 문제를 해결하기 위해 `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`, `CallSession.ended_at` 기준 종료 처리를 적용했습니다.
- SSL, DNS, 포트포워딩, TURN/STUN, HTTPS 설정을 직접 다루며 실제 서비스 운영 경험을 쌓았습니다.

---

# 경력

## 엔셀 - Prism Airflow FTP Batch Migration

📅 `2026.02 ~ 현재`

`Python` `Airflow` `PostgreSQL` `FTP`

- FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어 Java 배치를 Python/Airflow DAG로 이관
- 다운로드, 검증, 변환, 저장, 업로드, 원본 정리 단계를 task로 분리해 어느 단계에서 실패했는지 확인하고 해당 지점부터 재처리할 수 있도록 개선
- ER Dose RAW warning 파싱과 EUV root cause 파싱을 별도 실행 경로로 분리하고, 운영 로그 라벨 변형과 숫자/단위 표현 차이를 흡수하는 파서 구성
- 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정해 데이터 유실 없이 재실행 가능하도록 설계
- `source_file` unique constraint와 upsert 적재 로직을 적용해 동일 파일이 반복 실행에서 중복 적재되는 문제 방지
- `max_active_runs=1`, `catchup=False`, 입력일+전일 FTP 폴더 스캔, scratch cleanup으로 날짜 경계 누락과 반복 실행 리스크 축소
- `chunk 조회 -> 파싱 -> COPY 적재` 반복 구조와 chunk별 처리량 로그로 대용량 로그 파싱 배치의 메모리 사용량과 운영 관측성 개선

## 엔셀 - DataForge Spring 검색/인증/관리 API

📅 `2026.01 ~ 현재`

`Java` `Spring Boot` `PostgreSQL` `Redis` `Elasticsearch` `JWT` `OAuth2`

- 검색 엔진 비활성 또는 예외 상황에서 야근 신청 조회가 중단될 수 있어 Elasticsearch 실패 조건을 분리하고 DB fallback 검색 경로를 설계
- ES/DB 응답 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 사용자와 운영자가 동일한 조회 결과를 해석할 수 있도록 개선
- RDB 인덱스와 unique constraint로 야근 신청 조회 성능과 중복 신청·승인 방지 정합성을 함께 개선
- Refresh Token 저장, 검증, 회전, 삭제를 Redis TTL 기준으로 일원화해 로그인·갱신·로그아웃 상태 관리 단순화
- 관리자 API, 표준 오류 응답, 알림 메일, 재색인, 시트 동기화 기능을 연결해 운영 대응 흐름 정리

## 엔셀 - SMIP Spring 공통 예외 처리 및 회귀 테스트

📅 `2025.01 ~ 2025.12`

`Java` `Spring Boot` `Vue.js` `JUnit5` `Mockito`

- API마다 오류 응답과 validation 메시지 해석 방식이 달라 장애 분석 기준이 흔들리는 문제가 있어 공통 예외 처리 계층과 표준 오류 응답으로 통합
- 프론트엔드, 운영자, 개발자가 같은 오류 포맷을 기준으로 원인을 파악하도록 validation 정책과 메시지 구조 정리
- 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정해 담당자 기억이 아니라 테스트로 재발 여부를 확인하도록 개선
- Vue.js 화면 상태를 MVVM + 공통 스토어 구조로 재정리해 변경 영향 범위와 인수인계 비용 축소

## 헥토 - KMS CI/CD 표준화 및 SmartQ RAG 검색 API

📅 `2023.10 ~ 2024.07`

`Java` `Spring Boot` `GitLab CI/CD` `Docker` `Nginx` `LangChain`

- 수동 배포 과정에서 빌드 산출물, 실행 환경, 배포 경로가 달라져 배포 누락과 환경 차이 리스크가 발생할 수 있는 구조를 개선
- GitLab CI/CD와 Docker 기반으로 빌드·테스트·배포 단계를 표준화하고, Nginx + Staging 환경으로 배포 전 API 검증 경로 분리
- 배포 절차를 개인 숙련도에 의존하지 않는 팀 공통 흐름으로 정리해 릴리스 리드타임을 `1시간 → 25분`, 배포 실패 비율을 `5% → 0%`로 개선
- 사내 문서 검색이 키워드 일치에 의존해 원하는 답을 찾기 어렵고 상담·운영 담당자가 문서를 직접 찾아야 하는 병목이 있어 LangChain 기반 RAG 검색 API 구축
- 문서 맥락 기반 질의응답 API를 분리된 모듈로 적용해 검색 정확도를 `60% → 80%`, 답변 대기 시간을 `5분 → 1분`으로 개선하고 상담팀 반복 검색 업무를 주당 `12시간` 절감

## 헥토 - 세이프캐시 정기 배치 및 Admin 재처리 API

📅 `2022.08 ~ 2023.09`

`Java` `Spring Boot` `Crontab`

- 정기 데이터 동기화가 수동 실행과 개발자 DB 확인에 의존해 누락, 중복, 복구 지연이 발생할 수 있는 구조를 개선
- Crontab 기반 정기 배치로 동기화 작업을 자동화하고, 실행 이력과 결과 로그를 남겨 운영자가 이상 징후를 직접 확인할 수 있도록 개선
- Admin UI/API에 조회·수정·재처리 기능을 연결해 장애 발생 시 개발자가 직접 DB를 확인하던 복구 흐름을 운영자 중심의 재처리 흐름으로 전환
- 반복되던 데이터 정합성 이슈를 `월 3건 → 0건`으로 개선

---

**GitHub** https://github.com/junho0831
