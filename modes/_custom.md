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

2. **외주/프리랜서 절대 원칙 (100% 원격 필수 / 상주 절대 불가)**:
   - 위시켓, 프리모아 등 외주 프로젝트 지원 시 **"상주 필수", "파견", "주 N일 출근" 조건의 프로젝트는 필터링 단계에서 즉시 제외(지원 불가)**한다.
   - 100% 원격/재택 근무가 가능한 프로젝트에만 선별 지원한다.
   - 제안서 작성 시 비개발자 클라이언트(대표님, 사업 담당자)가 단번에 이해할 수 있도록 어려운 기술 용어를 실질적 비즈니스 혜택(처리 속도 단축, 서버 멈춤 방지, 관리자 재처리 편의성 등)으로 번역하여 작성한다.
   - 상세 지침: [`docs/FREELANCE_APPLICATION_GUIDE.md`](docs/FREELANCE_APPLICATION_GUIDE.md) 준수.

3. **일반 채용 지원 기업 규모 원칙 (대기업·중견기업·빅테크 무조건)**:
   - 원티드, 사람인, 잡코리아 등 정규직 일반 채용 지원 대상은 **무조건 '대기업, 중견기업, 빅테크(네카라쿠배당토, 유니콘 등 규모 있는 IT 선도기업)'**로 한정한다.
   - 소규모 초기 스타트업이나 영세 기업은 일반 채용 지원 대상에서 배제한다.
   - 회사의 도메인과 JD 요구 역량(대용량 데이터/배치, 실시간 백엔드, Python/SaaS, 정합성/안정성)에 부합하는 최적의 이력서 버전을 선별하여 제출한다.
   - 이미 지원된 공고(`지원완료`)는 사전 판별하여 건너뛴다.
   - 상세 지침: [`docs/JOB_BOARD_APPLICATION_GUIDE.md`](docs/JOB_BOARD_APPLICATION_GUIDE.md) 준수.

4. **100% 진실 기반 작성 (Ground Truth)**:
   - 모든 지원서 및 문항 답변은 오직 [`cv.md`](cv.md)에 입증된 사실 데이터만을 기반으로 작성한다 (허위 기재 엄금).

## Custom Workflows

- **"외주 지원"**: 위시켓 및 프리모아에서 100% 원격 백엔드/데이터 프로젝트를 탐색하고, 비개발자용 3단계 안심 제안서(요구사항 분석 -> 유사 경험 -> 원격 협업 약속)를 작성하여 지원.
- **"채용 지원"**: 대기업·중견기업·빅테크 공고를 대상으로 `지원완료` 여부를 체크하고, JD 분석 후 매칭되는 최적의 이력서 버전을 선택하여 원클릭/빠른 입사지원 수행.

## Output Preferences

- 지원 전후 상태(`지원완료`, `제출완료`, `상주 제외`, `기업규모 제외`)를 명확하게 1줄 요약으로 보고한다.
- 외주 지원서 작성 시 비개발자 눈높이 맞춤 번역 표현을 우선 적용한다.

## Off-Limits

- 상주/파견 근무가 요구되는 외주 프로젝트 지원 절대 금지.
- 소규모/영세 스타트업 대상 일반 채용 지원 금지 (대기업·중견·빅테크만 지원).
- 파이썬 매크로 스크립트 작성 및 DevTools 콘솔 코드 주입 절대 금지.
- `cv.md`에 없는 허위 경력이나 과장된 수치 작성 절대 금지.
