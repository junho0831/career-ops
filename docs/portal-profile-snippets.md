# 사람인·원티드·잡코리아 포털용 문구

## 공통 한 줄 소개

실시간 매칭·통화 서비스 VoiceLink를 1인 개발·배포·운영하며 Spring Boot, Redis, LiveKit, Docker, Nginx 기반의 실서비스 운영 경험을 쌓은 백엔드 개발자입니다.

## 공통 자기소개 요약

저는 설계부터 구현, 배포, 운영까지 끝까지 책임지는 백엔드 개발자입니다. 회사 업무에서는 Spring Boot 기반 백엔드, Redis/JWT 인증, Elasticsearch 장애 대응, Airflow 배치 마이그레이션, CI/CD 자동화 등을 수행했고, 개인 서비스로는 실시간 매칭·통화 서비스 VoiceLink를 직접 개발해 운영하고 있습니다.

VoiceLink는 랜덤 음성 매칭을 제공하는 실서비스입니다. Spring Boot API, Redis 기반 매칭 상태 관리, LiveKit 음성 연결, Docker 배포, Nginx/SSL/도메인 운영까지 직접 구축했습니다. 특히 취소 직후 stale match가 재반환되는 문제, 종료되지 않은 세션이 재매칭 시 충돌하는 유령 세션 문제, WebRTC 연결을 위한 TURN/STUN·포트포워딩·SNI 설정 문제를 실제 운영 환경에서 추적하고 해결했습니다.

단순히 기능을 구현하는 것보다 장애가 반복되지 않는 구조를 만드는 데 강점이 있습니다. 회사 업무에서도 CI/CD 자동화로 배포 리드타임을 1시간에서 25분으로 줄이고 배포 실패율을 5%에서 0%로 낮췄으며, 공통 예외 처리와 테스트 도입으로 장애 분석 시간을 40분에서 12분으로 줄인 경험이 있습니다.

## 사람인 프로필 핵심역량

- Spring Boot 기반 백엔드 API 설계·구현·운영
- Redis 기반 인증, 세션, 실시간 매칭 상태 관리
- LiveKit/WebRTC 기반 실시간 음성 통화 서비스 구축
- Docker, Nginx, SSL, 도메인, 포트포워딩 운영 경험
- Airflow 배치 마이그레이션 및 idempotent 처리 구조 설계
- CI/CD 자동화와 테스트 도입을 통한 운영 리스크 감소

## 원티드 소개 문구

Spring Boot와 Redis를 중심으로 백엔드 시스템을 설계하고 운영해왔습니다. 최근에는 실시간 매칭·통화 서비스 VoiceLink를 1인 개발·운영하며 Redis 기반 매칭 정합성, LiveKit 음성 연결, Docker/Nginx 배포, SSL/도메인 운영까지 직접 다뤘습니다. 회사 업무에서는 Airflow 배치 마이그레이션, Elasticsearch 장애 시 DB fallback, JWT/Redis 인증 구조, GitLab CI/CD 자동화 등을 수행했습니다.

## 잡코리아 자기소개 첫 문단

저는 실제 서비스가 안정적으로 동작하는 구조를 만드는 데 집중하는 백엔드 개발자입니다. 개인 서비스 VoiceLink를 통해 실시간 매칭·통화 서비스를 직접 개발하고 `https://voice-link.co.kr` 도메인으로 운영하면서, Spring Boot API 개발뿐 아니라 Redis 기반 상태 정합성, LiveKit/WebRTC 연결, Docker 배포, Nginx/SSL/네트워크 설정까지 전 과정을 경험했습니다.

## 대표 프로젝트 입력용

프로젝트명: VoiceLink - 실시간 매칭·통화 서비스  
기간: 2024 ~ 현재  
역할: 1인 개발·배포·운영  
서비스 URL: https://voice-link.co.kr  
GitHub: https://github.com/junho0831/VoiceLink  
기술: Java, Spring Boot, Redis, LiveKit, WebRTC, Docker, Nginx, CI/CD

설명:
랜덤 음성 매칭을 제공하는 실시간 통화 서비스입니다. Spring Boot 기반 API, Redis 매칭 큐와 세션 상태 관리, LiveKit 기반 음성 통화 연결, Docker 배포, Nginx reverse proxy/stream SNI, Let's Encrypt SSL, 도메인 운영까지 직접 구축했습니다. 취소 직후 stale match가 반환되는 문제와 종료되지 않은 세션이 재매칭 시 충돌하는 유령 세션 문제를 해결했고, WebRTC 연결을 위해 TURN/STUN, 방화벽, 포트포워딩, HTTPS 설정을 운영 환경에서 검증했습니다.
