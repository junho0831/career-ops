# User Profile Context -- career-ops

## Your Target Roles

| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **Backend Engineer** | API design, domain logic, auth, data integrity | Someone who ships reliable backend features end-to-end |
| **Platform / Reliability Engineer** | CI/CD, incident reduction, fallback design, operations | Someone who lowers operational risk and improves delivery speed |
| **Data / Batch Backend Engineer** | Airflow, Postgres, recurring jobs, idempotency | Someone who can run data workflows safely at scale |
| **Search / Integration Backend Engineer** | Elasticsearch, Redis, JWT/OAuth2, system integration | Someone who keeps critical flows stable across multiple systems |

## Your Adaptive Framing

| If the role is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| Backend Engineer | End-to-end ownership from design to deployment, standardized exception handling, practical debugging, maintainable APIs | cv.md |
| Platform / Reliability | CI/CD automation, zero-failure deployments, graceful degradation, faster incident analysis | cv.md |
| Data / Batch Backend | Airflow migration, idempotent processing, rerun safety, recovery-oriented batch design | cv.md |
| Search / Integration | Elasticsearch fallback, RAG search, auth/session consistency, internal tooling | cv.md |

## Your Exit Narrative

Use the candidate's exit story from `config/profile.yml` to frame all content:

- In PDF summaries: emphasize measurable backend improvements, not generic ownership claims
- In STAR stories: lead with operational pain, then show the engineering decision and the metric change
- In draft answers: position the candidate as someone who turns fragile workflows into reliable systems

## Your Cross-cutting Advantage

Frame profile as **"backend engineer who reduces operational risk with pragmatic system design"**.

What stands out:
- Builds systems end-to-end instead of stopping at feature delivery
- Uses fallback paths, automation, and state modeling to prevent repeat incidents
- Explains trade-offs clearly and ties changes to measurable operational outcomes

## Your Portfolio / Demo

Public profile:
- GitHub: `https://github.com/junho0831`

If a role values hands-on engineering depth, point to:
- VoiceLink live service for distributed state, real-time matching, Redis-backed state transitions, stale match prevention, ghost-session mitigation, LiveKit/WebRTC calls, and infrastructure debugging across Docker, Nginx, SSL, DNS, and port forwarding
- SmartQ for retrieval quality improvement and practical LLM integration
- KMS for CI/CD automation and deployment reliability

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
