# User Profile Context -- career-ops

## Your Target Roles

| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **Backend Engineer** | API design, domain logic, auth, data integrity | Someone who ships reliable backend features end-to-end |
| **Platform / Reliability Engineer** | CI/CD, incident reduction, fallback design, operations | Someone who lowers operational risk and improves delivery speed |
| **Data / Batch Backend Engineer** | Airflow, FTP, parsing/validation, relational constraints, recurring jobs | Someone who can turn repetitive file work into reliable data workflows with clear success/failure boundaries |
| **Search / Integration Backend Engineer** | Elasticsearch, Redis, JWT/OAuth2, system integration | Someone who keeps critical flows stable across multiple systems |

## Your Adaptive Framing

| If the role is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| Backend Engineer | End-to-end ownership from design to deployment, standardized exception handling, practical debugging, maintainable APIs | cv.md |
| Platform / Reliability | CI/CD automation, zero-failure deployments, graceful degradation, faster incident analysis | cv.md |
| Data / Batch Backend | Airflow workflow automation, FTP ingestion/parsing/validation, durable-success-before-source-delete flow, unique+upsert safeguards | cv.md |
| Search / Integration | Elasticsearch fallback, RAG search, RDB indexes/unique constraints, auth/session consistency, internal tooling | cv.md |

## Your Exit Narrative

Use the candidate's exit story from `config/profile.yml` to frame all content:

- In PDF summaries: emphasize measurable backend improvements, not generic ownership claims
- In STAR stories: lead with operational pain, then show the engineering decision and the metric change
- In draft answers: position the candidate as someone who turns fragile workflows into reliable systems

## Your Cross-cutting Advantage

Frame profile as **"backend engineer who makes backend flows reliable with concrete mechanisms: fallback, Redis state, RDB constraints, transaction boundaries, tests, and deployment automation"**.

What stands out:
- Builds systems end-to-end instead of stopping at feature delivery
- Has company project experience beyond side projects: Spring admin APIs, common exception/validation policy, Elasticsearch fallback, Redis authentication, RDB indexes/unique constraints, CI/CD standardization, Airflow data workflow automation, and reprocessing APIs
- Has operated backend flows that recruiters recognize as real company work: overtime request/approval/rejection, employee management, search indexing, notification mail, reprocessing, batch execution, deployment verification, and admin update paths
- Uses fallback paths, automation, and state modeling to prevent repeat incidents
- Separates fast paths from source-of-truth storage and uses transaction boundaries, locks, unique constraint rules, and outbox patterns for consistency
- Explains trade-offs clearly and ties changes to measurable operational outcomes

## Job Screening Bias

Push toward roles where the buyer wants an **operations-oriented backend engineer** rather than a large-scale platform lead.

Prioritize:
- Java/Spring backend roles around 3-5 years or "3+ years"
- Backend operations, maintenance, internal platforms, admin APIs, reliability improvement, and production support
- Redis, authentication/session consistency, Elasticsearch/search fallback, batch/data workflows, RDB constraints, CI/CD, and incident prevention
- Small-to-mid teams where one backend engineer is expected to own design, implementation, deployment, debugging, and operations

Deprioritize unless the JD has a strong Java/Spring operations fit:
- Large-scale traffic ownership as a core requirement
- Big-tech scale distributed systems or platform infrastructure expectations
- Mandatory Kafka/MSA/Kubernetes production ownership
- Architecture lead, DDD lead, staff-level platform ownership, or 6+ year senior scope

Do not overclaim:
- Do not present the candidate as having led large-scale traffic, big-tech systems, large MSA architecture, or company-wide platform architecture.
- When those keywords appear in a JD, answer through adjacent evidence: Redis real-time state consistency, DB source-of-truth design, fallback/recovery paths, CI/CD, batch safety, and incident/debugging experience.

## Your Portfolio / Demo

Public profile:
- GitHub: `https://github.com/junho0831`

If a role values hands-on engineering depth, point to:
- VoiceLink live service for distributed state, real-time matching, Redis Lua Script Atomic Claim, Presence TTL + ZSET waiting queues, Cancel Marker race defense, DB Outbox + Redis Pub/Sub + TTL result key delivery, FOR UPDATE SKIP LOCKED outbox claiming, PESSIMISTIC_WRITE session termination, scoped DeferredResult cleanup, CallSession.ended_at as session source of truth, call-events SSE heartbeat/reconnect, LiveKit/WebRTC calls, TURN/TLS, and infrastructure debugging across Docker, Nginx, SSL, DNS, and port forwarding
- DataForge for Elasticsearch fallback, Redis TTL based refresh-token lifecycle management, requester/start/status indexes, unique constraints that protect duplicate overtime requests and duplicate approvals, operational recovery APIs, standardized error responses, notification mail, reindex, optional sheet CSV sync, and end-to-end overtime request/approval/rejection/search/operator-update flows
- Prism for Airflow-based FTP data workflow automation, input-date plus previous-day scans, file ingestion/parsing/validation/conversion/storage/upload/source-cleanup stages, upload/database commit before source deletion, FTP transfer-size validation, scratch-file cleanup, and RUPI source_file unique plus upsert handling
- SMIP for common exception handling, validation policy, standardized error responses, JUnit5/Mockito regression tests, and MVVM/store-based UI state separation
- SmartQ for retrieval quality improvement and practical LLM integration
- KMS for GitLab CI/CD, Docker, Nginx, Staging standardization, and deployment reliability
- SafeCash for scheduled batch automation, execution/result logging, operator-facing Admin UI/API, and reprocessing workflows

## Your Comp Targets

Use `config/profile.yml` as the source of truth once compensation fields are filled in.
Until then:
- Do not invent salary expectations
- Ask for the posted range first when needed
- Anchor on role scope, operational ownership, and measurable delivery impact

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
