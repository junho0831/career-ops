# Evaluación: 아스토나파트너스 - 백엔드 개발자 (Java / Kotlin / Spring Boot)

**Fecha:** 2026-05-13  
**Arquetipo:** Operations-oriented Java/Spring Backend Engineer  
**Score:** 4.4/5  
**URL:** https://zighang.com/recruitment/10fb5665-e601-491e-81a3-12e0ccf20af8  
**Legitimacy:** High Confidence  
**PDF:** output/cv-park-junho-astona-2026-05-13.pdf

---

## 요약 평가

- Java/Spring Boot, Kotlin, JPA/QueryDSL, RDBMS 최적화, 테스트/코드리뷰가 명확히 적힌 1~5년 포지션.
- 현재 포지셔닝인 운영형 백엔드, 데이터 정합성, API 설계, 테스트 기반 재발 방지와 잘 맞음.
- 우대사항에 대용량 트래픽/분산 환경이 있지만 필수 조건은 아니므로 과장 없이 VoiceLink Redis 정합성과 DataForge RDB 설계로 보완 가능.

## 핵심 매칭

| JD 축 | CV 근거 | 매치 |
|---|---|---|
| Java/Spring Boot API | DataForge, SMIP, Hecto, SafeCash Java/Spring 경험 | Strong |
| JPA/QueryDSL/RDBMS | DataForge index/unique constraint, transaction 기반 정합성 | Good |
| 테스트/코드리뷰 | SMIP JUnit5/Mockito 회귀 테스트, 공통 예외/validation | Strong |
| 운영 안정성 | ES fallback, Redis 인증, CI/CD, Airflow batch 안정화 | Strong |
| Kotlin | 직접 실무 근거는 약하지만 Java/Spring 기반으로 전환 가능 | Medium |

## 리스크

- Kotlin 실무 경험이 강하게 요구되면 감점.
- “고성능/대용량/분산”을 전면에 내세우면 과장으로 보일 수 있으므로, Redis Lua/DB Outbox/transaction/unique constraint 수준에서 방어해야 함.

## 추천 액션

- 지원 추천.
- 이력서에서는 DataForge의 RDB 정합성, SMIP 테스트, VoiceLink Redis 원자적 선점 구조를 상단에 배치.
