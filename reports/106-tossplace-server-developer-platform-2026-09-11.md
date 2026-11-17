# [106] 토스플레이스 (Toss Place / 비바리퍼블리카 계열) — Server Developer (Platform 결제 서버 플랫폼)

> **Platform:** Wanted (원티드 #347509)  
> **Target Date:** 2026-09-11  
> **Evaluation Score:** 5.0 / 5.0 (Block A: 1.0, B: 1.0, C: 1.0, D: 1.0, E: 1.0, F: 1.0)  
> **Company Tier:** 대기업 / 토스(Viva Republica) 오프라인 결제 단말기·페이먼트 플랫폼  
> **Recommendation:** Strong Apply (피드백 기반 분산 락/공통 플랫폼 모듈화 최우선 지원)

---

## 1. 포지션 개요
- **회사명:** 토스플레이스 (Toss Place)
- **팀:** 서버 플랫폼 팀 (Server Platform Team)
- **포지션:** Server Developer (Platform)
- **주요 업무:**
  - 토스플레이스 전체 결제 서비스를 뒷받침하는 공통 코어 플랫폼(Metric, Logging, Distributed Lock, Messaging 등) 모듈화 개발
  - 공통 관심사 플랫폼 서비스(API Gateway, Monitoring & Alert System 등) 개발 및 운영
  - 서버 장애 감지, 빠른 자동 회복(Self-Healing / Reprocessing) 및 고가용성 아키텍처 개선

---

## 2. 매칭 핵심 강점 (Match Highlights)
1. **공통 기능 모듈화 및 Distributed Lock(분산 락) 구현 역량 완벽 일치:**
   - 토스플레이스가 JD에서 핵심으로 명시한 'Distributed Lock, Logging, 공통 모듈화'에 맞춤
   - Redis Single-Threaded Lua Script 원자적 선점(`이중 매칭 0건`), Redis 분산 락 및 SMIP 공통 예외 처리 계층 표준화 경험 보유
2. **Spring Boot / Redis / ELK 스택 100% 매칭:**
   - DataForge의 Elasticsearch 장애 분리 및 DB Fallback 설계, Redis TTL 기반 토큰/세션 관리
3. **결제 트랜잭션 무결성 및 장애 복구(Recovery):**
   - RDB Unique 제약조건 + UPSERT, 멱등성 보장 Admin 재처리 체계 구축

## Machine Summary
```yaml
id: "106"
company: "토스플레이스"
role: "Server Developer (Platform)"
platform: "Wanted"
url: "https://www.wanted.co.kr/wd/347509"
score: 5.0
status: "Applied"
tier: "FinTech"
```
