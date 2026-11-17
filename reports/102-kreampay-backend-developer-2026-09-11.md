# [102] 크림페이 (KREAM Pay / 네이버 스노우 계열) — Backend 개발자 (결제·정산 코어 & 대사 배치)

> **Platform:** Wanted (원티드 #348894)  
> **Target Date:** 2026-09-11  
> **Evaluation Score:** 5.0 / 5.0 (Block A: 1.0, B: 1.0, C: 1.0, D: 1.0, E: 1.0, F: 1.0)  
> **Company Tier:** 네이버(스노우) 계열 결제 핀테크 자회사 (국내 1위 한정판 거래 플랫폼 KREAM)  
> **Recommendation:** Strong Apply (피드백 기반 결제/정산 원장 무결성 최우선 초강력 지원)

---

## 1. 포지션 개요
- **회사명:** 크림페이 (KREAM Pay)
- **포지션:** Backend 개발자
- **주요 업무:**
  - 결제 승인/취소/환불 등 핵심 결제 흐름 및 선불 금융 연계 도메인 백엔드 설계·개발·운영
  - 정산, 대사(Reconciliation), 집계, 대량 거래 데이터 배치 시스템 고도화
  - 트랜잭션 무결성, 동시성 제어 및 결제/정산 운영 백오피스 개발

---

## 2. 매칭 핵심 강점 (Match Highlights)
1. **결제 승인/정산 코어 트랜잭션 무결성 (Zero Mismatch):**
   - RDB 복합 인덱스, Unique 제약조건 설계, DB Outbox 패턴 및 `FOR UPDATE SKIP LOCKED` 적용 경험 100% 매칭
2. **대용량 정산·대사 배치 및 멱등성 보장:**
   - SafeCash 일별 정산 자동화, Airflow 배치 멱등성 보장, 실패 지점 격리 및 원클릭 재처리(Reprocessing) API 구축
3. **Redis 기반 초단위 결제/재고 선점 및 동시성 방어:**
   - Redis Single-Threaded Lua Script 원자적 선점(`이중 매칭 0건`)으로 한정판 거래 순간 결제 경합 완전 차단

## Machine Summary
```yaml
id: "102"
company: "크림페이"
role: "Backend 개발자"
platform: "Wanted"
url: "https://www.wanted.co.kr/wd/348894"
score: 5.0
status: "Applied"
tier: "FinTech"
```
