# 원티드·사람인·잡코리아 포털용 문구

## 포지셔닝 원칙

대규모 트래픽 플랫폼 리딩 경험을 전면에 내세우지 않는다. 대신 실제 운영되는 백엔드 시스템에서 장애 가능성을 줄이고, 상태 정합성·배포·배치·인증·검색 흐름을 끝까지 책임지는 운영형 백엔드 개발자로 포지셔닝한다.

강하게 밀 키워드:
- 운영형 백엔드
- 장애 원인 추적과 재발 방지
- 인증, 검색 fallback, 배치, 관리자 API
- Redis 기반 실시간 상태 정합성
- RDB index, unique constraint, transaction
- 개인 서비스 완주와 인프라 운영

약하게 보이거나 과장 금지할 키워드:
- 대규모 트래픽 서비스 리딩
- 빅테크급 플랫폼 경험
- 대규모 MSA 아키텍처 리딩
- Kafka/Kubernetes 운영 주도
- DDD/아키텍처 리딩

## 공통 한 줄 소개

운영 중인 백엔드 시스템에서 인증, 검색, 배치, 관리자 API, 데이터 정합성, 장애 재발 방지를 개선해온 Java/Spring 백엔드 개발자입니다.

## 원티드용 소개

원티드는 개발자와 실무 리더가 읽을 가능성이 높으므로 기술 키워드와 구현 근거를 앞에 둔다.

```md
Spring Boot 기반 백엔드 개발자로, 운영 중인 업무 시스템에서 인증, 검색 fallback, 배치, 관리자 API, 공통 예외 처리, 데이터 정합성 개선을 주로 경험했습니다.

회사 프로젝트에서는 Elasticsearch 장애/예외 상황에서 DB fallback 검색을 적용하고, Redis TTL 기반 Refresh Token 관리, RDB index/unique constraint, @Transactional 기반 관리자 API, GlobalExceptionHandler/validation 응답 표준화, GitLab CI/CD, Airflow FTP batch를 다뤘습니다.

개인 서비스 VoiceLink에서는 Redis Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub, FOR UPDATE SKIP LOCKED, PESSIMISTIC_WRITE, CallSession.ended_at source of truth를 활용해 실시간 매칭/세션 정합성 문제를 해결했습니다.

대규모 플랫폼 리딩보다는, 실제 운영되는 백엔드 시스템에서 장애 가능성을 줄이고 상태 정합성, 배포, 배치, 인증, 검색 흐름을 끝까지 책임지는 운영형 백엔드 역할에 강점이 있습니다.
```

## 사람인용 소개

사람인은 HR/인사담당자가 먼저 볼 가능성이 높으므로 “무엇을 개선했는지”를 먼저 보여주고, 기술 키워드는 뒤에서 보강한다.

```md
3년 이상 백엔드 개발 경험을 바탕으로 Spring Boot 기반 업무 시스템, 관리자 API, 인증, 검색, 배치 자동화, 공통 예외 처리, CI/CD 개선 업무를 수행해왔습니다.

운영 중 발생할 수 있는 장애와 데이터 정합성 문제를 줄이는 데 강점이 있습니다. Elasticsearch 장애 시 DB fallback 검색 구조를 적용하고, Redis 기반 Refresh Token 관리, RDB 제약조건을 활용한 중복 데이터 방지, 공통 오류 응답 표준화, 테스트 코드 도입으로 장애 분석과 재발 방지에 기여했습니다.

또한 개인 서비스 VoiceLink를 1인 개발·운영하며 Redis 기반 실시간 매칭, WebRTC 통화 연결, Docker/Nginx/SSL/DNS 설정까지 직접 구축했습니다.

대규모 트래픽 플랫폼 리딩보다는, 실제 서비스 운영 환경에서 문제를 분석하고 코드·구조·배포 흐름을 개선하는 운영형 백엔드 개발자로 성장하고 있습니다.
```

## 잡코리아용 소개

잡코리아는 경력기술서처럼 명확하고 보수적으로 쓴다. 문단보다 항목형이 유리하다.

```md
Java/Spring Boot 기반 백엔드 개발자로 업무 시스템 개발, 운영 API 개선, 배치 자동화, 인증/검색 기능 개선, 공통 예외 처리 및 테스트 코드 도입 경험을 보유하고 있습니다.

주요 경험은 다음과 같습니다.

- Spring Boot 기반 야근 신청/승인 관리 시스템 개발 및 운영
- Elasticsearch 검색 예외 발생 시 DB fallback 검색 구조 적용
- Redis TTL 기반 Refresh Token 저장/검증/갱신/삭제 흐름 구현
- RDB index 및 unique constraint를 활용한 조회 성능 및 데이터 정합성 개선
- 관리자 API, 알림 메일, 재색인 API, CSV 동기화 등 운영 기능 구현
- 공통 예외 처리 및 validation 응답 표준화
- GitLab CI/CD와 Docker 기반 배포 자동화
- Airflow 기반 FTP 배치 마이그레이션 및 재실행 안정성 개선
- Redis 기반 실시간 매칭 서비스 VoiceLink 1인 개발 및 운영

실제 운영 환경에서 장애 원인을 분석하고, 재발 방지를 위해 코드 구조, 데이터 제약조건, 테스트, 배포 자동화를 함께 개선하는 백엔드 개발을 지향합니다.
```

## 대표 프로젝트 입력용

프로젝트명: VoiceLink - 실시간 매칭·통화 서비스  
기간: 2024 ~ 현재  
역할: 1인 개발·배포·운영  
서비스 URL: https://voice-link.co.kr  
GitHub: https://github.com/junho0831/VoiceLink  
기술: Java, Spring Boot, Redis, Lua Script, DB Outbox, Pub/Sub, LiveKit, WebRTC, Docker, Nginx, CI/CD

설명:
랜덤 음성 매칭을 제공하는 실시간 통화 서비스입니다. Spring Boot 기반 API, Redis ZSET 대기열, Presence TTL, Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub 결과 전달, LiveKit/WebRTC 통화 연결, Docker 배포, Nginx/SSL/도메인 운영까지 직접 구축했습니다. 취소 직후 stale match가 반환되는 문제, 종료되지 않은 세션이 재매칭 시 충돌하는 유령 세션 문제, 오래된 SSE 종료 콜백이 새 대기열을 삭제하는 Race Condition을 해결했습니다. WebRTC 연결을 위해 TURN/STUN, 방화벽, 포트포워딩, HTTPS 설정도 운영 환경에서 검증했습니다.

## 포털별 사용 우선순위

- 원티드: `원티드용 소개` + `대표 프로젝트 입력용`
- 사람인: `사람인용 소개` + 핵심역량 항목에 Spring, Redis, Elasticsearch, Airflow, CI/CD, Docker/Nginx 입력
- 잡코리아: `잡코리아용 소개` + 경력기술서 각 회사 항목에는 `cv-engineer.md`의 경력 bullet을 축약해서 입력
