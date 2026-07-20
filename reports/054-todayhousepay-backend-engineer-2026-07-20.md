# 평가: 오늘의집페이 - Backend Engineer

**날짜:** 2026-07-20
**아키타입:** Payment Reliability Backend Engineer
**점수:** 4.4/5
**URL:** https://bucketplace.career.greetinghr.com/ko/o/217970
**Legitimacy:** High Confidence
**PDF:** output/pdf/cv-park-junho-todayhousepay-2026-07-20.pdf

---

## A) 역할 요약

- Kotlin/Java와 Spring 기반으로 결제·정산·매입, 회계 인터페이스, 운영 백오피스를 개발·운영하는 2년 이상 포지션.
- 핵심 구매 요인은 금액 정합성, 트랜잭션 안정성, 장애 회고와 재발 방지, 운영 효율, 테스트 자동화, AI 활용이다.
- 현재 경력과 Java/Spring 기반은 맞고, 운영 안정성 중심의 포지셔닝과 매우 잘 맞는다.

## B) CV 매칭

| JD 요구 | 근거 | 매치 |
|---|---|---|
| Java/Spring, 백엔드 2년 이상 | 엔셀·헥토 Java/Spring Boot 경력 3년 이상 | Strong |
| RDBMS/NoSQL | PostgreSQL, MySQL, Redis, Elasticsearch | Strong |
| 데이터 정합성 | unique constraint, upsert, transaction/lock, Redis Lua Atomic Claim | Strong |
| 멱등성·재시도·복구 | source commit 후 삭제, 재처리 API, DB Outbox, TTL result key | Strong |
| 운영 백오피스 | SafeCash Admin 조회·수정·재처리, DataForge 관리자 API | Strong |
| 장애 회고·재발 방지 | SMIP 회귀 테스트, 장애 분석 40분→12분, 동일 오류 재발률 30% 감소 | Strong |
| AI 업무 활용 | VoiceLink 1인 설계·개발·배포·운영에서 구현·디버깅·문서화 보조로 사용 | Strong |
| AWS·결제 도메인·Kotlin | 이력서에서 직접 확인되는 실무 근거 없음 | Gap |

## C) 레벨과 지원 전략

- 2년 이상 요구에 경력 3년 이상으로 레벨은 적합하다.
- 결제 도메인 경험을 주장하지 않고, 실제로 구현한 정합성 메커니즘과 운영 복구 흐름으로 인접 역량을 증명한다.
- 이력서 첫 페이지에서 DataForge, SafeCash, SMIP, VoiceLink를 앞세운다.

## D) 보상과 수요

- 공고에 보상 범위가 없고 프로필의 희망 연봉도 비어 있어 보상 점수는 중립으로 둔다.
- 결제·정산 시스템 직접 운영, 외부 금융기관 연동, 백오피스와 장애 대응을 함께 요구해 역할 범위는 넓다.
- 지원 전형에서 현재 연봉이나 희망 연봉을 요구하지 않는다.

## E) 맞춤화 계획

- Summary: 운영 중 중복 처리·상태 불일치·재처리 실패를 줄인 Java/Spring 개발자로 정의.
- Experience: unique constraint, Redis TTL, DB fallback, commit 이후 원본 삭제, Admin 재처리, 회귀 테스트를 우선 배치.
- Project: Redis Lua, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE`를 결제 정합성의 인접 증거로 제시.
- Kotlin, AWS, 전자금융 실무는 추가하지 않는다.

## F) 인터뷰 계획

- “금액 정합성 문제를 맡는다면 어떤 실패 시나리오부터 정의할 것인가?”: 중복 요청, timeout 후 결과 불명, 외부기관 재시도, 부분 성공, 대사 차이를 분리해 답변.
- “테스트 자동화가 운영 안정성으로 이어진 사례”: SMIP 반복 장애를 회귀 테스트로 고정한 경험과 지표를 사용.
- “AI 활용의 한계”: 생성 코드 검증, transaction 경계와 lock 판단, 운영 실패 시나리오는 직접 소유한다는 기준을 설명.
- “결제 경험이 없는 점”: 도메인 지식은 빠르게 학습하되 정합성·복구·관측 가능성의 구현 경험은 이미 갖고 있다고 답변.

## G) 공고 신뢰도

- 2026-07-20 Playwright로 직무명, 상세 JD, 활성 `지원하기` 링크와 실제 지원 폼을 확인했다.
- 지원 폼은 이름, 이메일 인증, 연락처, 이력서, 유입 경로, 개인정보 동의를 받고 있다.
- 기술 요구와 업무 범위가 구체적이며 채용 절차와 문의 메일이 공개돼 있다.
- 수시채용이므로 게시 기간만으로 마감 여부를 판단하지 않고, 지원 직전 활성 폼을 기준으로 확인했다.
- 판정: **High Confidence**.

## H) 지원서 입력 계획

- 이름: 박준호
- 이메일: junho6667@gmail.com (인증 필요)
- 연락처: 010-3525-6275
- 이력서: `/home/junho/다운로드/운영 안정성과 데이터 정합성을 개선하는 Java Spring Boot 백엔드 개발자 박준호_junho8889-x01aagm.pdf` (사용자 지시로 사람인 원본 PDF 그대로 사용)
- 추가서류: 없음
- 장애여부: 비대상
- 보훈여부: 비대상
- 유입 경로: 직접 입력 / 직접 검색
- 현재 상태: 지원 폼은 입력 완료, 이력서 첨부는 인앱 브라우저 제한으로 수동 첨부 필요, 최종 제출은 사용자 검토 후 직접 진행

## 추출 키워드

Java, Kotlin, Spring, RDBMS, NoSQL, 결제, 정산, 대사, 회계, 데이터 정합성, 멱등성, 재시도, 보상 트랜잭션, 백오피스, 장애 회고, 재발 방지, 모니터링, 옵저버빌리티, 테스트 자동화, AI, GPT, Claude
