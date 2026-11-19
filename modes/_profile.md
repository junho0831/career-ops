# User Profile Context -- career-ops

## Your Target Roles

| Archetype | Thematic axes | What they buy | Source CV |
|-----------|---------------|---------------|-----------|
| **Web & Platform Backend Engineer** | Concurrency, Redis Lua, DB Outbox, Fallback, WebRTC, Solo ops | Someone who builds high-availability web platforms, APIs, and real-time services that survive failures | `cv-platform.md` |
| **Fintech & Transaction Backend Engineer** | MyData, 0-defect, Transaction integrity, Pessimistic lock, SafeCash Admin | Someone who guarantees financial/data consistency and zero-defect operational recovery | `cv-fintech.md` |
| **Data & Batch Pipeline Engineer** | Airflow DAG, 19.7M COPY chunk loading, 30.6% latency cut, Partitioning, Reprocessing | Someone who turns fragile file/log workflows into reliable, idempotent high-volume data pipelines | `cv-data.md` |
| **Platform / Reliability Engineer** | CI/CD, incident reduction, fallback design, operations | Someone who lowers operational risk and improves delivery speed | cv.md |
| **Search / Integration Backend Engineer** | Elasticsearch, Redis, JWT/OAuth2, system integration | Someone who keeps critical flows stable across multiple systems | cv.md |

## Your Adaptive Framing

| If the role is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| Web & Platform Backend | VoiceLink live service (Redis Lua atomic claim, DB Outbox, FOR UPDATE SKIP LOCKED, LiveKit WebRTC), DataForge ES DB fallback, standardized error responses, Docker/Nginx solo ops | cv-platform.md |
| Fintech & Transaction | SafeCash MyData batch & Admin reprocessing API (monthly data integrity issues 3 -> 0), VoiceLink transactional integrity (Pessimistic lock, Outbox), DataForge unique constraints, idempotent reload | cv-fintech.md |
| Data & Batch Pipeline | Airflow workflow automation, FTP ingestion/parsing/validation, ER Dose RAW/EUV parsing separation, chunk/partition COPY loading (30.6% latency cut), unique+upsert safeguards | cv-data.md |
| Platform / Reliability | CI/CD automation, zero-failure deployments, graceful degradation, faster incident analysis, AI-assisted solo ops iteration | cv.md |
| Search / Integration | Elasticsearch fallback, RAG search, RDB indexes/unique constraints, auth/session consistency, internal tooling | cv.md |

## Your Exit Narrative

Use the candidate's exit story from `config/profile.yml` to frame all content:

- In PDF summaries: emphasize measurable backend improvements, not generic ownership claims
- In STAR stories: lead with operational pain, then show the engineering decision and the metric change
- In draft answers: position the candidate as someone who turns fragile workflows into reliable systems

## Your Cross-cutting Advantage

Frame profile as **"data/batch-oriented backend engineer who makes data and backend flows reliable with concrete mechanisms: Airflow DAG boundaries, FTP ingestion safeguards, parser null-tolerance, unique+upsert constraints, fallback, Redis state, transaction boundaries, tests, deployment automation, and AI-assisted solo execution"**.

What stands out:
- Builds systems end-to-end instead of stopping at feature delivery
- Has current company work that maps directly to data engineering adjacent roles: Airflow DAG migration, FTP ingestion, log parsing, structured loading, source-file deduplication, upsert safeguards, partition COPY loading, and reprocessing-oriented operations
- Has company project experience beyond side projects: Spring admin APIs, common exception/validation policy, Elasticsearch fallback, Redis authentication, RDB indexes/unique constraints, CI/CD standardization, Airflow data workflow automation, and reprocessing APIs
- Has operated backend flows that recruiters recognize as real company work: overtime request/approval/rejection, employee management, search indexing, notification mail, reprocessing, batch execution, deployment verification, and admin update paths
- Can credibly answer JD lines about AI/LLM productivity and small-service ownership through VoiceLink: AI-assisted solo development, direct service operation, and architecture/consistency decisions owned personally
- Uses fallback paths, automation, and state modeling to prevent repeat incidents
- Separates fast paths from source-of-truth storage and uses transaction boundaries, locks, unique constraint rules, and outbox patterns for consistency
- Explains trade-offs clearly and ties changes to measurable operational outcomes

## Job Screening Bias

### Latest user targeting override (2026-10-12)

- 현재 채용 지원 대상은 **반도체 기업 + 빅테크·중견기업·대기업**이며, 직무는 **서버개발자 또는 데이터엔지니어**로 한정한다.
- 반도체 제조사·장비사·소재사 및 반도체 솔루션 기업을 유지하고, 빅테크·중견기업·대기업은 업종 제한 없이 추가한다. 백엔드/API 개발이나 데이터 수집·적재·파이프라인 개발이 주업무인 공고를 선택한다.
- 전산·ERP 운영 전담, 인프라 운영 전담, 장비 제어·임베디드, 프론트엔드 전담, 생산·공정 엔지니어는 지원하지 않는다. MES나 스마트팩토리 명칭만으로는 지원하지 않고 서버/데이터 개발 업무를 확인한다.
- 아래의 제조업·플랫폼 분류는 위 회사 범위 안에서 활용한다. 기업 브랜드만으로 지원하지 않으며, 기존 중복지원·파견 제외·경력 적합성 기준은 유지한다.

Push toward roles where the buyer wants a **data/batch-oriented backend engineer or manufacturing/smart factory data engineer** in **mid-sized to large enterprises (중견·대기업·제조업·빅테크)**.

Prioritize:
- **중견·대기업 제조업 및 스마트팩토리/산업 AI 도메인**: 반도체, 디스플레이, 배터리, 로봇, 자동화 설비, MES, 공급망/물류 등 제조 현장 데이터와 연동되는 백엔드 및 데이터 엔지니어 포지션
- Data / Batch Backend, Smart Factory Platform, MES Backend, Backend Data Platform, Batch Platform, ETL/ELT-adjacent backend, data ingestion, log pipeline, settlement/reconciliation, and internal operations workflow roles
- Roles mentioning Airflow, Python batch, FTP/SFTP ingestion, parsing/validation, data quality, reprocessing, relational constraints, idempotency, partitioned loading, or operational data pipelines
- Java/Spring backend roles around 3-5 years or "3+ years"
- Backend operations, maintenance, internal platforms, admin APIs, reliability improvement, and production support
- Redis, authentication/session consistency, Elasticsearch/search fallback, batch/data workflows, RDB constraints, CI/CD, and incident prevention
- Active, deadline-driven postings with clear hiring timelines
- Pipeline grouping & titling: ALWAYS group and title pipeline entries strictly by Deadline Date periods (e.g. ⏳ D-7 이내 마감 임박, 📅 N월 마감 예정), NEVER use '오늘 기준'.

Deprioritize / Exclude:
- "상시 채용" / "수시 채용" (always-open/ongoing) postings without active hiring deadlines
- Pure data engineer roles centered on Spark, Hadoop, Kafka streaming platform ownership, data warehouse modeling, BI dashboards, ML feature platforms, or company-wide data platform architecture unless the posting also values backend/API/batch ownership
- Large-scale traffic ownership as a core requirement
- Big-tech scale distributed systems or platform infrastructure expectations
- Mandatory Kafka/MSA/Kubernetes production ownership
- Architecture lead, DDD lead, staff-level platform ownership, or 6+ year senior scope

Do not overclaim:
- Do not present the candidate as having led large-scale traffic, big-tech systems, large MSA architecture, or company-wide platform architecture.
- Do not imply AI wrote the product independently; frame AI as productivity multiplier while architecture, consistency, and operational decisions stayed with the candidate.
- When those keywords appear in a JD, answer through adjacent evidence: Redis real-time state consistency, DB source-of-truth design, fallback/recovery paths, CI/CD, batch safety, incident/debugging experience, and AI-assisted solo delivery.

## Your Portfolio / Demo

Public profile:
- GitHub: `https://github.com/junho0831`

If a role values hands-on engineering depth, point to:
- VoiceLink live service for AI-assisted solo development, Redis Lua Script Atomic Claim, Presence TTL + ZSET waiting queues, Cancel Marker race defense, DB Outbox + TTL result key, optional RabbitMQ-first publication with enabled Redis Pub/Sub fallback, FOR UPDATE SKIP LOCKED and lease-token ownership checks, bounded exponential-backoff retry, PESSIMISTIC_WRITE session termination, scoped DeferredResult cleanup, CallSession.ended_at as session source of truth, LiveKit/WebRTC, and Docker/Nginx/SSL operations. The recent-six-month story is the July 16, 2026 delivery-hardening work, not the January 2026 initial Outbox/Lua implementation.
- DataForge for Elasticsearch fallback, Redis TTL based refresh-token lifecycle management, requester/start/status indexes, unique constraints that protect duplicate overtime requests and duplicate approvals, operational recovery APIs, standardized error responses, notification mail, reindex, optional sheet CSV sync, and end-to-end overtime request/approval/rejection/search/operator-update flows
- Prism for a single Airflow FTP task executing internal download/validation/conversion/upload/DB-save/source-cleanup stages, input-date plus previous-day scans, upload then database commit before deleting matched image/text sources, and RUPI image-metadata source_file unique plus upsert. Separate ER Dose DAG tasks handle EUV/RAW parsing; daily summaries use separate DELETE then INSERT calls, not UPSERT or atomic replacement. The verified local FTP adapter is SQLite; the ER Dose pipeline uses PostgreSQL.

- SMIP for common exception handling, validation policy, standardized error responses, JUnit5/Mockito regression tests, and MVVM/store-based UI state separation
- SmartQ for retrieval quality improvement and practical LLM integration
- KMS for GitLab CI/CD, Docker, Nginx, Staging standardization, and deployment reliability
- SafeCash for scheduled batch automation, execution/result logging, operator-facing Admin UI/API, and reprocessing workflows

### Code verification boundary approved 2026-10-12

- Use `config/profile.yml` → `evidence_verification` for approved revisions, source paths, dates, benchmark scope, and local test counts.
- 52 VoiceLink and 63 Prism tests passed in the selected local verification runs. These are verification results, not claims that the candidate authored exactly that number of tests or that live infrastructure was validated.
- The 30.6% result is a recorded operational comparison for about 19.73 million RAW rows with chunk_size=30000, not a newly reproduced benchmark.

## Your Comp Targets

- **직전 연봉**: 4,650만 원 (KRW)
- **목표/희망 연봉**: 5,000만 ~ 5,500만 원 (최소 기준 4,800만 원)
- 보상 협상 시 대용량 정합성/배치 파이프라인 엔드투엔드 오너십 및 장애/리드타임 절감 성과를 근거로 앵커링합니다.

## Your Negotiation Scripts

**Salary expectations:**
> "I'm prioritizing roles where backend ownership, system reliability, and operational impact are valued appropriately. I'm open to discussing the full package once we align on scope and expectations."

**When offered below target:**
> "The value I bring is in reducing operational risk and improving delivery speed with measurable results. If we're aligned on the role scope, I'd like to explore a package that reflects that impact."

**When the role looks narrower than the title suggests:**
> "I'm strongest in roles where I can own the backend lifecycle end-to-end, including reliability and operations. I'd like to understand how much of that scope sits with this position."

## Your Location Policy

- Use `config/profile.yml` for country and timezone fields
- For remote roles, prioritize scope and overlap expectations over office branding
- Penalize roles that require heavy on-site presence unless the scope is unusually strong
