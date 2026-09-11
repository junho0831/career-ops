# Custom Instructions -- career-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Put your own house rules, custom workflows, and automations
     here -- anything you want the agent to ALWAYS do (or never do).

     This is for PROCEDURAL rules ("HOW I want things done").
     For WHO you are (archetypes, narrative, comp, negotiation),
     use modes/_profile.md instead. Keeping the two separate keeps
     each one readable.

     The agent reads this file alongside the system instructions;
     your rules here take precedence over the defaults, as long as
     they don't break the Data Contract (your files are never
     touched, and we never auto-submit an application for you).

     Because this is a user-layer file, anything you write here
     survives `node update-system.mjs`. Put customizations HERE,
     not in CLAUDE.md / modes/_shared.md / other system files --
     those get overwritten on update.
     ============================================================ -->

## House Rules

1. **자동 지원 실행 도구 규약 (Tooling)**:
   - 모든 웹 지원(원티드, 사람인, 잡코리아, 위시켓, 프리모아)은 **현재 환경에 설치된 공식 `browsermcp` (`call_mcp_tool` -> `ServerName: "browsermcp"`)만을 사용**한다.
   - 외부 파이썬 스크립트(x11/매크로/셀레니움) 및 브라우저 개발자 도구(DevTools) 콘솔 JS 코드 주입은 일체 금지한다.

2. **외주/프리랜서 절대 원칙 (100% 원격 필수 / 상주 절대 불가 / 포트폴리오 사이트 첨부)**:
   - 위시켓, 프리모아 등 외주 프로젝트 지원 시 **"상주 필수", "파견", "주 N일 출근" 조건의 프로젝트는 필터링 단계에서 즉시 제외(지원 불가)**한다.
   - 100% 원격/재택 근무가 가능한 프로젝트에만 선별 지원한다.
   - 제안서 작성 시 비개발자 클라이언트(대표님, 사업 담당자)가 단번에 이해할 수 있도록 어려운 기술 용어를 실질적 비즈니스 혜택(처리 속도 단축, 서버 멈춤 방지, 관리자 재처리 편의성 등)으로 번역하여 작성한다.
   - **포트폴리오 웹사이트 필수 노출**: 제안서 본문 및 프로필 링크에 공식 포트폴리오 사이트(`https://so-dak.com/`)와 깃허브(`https://github.com/junho0831`)를 상단에 배치하여 라이브 서비스와 상세 아키텍처 글을 즉시 열람할 수 있도록 한다.
   - 상세 지침: [`docs/FREELANCE_APPLICATION_GUIDE.md`](docs/FREELANCE_APPLICATION_GUIDE.md) 준수.

3. **일반 채용 지원 기업 규모 원칙 (대기업·중견기업·빅테크 & 시리즈 A 이상 스타트업)**:
   - 원티드, 사람인, 잡코리아 등 정규직 일반 채용 지원 대상은 **'대기업, 중견기업, 빅테크(네카라쿠배당토, 유니콘)' 및 '시리즈 A 이상 투자를 유치한 성장 스타트업'**까지 포함한다.
   - 시드/프리A 이전의 극초기/영세 스타트업은 배제하고, 최소 시리즈 A(누적 투자 유치 등 검증된 기업) 이상부터 적극 지원한다.
   - 회사의 도메인과 JD 요구 역량(대용량 데이터/배치, 실시간 백엔드, Python/SaaS, 정합성/안정성)에 부합하는 최적의 이력서 버전을 선별하여 제출한다.
   - 이미 지원된 공고(`지원완료`)는 사전 판별하여 건너뛴다.
   - 상세 지침: [`docs/JOB_BOARD_APPLICATION_GUIDE.md`](docs/JOB_BOARD_APPLICATION_GUIDE.md) 준수.

4. **100% 진실 기반 작성 (Ground Truth)**:
   - 모든 지원서 및 문항 답변은 오직 [`cv.md`](cv.md)에 입증된 사실 데이터만을 기반으로 작성한다 (허위 기재 엄금).

5. **지원 내역 피드백 및 합격/탈락 필터링 기준 (Feedback Loop)**:
   - **강점 및 합격권 타깃 (Priority Apply)**:
     - Java/Spring Boot 기반 금융·결제·정합성 코어 백엔드 (원장 무결성, Outbox 패턴, Redis Lua 원자적 선점, 분산 락, SafeCash/VoiceLink 수치 증명).
     - Python/Airflow 대용량 배치 & 데이터 파이프라인 (1,973만 건 로그 파싱, COPY 스트리밍, 30.6% 처리 단축, 멱등성 및 재실행 안정화).
     - AI 워크플로우 / 에이전트 실행 백엔드 (FastAPI/LangGraph 서빙, Tool Calling 트랜잭션 연동, 상태 감사 추적).
   - **필터링 탈락 및 배제 대상 (Auto-Reject / Off-Limits)**:
     - **Node.js/Nest.js + 프론트엔드(React/Vue/Flutter) 풀스택 공고:** 후보자 주력(Java/Python 백엔드 인프라) 불일치로 탈락 확률 높으므로 지원 전면 배제.
     - **필수 언어/자격 미보유 공고:** Kotlin/Go 코어 또는 공인 PG/전자금융 라이선스 필수를 요구하는 포지션은 보류/후순위 처리.
     - **출근/상주 필수 외주 및 SI 파견:** 100% 재택 원칙 위배 및 원격 협업 불가 공고 즉시 배제.
     - **사이드 프로젝트:** 단순 팀빌딩/사이드 형태는 파이프라인에서 완전 배제 (정규직 채용 및 유료 외주/도급에 집중).

## Custom Workflows

- **"외주 지원"**: 위시켓 및 프리모아에서 100% 원격 백엔드/데이터 프로젝트를 탐색하고, 비개발자용 3단계 안심 제안서(요구사항 분석 -> 유사 경험 -> 원격 협업 약속)를 작성하여 지원.
- **"채용 지원"**: 대기업·중견기업·빅테크 공고를 대상으로 `지원완료` 여부를 체크하고, JD 분석 후 매칭되는 최적의 이력서 버전을 선택하여 원클릭/빠른 입사지원 수행.

## Output Preferences

- 지원 전후 상태(`지원완료`, `제출완료`, `상주 제외`, `기업규모 제외`)를 명확하게 1줄 요약으로 보고한다.
- 외주 지원서 작성 시 비개발자 눈높이 맞춤 번역 표현을 우선 적용한다.

## Off-Limits

- 상주/파견 근무가 요구되는 외주 프로젝트 지원 절대 금지.
- 소규모/영세 스타트업(시드, 프리A 이하) 대상 일반 채용 지원 금지 (대기업·중견·빅테크 및 시리즈 A 이상 성장 스타트업만 지원).
- 프론트엔드(React/Flutter 등) 중심 풀스택 및 Nest.js 전용 공고 지원 절대 금지.
- 사이드 프로젝트성 무보수/팀빌딩 공고 지원 금지.
- 파이썬 매크로 스크립트 작성 및 DevTools 콘솔 코드 주입 절대 금지.
- `cv.md`에 없는 허위 경력이나 과장된 수치 작성 절대 금지.
