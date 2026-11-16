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
   - **플랫폼별 계정 로그인/인증 방식**:
     - **위시켓(Wishket)**: **구글 소셜 로그인(Google Login)** 방식을 사용한다. 세션 확인 및 로그인 필요 시 구글 계정(`junho6667@gmail.com`) 간편 연동을 기준으로 처리한다.
     - **프리모아(Freemoa)**: **네이버 소셜 로그인(Naver Login)** 방식을 사용한다. 세션 확인 및 로그인 필요 시 네이버 계정(`junho8889@naver.com`) 간편 연동을 기준으로 처리한다.

2. **외주/프리랜서 절대 원칙 (지원 전 필수 지침 필독 / 100% 원격 필수 / 위시켓 공인 5대 요소 제안서 전략)**:
   - **★ [필수 선행 단계] 프리랜서 지원 전 지침 문서 필독 의무**:
     - 위시켓, 프리모아 등 프리랜서/외주 공고를 탐색하거나 제안서를 작성하기 전, 반드시 먼저 [`docs/FREELANCE_APPLICATION_GUIDE.md`](docs/FREELANCE_APPLICATION_GUIDE.md)를 완독하고 그 규칙과 템플릿 원칙을 100% 숙지한 상태에서만 진행한다.
   - **원격 근무 필수 검증 (Off-Limits for Onsite)**: 사람인, 원티드, 위시켓, 프리모아 등 모든 플랫폼에서 프리랜서/계약직/외주 프로젝트 지원 시 **"100% 재택", "원격근무", "풀리모트"가 공고 본문이나 근무조건에 명시되지 않은 경우 무조건 즉시 배제(지원 금지)**한다.
   - **상주/파견/출근 즉시 탈락**: "상주 필수", "파견", "주 N일 출근", "역세권 사무실 근무", "사무실 상주", "미팅 외 출근" 등 단 하루라도 오프라인 출근이 요구되는 공고는 '프리랜서' 타이틀이 붙어있더라도 절대 지원하지 않는다.
   - **위시켓 공인 5대 필수 제안 구조 준수**:
     - ⓪ **근무 조건 확정 (필수 기재)**: **"본 제안은 100% 원격(재택) 개발 기준으로 진행됩니다. (오프라인 상주/파견 근무 불가)"** 문구를 제안서 최상단 및 근무 조건 란에 반드시 명시.
     - ① **분석 내용**: 클라이언트 요구사항의 핵심 목표 및 잠재 병목/유의점 사전 분석
     - ② **맞춤 제안**: MVP 1단계 안정화 + 2단계 고도화/안전장치(Fallback) 등 적극적 대안 제시
     - ③ **유사 경험**: 대용량 배치(Prism 2천만건/30%단축), 동시성(VoiceLink 1인설계), 어드민(SafeCash 재처리) 실증 사례 연결
     - ④ **작업툴/소통**: Slack/Notion/GitHub 기반 투명한 일상어 보고 및 중간 검증 화면 제공
     - ⑤ **관련 포트폴리오 연결**: 깃허브([https://github.com/junho0831](https://github.com/junho0831))와 본 프로젝트 핵심 기능의 일치점을 명시 (so-dak/voice-link 등 외부 도메인 배제, GitHub 단일 원칙)
   - **프리랜서 단가 파격 할인 전략 (반값 단가 50% 전략)**:
     - 위시켓, 프리모아 등 프리랜서/외주 지원 시 **공고 예산/평균 단가의 50%(반값) 수준으로 제안 금액을 책정**하여 가격 경쟁력을 극대화한다.
     - 제안 사유: "초기 파트너십 구축 및 빠른 MVP 1차 론칭 검증을 위해 정상 단가 대비 50% 수준의 파격적인 견적으로 제안드립니다. (100% 원격 전담 개발)"를 제안서에 명시.
   - 상세 지침: [`docs/FREELANCE_APPLICATION_GUIDE.md`](docs/FREELANCE_APPLICATION_GUIDE.md) 준수.

3. **일반 채용 지원 기업 규모 원칙 (대기업·중견기업·빅테크 & 시리즈 A 이상 스타트업)**:
   - **직행(Zighang), 원티드, 사람인, 잡코리아** 등 정규직 일반 채용 지원 대상은 **'대기업, 중견기업, 제조업(반도체/로봇/MES/스마트팩토리), 빅테크(네카라쿠배당토, 유니콘)' 및 '시리즈 A 이상 투자를 유치한 성장 스타트업'**까지 포함한다.
   - 시드/프리A 이전의 극초기/영세 스타트업은 배제하고, 대기업·중견 제조업 및 최소 시리즈 A(누적 투자 유치 등 검증된 기업) 이상부터 적극 지원한다.
   - 회사의 도메인과 JD 요구 역량(제조/설비 데이터, 대용량 데이터/배치, 실시간 백엔드, Python/SaaS, 정합성/안정성)에 부합하는 최적의 이력서 버전을 선별하여 제출한다.
   - 이미 지원된 공고(`지원완료`)는 사전 판별하여 건너뛴다.
   - 상세 지침: [`docs/JOB_BOARD_APPLICATION_GUIDE.md`](docs/JOB_BOARD_APPLICATION_GUIDE.md) 준수.

4. **100% 진실 기반 작성 (Ground Truth) 및 사실 날조 원천 금지**:
   - 모든 지원서 및 문항 답변은 오직 [`cv.md`](cv.md)에 명시된 사실 데이터만을 기반으로 작성한다 (허위 기재/과장 엄격 금지).
   - **세이프캐시(SafeCash) 사실 관계 확정 및 날조 금지**:
     - SafeCash는 헥토이노베이션 마이데이터팀에서 수행한 **'Crontab 정기 배치 자동화 및 Admin UI/API 재처리'** 프로젝트이며, 데이터 정합성 이슈 `월 3건 → 0건` 개선 경험이다.
     - **PG사(나이스페이, 토스페이먼츠, 스트라이프, 페이팔 등) 결제창 연동, 카드/간편결제 모듈, 승인/취소/환불 웹훅 등 결제 도메인과는 일체 무관**하다.
     - 지원서, 제안서, 이력서 어디에서도 SafeCash를 결제/PG 연동 경험으로 거짓 기술하는 행위를 일체 엄단한다.
   - **과거 리포트/세션 요약의 와전 내용 인용 금지**:
     - 과거 세션 요약이나 오래된 리포트에 와전된 표현이 있더라도 이를 사실로 인용하지 않으며, 모든 경력 팩트의 유일한 진실 원천(Ground Truth)은 오직 [`cv.md`](cv.md) 원본 텍스트만을 기준으로 한다.

5. **지원 내역 피드백 및 정밀 검색·스코어링 전략 (3개 축 + 보조 탐색)**:
   - **1단계: 3개 축 + 보조 교차 수집 (Broad Gathering)**:
     - **1축 (Data/Batch Backend)**: 데이터 백엔드, 데이터 플랫폼, 데이터 파이프라인, 배치 개발, ETL 개발, Backend Data Engineer
     - **2축 (Data Engineer)**: 데이터 엔지니어, Data Engineer, Airflow, ETL, 데이터 수집, 데이터 적재, Python SQL
     - **3축 (Java Backend)**: Java 백엔드, Spring Boot 백엔드, 서버 개발자, Backend Engineer
     - **보조 교차 (제조/반도체 데이터)**: 반도체 데이터, 제조 데이터, MES 개발, 스마트팩토리, 공정 데이터 (백엔드+제조, 데이터엔지니어+제조 교차)
     - **보조 탐색 (AI Backend)**: AI Backend, RAG Backend, LLM Backend, LangChain Python
   - **2단계: 공고 본문 가중치 스코어링 (Scoring & Fit)**:
     - **+3점 (코어 역량)**: Java, Spring Boot, Python, Airflow, PostgreSQL, Batch, ETL
     - **+2점 (강점 역량)**: Redis, Elasticsearch, Docker, 대용량, 데이터 파이프라인, SQL, 정합성, 로그 처리, 재처리
     - **+1점 (우대/인접 기술)**: Kafka, Spark, AWS, Kubernetes (미경험 우대사항이라도 즉시 제외하지 않고 우수 공고로 포용)
     - **차별화 요소 (JD 발견 후 매칭도 극대화)**: COPY, Server-side Cursor, Partition, Upsert, Outbox, Lua Script, 분산 락/동시성, RAG/LangChain
   - **3단계: Hard Negative 필수 제외만 적용 (Minimal Title Exclusions)**:
     - **제외 대상 (공고 제목/주요 직무 기준)**: 정보보안/보안 엔지니어/보안 담당자(Security/DevSecOps/보안관제/보안취약점 등 보안 직무 일체), 필드 엔지니어(Field Engineer / FAE), 기술지원/유지보수 엔지니어, 프론트엔드 개발자, 퍼블리셔, iOS/Android 개발자, UI/UX 디자이너, PM/PO 전담, QA 전담, 펌웨어/임베디드 전담, 데이터 사이언티스트/BI 분석가, 영업/마케터.
     - **완화 규칙**: 공고 본문에 React, Vue, QA, PM 단어가 단순히 언급되어 있더라도, 백엔드/데이터가 주 업무라면 절대 제외하지 않고 적극 지원 대상에 포함한다.
   - **근무 형태별 엄격 규칙**:
     - **프리랜서 / 외주 프로젝트**: **무조건 100% 원격근무(재택)만 가능. 조금이라도 상주·출근·파견이 요구되면 절대 지원 금지 (즉시 배제)**.
     - **정규직 / 계약직 채용**: **일반 회사 출퇴근(강남, 판교, 여의도, 마포 등 전 지역) 및 하이브리드 정상 지원 가능**.

## Custom Workflows

- **"외주/프리 지원"**: 위시켓 및 프리모아에서 **100% 원격/재택(비상주)** 백엔드/데이터 프로젝트만 탐색하고, 비개발자용 3단계 안심 제안서(요구사항 분석 -> 유사 경험 -> 원격 협업 약속)를 작성하여 지원.
- **"채용 지원"**: 대기업·중견기업·빅테크 및 성장 테크기업 공고(일반 출근/재택 무관)를 대상으로 `지원완료` 여부를 체크하고, JD 분석 후 매칭 이력서로 입사지원 수행.

## Output Preferences

- **제출 이력서 고정 (사용자 직접 지시 2026-10-11)**: 입사지원에는 Data Root의 `박준호_이력서.pdf` 원본만 첨부한다. 이 파일은 사용자가 제공한 기존 4쪽 이력서를 이름만 변경한 것이다. 회사별 맞춤 PDF, AI가 새로 생성한 PDF, 추가 경력기술서로 임의 대체하거나 추가 첨부하지 않는다. 수정본 사용은 먼저 실제 내용을 보여주고 사용자에게 명시적인 승인을 받은 경우에만 허용한다. 기존 지원 취소·서류 교체는 회사의 실제 처리 확인 전 완료로 표시하지 않는다.
- 지원 전후 상태(`지원완료`, `제출완료`, `프리 상주 제외`, `기업규모 제외`)를 명확하게 1줄 요약으로 보고한다.
- 외주 지원서 작성 시 비개발자 눈높이 맞춤 번역 표현을 우선 적용한다.

## Off-Limits

- **프리랜서/외주의 상주·파견 근무 지원 절대 금지**: 프리랜서 및 외주 프로젝트(위시켓, 프리모아 등) 중 상주/파견 조건은 절대 지원하지 않는다 (100% 원격/재택 외주만 지원 가능). *단, 정규직 채용의 일반 회사 출퇴근은 해당하지 않음.*
- 소규모/영세 스타트업(시드, 프리A 이하) 대상 일반 채용 지원 금지 (대기업·중견·빅테크 및 시리즈 A 이상 성장 스타트업만 지원).
- 프론트엔드(React/Flutter 등) 중심 풀스택 및 Nest.js 전용 공고 지원 절대 금지.
- 사이드 프로젝트성 무보수/팀빌딩 공고 지원 금지.
- 파이썬 매크로 스크립트 작성 및 DevTools 콘솔 코드 주입 절대 금지.
- `cv.md`에 없는 허위 경력이나 과장된 수치 작성 절대 금지.
- **보안 직무(Security/DevSecOps/보안관제/정보보안) 지원 절대 금지**: 보안 전담 포지션(정보보안, 보안 엔지니어, 보안 담당자, DevSecOps, 침해대응 등)은 일체 지원하지 않으며, 백엔드 및 데이터 엔지니어링 포지션에만 집중한다.
- **노드(Node.js / Nest.js / Express 등) 프로젝트/포지션 지원 절대 금지**: Node.js/Nest.js 기반 백엔드 및 풀스택 프로젝트나 공고는 지원 대상에서 영구 제외한다. 주력 기술 스택인 Java/Spring Boot 및 Python/Airflow/데이터 파이프라인에만 집중한다.
- **근무지 제한 (경기도권 필수)**: 지원 대상 공고는 반드시 경기도권(경기 판교/성남, 수원, 용인, 화성, 안양, 과천 등 경기 소재 기업)으로만 제한한다. 서울 및 타 지방 소재 공고는 지원 대상에서 제외한다 (단, 100% 전면 재택/원격근무 제외).
- **헥토(Hecto) 관련 전 계열사 지원 절대 금지**: 헥토월렛원, 헥토파이낸셜, 헥토이노베이션 등 헥토 계열사 전체는 모든 채용/외주 지원 대상에서 영구 제외한다.
