# [101] 페이민트 (Paymint / 카카오페이 자회사) — 백엔드 개발자 (결제선생 간편결제/전자금융 코어)

> **Platform:** Wanted (원티드 #369598)  
> **Target Date:** 2026-09-11  
> **Evaluation Score:** 5.0 / 5.0 (Block A: 1.0, B: 1.0, C: 1.0, D: 1.0, E: 1.0, F: 1.0)  
> **Company Tier:** 카카오페이 핀테크 자회사 / 전자금융사업자 (결제선생)  
> **Recommendation:** Strong Apply (피드백 기반 간편결제 코어 트랜잭션 최우선 지원)

---

## 1. 포지션 개요
- **회사명:** 페이민트 (Paymint / 카카오페이 자회사)
- **플랫폼:** 결제선생 (모바일 청구과금 및 간편결제 플랫폼)
- **포지션:** 백엔드 개발자(Java/Kotlin)
- **주요 업무:**
  - 결제 플랫폼 백엔드 코어 서비스 아키텍처 설계·개발·운영
  - 대용량 결제 트래픽을 처리하는 고가용성 시스템 설계 및 외부 금융기관/PG사 연동
  - 결제 원장 무결성, 중복 과금 방어 및 보상 트랜잭션 파이프라인 구축

---

## 2. 매칭 핵심 강점 (Match Highlights)
1. **전자금융/지급결제 트랜잭션 무결성 (Zero Double-Payment):**
   - Redis Single-Threaded Lua Script 원자적 선점(`이중 매칭 0건`), DB Outbox 패턴, `FOR UPDATE SKIP LOCKED`
2. **Spring Boot 코어 백엔드 & 대규모 RDB 무결성:**
   - SafeCash 및 DataForge 복합 인덱스, Unique 제약조건 설계, PostgreSQL/MySQL 동시성 제어 실무 경험
3. **금융사/결제망 연동 장애 복구 및 재처리:**
   - 타임아웃/실패 구간 격리, 멱등성 보장 Admin 재처리 API 직접 구축

## Machine Summary
```yaml
id: "101"
company: "페이민트"
role: "백엔드 개발자(Java/Kotlin)"
platform: "Wanted"
url: "https://www.wanted.co.kr/wd/369598"
score: 5.0
status: "Applied"
tier: "FinTech"
```
