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

1. **자동 지원 실행 도구 규약 (Tooling - Browser MCP 직접 호출 필수)**:
   - 모든 웹 브라우징, 지원 현황 조회 및 입사 지원(원티드, 사람인, 잡코리아, 위시켓, 프리모아 등)은 **Antigravity 기본 제공 MCP 도구(`call_mcp_tool` -> `ServerName: "browsermcp"`)를 직접 호출**하여 수행한다.
   - `run_command`를 통한 임의의 우회 러너 실행(예: `node browsermcp-runner.cjs`, curl, puppeteer 등), 외부 파이썬 스크립트(x11/매크로/셀레니움) 및 브라우저 개발자 도구(DevTools) 콘솔 JS 코드 주입은 일체 엄격히 금지한다.
   - 모든 웹 탐색 및 제어는 반드시 `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_screenshot`, `browser_wait` 도구를 MCP로 직접 호출한다.

2. **외주/프리랜서 절대 원칙 (100% 원격 필수 / 위시켓 공인 5대 요소 제안서 전략)**:
   - **원격 근무 필수 검증 (Off-Limits for Onsite)**: 사람인, 원티드, 위시켓, 프리모아 등 모든 플랫폼에서 프리랜서/계약직/외주 프로젝트 지원 시 **"100% 재택", "원격근무", "풀리모트"가 공고 본문이나 근무조건에 명시되지 않은 경우 무조건 즉시 배제(지원 금지)**한다.
   - **상주/파견/출근 즉시 탈락**: "상주 필수", "파견", "주 N일 출근", "역세권 사무실 근무", "사무실 상주" 등 단 하루라도 오프라인 출근이 요구되는 공고는 '프리랜서' 타이틀이 붙어있더라도 절대 지원하지 않는다.
   - **위시켓 공인 5대 필수 제안 구조 준수**:
     - ① **분석 내용**: 클라이언트 요구사항의 핵심 목표 및 잠재 병목/유의점 사전 분석
     - ② **맞춤 제안**: MVP 1단계 안정화 + 2단계 고도화/안전장치(Fallback) 등 적극적 대안 제시
     - ③ **유사 경험**: 대용량 배치(Prism 2천만건/30%단축), 동시성(VoiceLink 1인설계), 어드민(SafeCash 재처리) 실증 사례 연결
     - ④ **작업툴/소통**: Slack/Notion/GitHub 기반 투명한 일상어 보고 및 중간 검증 화면 제공
     - ⑤ **관련 포트폴리오 연결**: 깃허브([https://github.com/junho0831](https://github.com/junho0831))와 본 프로젝트 핵심 기능의 일치점을 명시 (so-dak/voice-link 등 외부 도메인 배제, GitHub 단일 원칙)
   - **프리랜서 단가 파격 할인 전략 (반값 단가 50% 전략)**:
     - 위시켓, 프리모아 등 프리랜서/외주 지원 시 **공고 예산/평균 단가의 50%(반값) 수준으로 제안 금액을 책정**하여 가격 경쟁력을 극대화한다.
     - 제안 사유: "초기 파트너십 구축 및 빠른 MVP 1차 론칭 검증을 위해 정상 단가 대비 50% 수준의 파격적인 견적으로 제안드립니다."를 제안서에 명시.
   - 상세 지침: [`docs/FREELANCE_APPLICATION_GUIDE.md`](docs/FREELANCE_APPLICATION_GUIDE.md) 준수.

3. **일반 채용 지원 기업 규모 원칙 (대기업·중견기업·빅테크 & 시리즈 A 이상 스타트업)**:
   - **직행(Zighang), 원티드, 사람인, 잡코리아** 등 정규직 일반 채용 지원 대상은 **'대기업, 중견기업, 제조업(반도체/로봇/MES/스마트팩토리), 빅테크(네카라쿠배당토, 유니콘)' 및 '시리즈 A 이상 투자를 유치한 성장 스타트업'**까지 포함한다.
   - 시드/프리A 이전의 극초기/영세 스타트업은 배제하고, 대기업·중견 제조업 및 최소 시리즈 A(누적 투자 유치 등 검증된 기업) 이상부터 적극 지원한다.
   - 회사의 도메인과 JD 요구 역량(제조/설비 데이터, 대용량 데이터/배치, 실시간 백엔드, Python/SaaS, 정합성/안정성)에 부합하는 최적의 이력서 버전을 선별하여 제출한다.
   - 이미 지원된 공고(`지원완료`)는 사전 판별하여 건너뛴다.
   - 상세 지침: [`docs/JOB_BOARD_APPLICATION_GUIDE.md`](docs/JOB_BOARD_APPLICATION_GUIDE.md) 준수.

4. **100% 진실 기반 작성 (Ground Truth)**:
   - 모든 지원서 및 문항 답변은 오직 [`cv.md`](cv.md)에 입증된 사실 데이터만을 기반으로 작성한다 (허위 기재 엄금).

5. **지원 내역 피드백 및 합격/탈락 필터링 기준 (Feedback Loop)**:
   - **강점 및 합격권 최우선 타깃 (Top Priority Apply)**:
     - **중견·대기업 제조업 및 스마트팩토리/반도체/로봇 공정 데이터 백엔드**: 로봇시스템공학 학사 전공 및 반도체 공정(ER Dose RAW/EUV) 1,973만 건 로그 처리, 수율/불량 집계, MES/설비 제어 및 배치 파이프라인 최적화 역량 집중 배치.
     - **Java/Spring Boot 기반 제조·금융·정합성 코어 백엔드**: 원장/재고/주문 무결성, Outbox 패턴, Redis Lua 원자적 선점, 분산 락, SafeCash/VoiceLink 수치 증명.
     - **Python/Airflow 대용량 배치 & 데이터 파이프라인**: 1,973만 건 로그 파싱, COPY 스트리밍, 30.6% 처리 단축, 멱등성 및 재실행 안정화.
     - **AI 워크플로우 / 에이전트 실행 백엔드**: FastAPI/LangGraph 서빙, Tool Calling 트랜잭션 연동, 상태 감사 추적.
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
