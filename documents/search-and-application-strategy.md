# Target Recruitment Keywords & Strategy (CV-Derived)

## 1. Candidate Core Strengths (from cv.md)
1. **대규모 데이터 파이프라인 & 배치 처리**
   - PostgreSQL 약 1,973만 건 처리 최적화 (4,175초 → 2,896초, 30.6% 단축)
   - Server-side Cursor, 청크별 COPY 적재 및 Range Partition 분할
   - Python / Airflow DAG 기반 안정적 배치 이관 및 재처리 파이프라인
2. **실시간 트랜잭션 동시성 제어 & 상태 무결성**
   - Redis Lua Script 기반 원자적 Claim, Cancel Marker 및 Stale 결과 즉시 폐기
   - DB Outbox 패턴, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 직렬화
   - SafeCash 실시간 금융망 연동 대사(Reconciliation) 0건 불일치 무결성 검증
3. **실시간 통신 & 인프라 운영**
   - RabbitMQ 및 Redis Pub/Sub 다중 브로커 폴백
   - LiveKit WebRTC 실시간 통화 세션 제어
   - Docker, Nginx, GitLab CI/CD 파이프라인 표준화

---

## 2. Platform Search Keywords Matrix

| Category | Search Keywords | Match Objective |
| :--- | :--- | :--- |
| **Tier 1 (High-Fit & Specialized)** | `Spring Batch`, `Spring 배치`, `Java 대용량`, `Spring 대용량`, `Spring Redis 분산`, `Java 결제`, `Spring 정산` | 지원자의 최고 강점인 대용량 최적화, 정합성, 배치 처리 기술을 우대하는 고수익·고성장 기업 타깃 |
| **Tier 2 (Core Backend)** | `Java Spring Boot`, `백엔드 개발자 Spring`, `Java Backend PostgreSQL` | 안정적인 중견/IT 유망 기업의 코어 백엔드 API 서버 개발 포지션 |
| **Tier 3 (AI / Platform)** | `Spring RAG`, `FastAPI Spring`, `AI 백엔드` | LLM API 연동 및 사내 검색 플랫폼 구축 역량 어필 포지션 |

---

## 3. Application Execution Rules
1. **Zero Fabrication**: 오직 `cv.md`에 명시된 사실(수치, 프로젝트, 사용 기술)만 리포트와 지원서에 사용.
2. **Tooling Mandate**: 웹 브라우저 제어는 오직 Native `browsermcp` (`call_mcp_tool`) 사용.
3. **Double Verification**:
   - `data/applications.md` 내 기존 지원 회사 대조 (중복 지원 방지)
   - 각 지원 완료 후 증빙 스크린샷 캡처 (`reports/`)
   - 리포트 작성 (`reports/{ID}-{slug}-{date}.md`)
   - `data/applications.md` 정식 등재
   - `node verify-pipeline.mjs` 검증 통과 (0 errors 필수)
   - Git Commit 기록
