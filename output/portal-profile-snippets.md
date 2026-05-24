# `cv.md` 기반 포털 이력서 업데이트본

기준일: 2026-05-24  
기준 파일: `cv.md`  
대상 포털: 사람인, 원티드, 잡코리아

## 공통 포지셔닝

- Java/Spring Boot 기반 운영형 백엔드 개발자
- 인증, 검색 fallback, 관리자 API, 배치 자동화, Redis 상태 정합성, RDB 제약조건 설계 경험
- 장애 분석, 재발 방지, 운영 자동화, 배포 안정화에 강점
- 개인 서비스 VoiceLink를 1인 개발·배포·운영하며 실시간 매칭/세션 정합성 문제 해결 경험 보유

## 원티드

원티드는 기술 키워드와 직접 구현한 내용이 먼저 보여야 한다.

### 한 줄 소개

Spring Boot 기반 운영형 백엔드 개발자로, 인증·검색 fallback·배치·관리자 API·Redis 상태 정합성 개선을 중심으로 실제 운영 환경의 문제를 해결해왔습니다.

### 소개 문구

```md
Java/Spring Boot 기반 백엔드 개발자로, 운영 중인 업무 시스템에서 인증, 검색 fallback, 관리자 API, 배치 자동화, 공통 예외 처리, 데이터 정합성 개선을 중심으로 일해왔습니다.

엔셀에서는 Elasticsearch 장애 시 DB fallback 검색 구조, Redis TTL 기반 Refresh Token 관리, 관리자 API, 공통 예외/validation 응답 표준화, Airflow 기반 FTP 데이터 처리 자동화 파이프라인을 구현했습니다. 헥토에서는 GitLab CI/CD, Docker, Nginx 기반 배포 표준화와 RAG 검색 API, 운영 재처리 API를 개발했습니다.

개인 서비스 VoiceLink에서는 Redis Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub, FOR UPDATE SKIP LOCKED, PESSIMISTIC_WRITE를 활용해 실시간 매칭과 세션 정합성 문제를 해결했고, LiveKit/WebRTC, Docker, Nginx, SSL, DNS까지 직접 운영했습니다.

대규모 플랫폼 리딩보다는 실제 운영되는 백엔드 시스템에서 장애 가능성을 줄이고 상태 정합성, 배포, 배치, 인증, 검색 흐름을 끝까지 책임지는 역할에 강점이 있습니다.
```

### 대표 프로젝트

```md
VoiceLink | 실시간 매칭·통화 서비스

- 1인 개발·배포·운영 중인 실시간 음성 매칭 서비스
- Redis ZSET 대기열, Presence TTL, Lua Script Atomic Claim 기반 매칭 정합성 설계
- DB Outbox + Redis Pub/Sub + FOR UPDATE SKIP LOCKED 기반 결과 전달 안정성 확보
- PESSIMISTIC_WRITE, CallSession.ended_at 기준 종료 직렬화로 유령 세션/중복 종료 문제 해결
- LiveKit/WebRTC, Docker, Nginx, SSL, DNS까지 직접 운영
```

## 사람인

사람인은 HR 관점에서 성과와 안정화 경험이 먼저 읽히는 편이 유리하다.

### 한 줄 소개

3년 이상 백엔드 개발 경험을 바탕으로 운영 중인 서비스의 장애 가능성과 데이터 정합성 문제를 줄여온 Java/Spring Boot 백엔드 개발자입니다.

### 소개 문구

```md
3년 이상 백엔드 개발 경험을 바탕으로 Spring Boot 기반 업무 시스템, 관리자 API, 인증, 검색, 배치 자동화, 공통 예외 처리, CI/CD 개선 업무를 수행해왔습니다.

운영 환경에서 발생할 수 있는 장애와 데이터 정합성 문제를 줄이는 데 강점이 있습니다. Elasticsearch 장애 시 DB fallback 검색 구조를 적용하고, Redis 기반 Refresh Token 관리, RDB 제약조건을 활용한 중복 데이터 방지, 공통 오류 응답 표준화, 테스트 코드 도입으로 장애 분석과 재발 방지에 기여했습니다.

또한 개인 서비스 VoiceLink를 1인 개발·운영하며 Redis 기반 실시간 매칭, WebRTC 통화 연결, Docker/Nginx/SSL/DNS 설정까지 직접 구축했습니다.

실제 서비스 운영 환경에서 문제를 분석하고 코드·구조·배포 흐름을 함께 개선하는 운영형 백엔드 개발자로 포지셔닝하고 있습니다.
```

### 핵심역량 키워드

```md
Java, Spring Boot, JPA, REST API, PostgreSQL, MySQL, Redis, Elasticsearch, JWT, OAuth2, JUnit5, Mockito, GitLab CI/CD, Docker, Nginx, Airflow, WebRTC, LiveKit, OpenAI API, LangChain
```

### 대표 성과

```md
- Elasticsearch 장애 시 DB fallback 검색 구조 적용으로 검색 중단 위험 완화
- Redis TTL 기반 Refresh Token 저장/검증/갱신/삭제 흐름 일원화
- 공통 예외 처리 및 테스트 코드 도입으로 장애 분석 리드타임 40분에서 12분으로 단축, 동일 오류 재발률 30% 감소
- GitLab CI/CD 표준화로 릴리스 리드타임 1시간에서 25분으로 단축, 배포 실패율 5%에서 0%로 개선
- RAG 검색 API 개선으로 답변 정확도 60%에서 80%로 향상, 대기 시간 5분에서 1분으로 단축
- 정기 배치와 Admin 재처리 API 개선으로 데이터 정합성 이슈 월 3건에서 0건으로 감소
```

## 잡코리아

잡코리아는 경력기술서 성격이 강해서 문단보다 항목형이 더 잘 맞는다.

### 한 줄 소개

업무 시스템 개발, 운영 API 개선, 배치 자동화, 인증·검색 기능 개선, 공통 예외 처리와 테스트 코드 도입 경험을 보유한 Java/Spring Boot 백엔드 개발자입니다.

### 소개 문구

```md
Java/Spring Boot 기반 백엔드 개발자로 업무 시스템 개발, 운영 API 개선, 배치 자동화, 인증/검색 기능 개선, 공통 예외 처리 및 테스트 코드 도입 경험을 보유하고 있습니다.

주요 경험은 다음과 같습니다.

- Spring Boot 기반 야근 신청/승인 관리 시스템 개발 및 운영
- Elasticsearch 검색 예외 발생 시 DB fallback 검색 구조 적용
- Redis TTL 기반 Refresh Token 저장/검증/갱신/삭제 흐름 구현
- RDB index 및 unique constraint를 활용한 조회 성능 및 데이터 정합성 개선
- 관리자 API, 재색인 API, 시트 동기화 등 운영 기능 구현
- 공통 예외 처리 및 validation 응답 표준화
- GitLab CI/CD와 Docker 기반 배포 자동화
- Airflow 기반 FTP 배치 마이그레이션 및 재실행 안정성 개선
- Redis 기반 실시간 매칭 서비스 VoiceLink 1인 개발 및 운영

실제 운영 환경에서 장애 원인을 분석하고, 재발 방지를 위해 코드 구조, 데이터 제약조건, 테스트, 배포 자동화를 함께 개선하는 백엔드 개발을 지향합니다.
```

### 경력기술서 축약 bullet

```md
[엔셀]
- Airflow 기반 FTP 데이터 처리 자동화 파이프라인 구축 및 재실행 안정성 개선
- Elasticsearch 장애 시 DB fallback 검색 구조 적용
- Redis TTL 기반 Refresh Token 관리 일원화
- 공통 예외 처리, validation 응답 표준화, JUnit5/Mockito 회귀 테스트 도입

[헥토]
- GitLab CI/CD, Docker, Nginx 기반 배포 표준화
- RAG 검색 API 구현으로 답변 정확도와 처리 속도 개선
- Crontab 기반 정기 배치와 Admin 재처리 API로 운영 복구 효율 향상

[개인 프로젝트]
- VoiceLink 실시간 매칭·통화 서비스 1인 개발·배포·운영
- Redis Lua Script, DB Outbox, FOR UPDATE SKIP LOCKED, PESSIMISTIC_WRITE 기반 상태 정합성 문제 해결
```

## 입력 우선순위

- 원티드: `한 줄 소개` + `소개 문구` + `대표 프로젝트`
- 사람인: `한 줄 소개` + `소개 문구` + `핵심역량 키워드` + `대표 성과`
- 잡코리아: `한 줄 소개` + `소개 문구` + `경력기술서 축약 bullet`

## 반영 메모

- 포털별 톤만 다르게 두고, 경력 연차/기술 스택/성과 수치는 `cv.md`와 맞췄다.
- 과장되기 쉬운 "대규모 트래픽 리딩", "MSA 리딩", "Kafka/Kubernetes 운영 주도" 표현은 넣지 않았다.
- 사람인/잡코리아 경력기술서 입력 시 회사별 bullet은 너무 길게 넣지 말고 3-4개씩 우선 반영하는 편이 안전하다.
