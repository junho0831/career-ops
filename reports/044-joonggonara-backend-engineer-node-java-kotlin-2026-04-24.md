# Evaluación: 중고나라 - Backend Engineer(Node.js & Java/Kotlin)

**Fecha:** 2026-04-24  
**Arquetipo:** Backend Engineer / Migration Backend  
**Score:** 4.2/5  
**URL:** https://cafe.naver.com/f-e/cafes/31258781/articles/33624  
**Canonical URL:** https://www.wanted.co.kr/wd/356894  
**Legitimacy:** Strong Signal  
**PDF:** output/cv-park-junho-joonggonara-2026-04-24.pdf

---

## 요약 평가

- 3-5년 백엔드 포지션으로 연차는 잘 맞음.
- 현재 운영은 Node.js/NestJS 중심이지만 Java/Kotlin(Spring) 환경으로의 단계적 마이그레이션과 신규 설계가 주요 업무에 포함되어 있어 조건부 처리 대상.
- 박준호 이력서의 Java/Spring, Elasticsearch, Redis, 운영 안정화, 테스트/재발 방지 경험을 마이그레이션 안정화 관점으로 연결할 수 있음.

## A) 역할 요약

| 항목 | 내용 |
|---|---|
| 회사/도메인 | 중고거래 플랫폼, 채팅/광고/검색/챗봇 |
| 주요 업무 | Node.js/NestJS 운영, Java/Kotlin(Spring) 마이그레이션, WebSocket 채팅, Serverless, 데이터 모델링, OpenSearch 개선 |
| 요구 스택 | Node.js, NestJS, Java/Kotlin, Spring, AWS Lambda, DynamoDB, API Gateway, OpenSearch |
| 마감 | 상시채용 |
| 근무지 | 서울 강남구 |

## B) CV 매치 분석

| JD 요구사항 | CV 근거 | 매치 |
|---|---|---|
| 3년 이상 백엔드 | 3년+ Java/Spring 백엔드 실무 | Strong |
| Java/Kotlin/Spring 운영 | DataForge, SMIP, Hecto, SafeCash Java/Spring 경험 | Strong |
| OpenSearch/Elasticsearch | DataForge ES fallback 및 검색 정합성 유지 | Strong |
| 테스트 코드/레거시 개선 | SMIP JUnit5/Mockito 회귀 테스트, 장애 재발률 30% 감소 | Strong |
| AI 활용 | SmartQ RAG 검색 구현, OpenAI API/LangChain 경험 | Good |
| Node.js/NestJS/Serverless | 직접 실무 경험 명시는 부족 | Gap |

## C) 레벨 및 전략

- 자연 레벨: Mid Backend Engineer.
- 이 포지션은 "Node 개발자"로만 보면 정합이 낮지만, "Node 운영 서비스의 Java/Kotlin 마이그레이션과 안정화"로 보면 지원 가치가 있음.
- 지원 시 Node.js 숙련도를 과장하지 말고, Java/Spring 기반 재설계·테스트·운영 안정화 경험을 전면에 두는 것이 안전함.

## D) 점수 판단

| 항목 | 점수 | 근거 |
|---|---:|---|
| 연차 정합성 | 4.8 | 3-5년 범위가 현재 경력과 직접 맞음 |
| 스택 정합성 | 3.8 | Java/Spring은 강하지만 Node/NestJS/Serverless 갭 존재 |
| 업무 정합성 | 4.4 | 마이그레이션, 검색, 운영 안정화, 테스트 개선과 강하게 연결 |
| 리스크 | 3.7 | Node 중심 업무 비중이 높으면 초반 러닝커브 큼 |

**최종:** 4.2/5

## E) 개인화 계획

- Summary에서 `Java/Spring 기반 서비스 안정화와 마이그레이션 리스크 관리`를 강조.
- DataForge ES fallback을 OpenSearch/검색 안정화 요구와 연결.
- SMIP 테스트/공통 예외 처리 사례를 레거시 코드 안정화 근거로 사용.
- VoiceLink Redis 동시성 사례를 실시간 채팅/WebSocket 도메인 이해 보조 근거로 배치.

## F) 면접 스토리 계획

| 질문 축 | 사용할 사례 | 메시지 |
|---|---|---|
| 마이그레이션 안정성 | Prism Java 배치 -> Python/Airflow 이관 | 재실행 정합성과 실패 복구 구조를 먼저 설계 |
| 검색/로그 구조 | DataForge ES fallback | 검색 장애 시에도 정합성 있는 DB fallback 유지 |
| 레거시 테스트 | SMIP 공통 예외/테스트 | 장애 분석 리드타임과 재발률을 수치로 개선 |
| 실시간 상태 정합성 | VoiceLink Redis/LiveKit | stale 상태와 유령 세션 문제를 상태 전이로 해결 |

## G) Posting Legitimacy

**Tier:** Strong Signal

- 원티드 원문에서 상시채용으로 확인됨.
- 경력 3-5년, 업무 범위, 요구 스택이 구체적으로 공개되어 있음.
- 카페 게시글은 원티드 공고를 재공유한 소스로 보이며, 실제 지원은 원티드 원문 기준으로 진행하는 것이 안전함.

## 액션

- 지원 우선순위: 중상.
- 핵심 문장: "Node/NestJS 중심 운영 환경에서도 Java/Spring 마이그레이션과 검색/테스트 안정화 과제에서 즉시 기여할 수 있습니다."
