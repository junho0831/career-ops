# 채용 포털 지원 가이드 (원티드, 사람인, 잡코리아)

> [!NOTE]
> **Career-Ops 지원 가이드 문서 체계 (2원화)**
> - **정규직 채용 포털 (본 문서)**: [`docs/JOB_BOARD_APPLICATION_GUIDE.md`](file:///home/junho/IdeaProjects/career-ops/docs/JOB_BOARD_APPLICATION_GUIDE.md) — 원티드·사람인·잡코리아 대상 회사/JD별 맞춤 이력서 매칭 매트릭스, 원클릭 지원 노하우
> - **외주 / 프리랜서**: [`docs/FREELANCE_APPLICATION_GUIDE.md`](file:///home/junho/IdeaProjects/career-ops/docs/FREELANCE_APPLICATION_GUIDE.md) — 비개발자 클라이언트 관점의 쉬운 제안서, 견적/일정 산정, 안심 협업 템플릿
> - **현재 설치/연동된 도구**: 현재 환경에 설치된 공식 브라우저 제어 MCP 서버인 **`browsermcp`** 도구(`call_mcp_tool` -> `ServerName: "browsermcp"`)만을 사용합니다. (외부 파이썬 매크로, 셀레니움, DevTools 콘솔 조작 일체 금지)
> - **공통 기준 데이터**: [`cv.md`](file:///home/junho/IdeaProjects/career-ops/cv.md) — 100% 진실 기반 이력서 원본 사실 데이터

---

본 문서는 [`cv.md`](file:///home/junho/IdeaProjects/career-ops/cv.md)의 사실에 기반하여, 원티드(Wanted)·사람인(Saramin)·잡코리아(JobKorea) 등 국내 주요 채용 포털 지원 시 **회사 및 포지션 맞춤형 이력서 선택 전략과 현재 설치된 `browsermcp`를 통한 안정적 지원 절차**를 정리한 가이드입니다.

---

## 1. 핵심 원칙: 3개 축 정밀 검색 및 공고 본문 가중치 스코어링

> [!IMPORTANT]
> **검색어는 짧고 간결하게 대량 수집하고, 공고 본문에서 가중치 스코어링으로 적합도를 판별합니다.**
> - 긴 복합 키워드(예: `데이터 플랫폼 백엔드`, `Airflow 배치 개발`)는 포털 검색 엔진의 모수를 심각하게 축소시키므로 지양합니다.
> - **단일·단문 키워드로 1차 대량 수집** 후, **공고 본문의 기술 스택 가중치(+3/+2/+1)와 차별화 요소**를 기반으로 최종 지원 대상 공고를 랭킹화합니다.

### 1) 3개 축 + 보조 탐색 단일 검색어
- **1축 (Data/Batch Backend)**: `백엔드`, `서버`
- **2축 (Data Engineer)**: `데이터`, `Airflow`, `배치`, `ETL`
- **3축 (Java/Spring Backend)**: `Java`, `Spring`
- **보조 교차 (제조/반도체 교차)**: `MES`, `스마트팩토리` (단독 직군이 아닌 백엔드/데이터와 교차되는 포지션 탐색)
- **보조 탐색 (AI Backend)**: `RAG`, `LangChain`, `Python`

### 2) 공고 본문 가중치 스코어링 (+3 / +2 / +1)
- **+3점 (코어 역량)**: Java, Spring Boot, Python, Airflow, PostgreSQL, Batch, ETL
- **+2점 (강점 역량)**: Redis, Elasticsearch, Docker, 대용량, 데이터 파이프라인, SQL, 정합성, 로그 처리, 재처리
- **+1점 (우대/인접 역량)**: Kafka, Spark, AWS, Kubernetes (미경험 우대사항이 있어도 배제하지 않고 지원 가능 공고로 포용)
- **차별화 부스터 (JD 발견 후 자소서/이력서 집중 어필)**: COPY, Server-side Cursor, Partition, Upsert, Outbox, Lua Script, 분산 락/동시성, RAG/LangChain

### 3) Hard Negative 최소 배제 규칙
- **제목/주요직무 기준 배제**: 프론트엔드 전담, 퍼블리셔, iOS/Android 전담, UI/UX 디자이너, PM/PO 전담, QA 전담, 펌웨어/임베디드 전담, 데이터 사이언티스트/BI 분석가, 영업/마케터, 인턴.
- **포용 규칙**: 공고 본문에 React, Vue, QA, PM 등이 협업/우대 단어로 언급되더라도 백엔드/데이터가 주 업무라면 절대 제외하지 않고 적극 지원 대상으로 포함합니다.

---

## 2. 회사/포지션별 맞춤 이력서 및 자기소개서 작성 원칙

> [!IMPORTANT]
> **모든 회사에 동일한 한 가지 이력서/자기소개서만 일괄 제출하지 않습니다.**
> - 지원 대상 회사의 도메인과 공고의 핵심 요구 스택에 따라 **가장 적합한 버전의 이력서와 맞춤형 지원동기/자기소개서를 즉시 생성하여 제출**합니다.
> - **지원 기업 규모 원칙**: 대기업, 중견기업, 빅테크 및 **시리즈 A 이상 투자를 유치한 검증된 성장 스타트업**까지 지원 범위를 적용합니다 (시드/프리A 극초기 스타트업은 배제).

---

## 2. 현재 설치된 `browsermcp` 연동 제어 원칙
 
> [!WARNING]
> **우회 러너 스크립트, 파이썬 매크로 및 DevTools 콘솔 조작 일체 금지**
> - 포커스 이탈 및 예기치 못한 에러를 방지하기 위해 오직 시스템 기본 MCP 도구인 **`browsermcp`**(`call_mcp_tool` -> `ServerName: "browsermcp"`)만을 직접 호출하여 사용합니다.
> - `run_command`를 통한 Node 래퍼(`node browsermcp-runner.cjs`), 셸 스크립트, 파이썬 매크로, DevTools 콘솔 주입은 전면 금지됩니다.
> 1. `browser_navigate`: 공고 URL 직접 이동 (추천 포지션, 직무 상세 링크)
> 2. `browser_snapshot`: 공고 텍스트, `지원하기` vs `지원완료` 버튼 상태 식별, 모달 내부 이력서 목록 확인
> 3. `browser_click`: 타깃 맞춤 이력서 선택 및 최종 제출 버튼 클릭
> 4. `browser_wait`: 모달 렌더링 및 제출 완료 대기
> 5. `browser_screenshot`: 화면 상태 시각적 최종 검증

---

## 3. 포지션 유형별 맞춤 이력서 매칭 매트릭스

| 타깃 포지션 유형 | 추천 이력서 버전 / 강조 프로젝트 | 핵심 부각 역량 | 적합 기업군 예시 |
| :--- | :--- | :--- | :--- |
| **대용량 데이터 / 배치 엔지니어** | **Data/Batch Backend 중심 이력서**<br>- 엔셀 `Prism` (Airflow, PostgreSQL)<br>- 헥토이노베이션 `SafeCash` | • 1,973만 건 청크/COPY 적재 파이프라인 (처리 시간 30.6% 단축)<br>• 무손실 재실행 보장 및 DB 제약조건/UPSERT 정합성<br>• Airflow DAG 설계 및 정기 배치 자동화 | 쿠팡, 토스, 금융/핀테크, 엔터프라이즈 데이터팀 |
| **대규모 트래픽 / 실시간 백엔드** | **Java/Spring 백엔드 중심 이력서**<br>- 개인 프로젝트 `VoiceLink`<br>- 엔셀 `DataForge` | • Redis Lua Script 기반 원자 선점(Atomic Claim)<br>• DB Outbox + Pub/Sub, `FOR UPDATE SKIP LOCKED`<br>• ES 장애 대비 DB fallback 및 Redis TTL 인증 일원화 | 여기어때, 당근, 배달의민족, 미디어/스트리밍(CJ ENM) |
| **Python / SaaS / 빠른 성장 스타트업** | **Python/FastAPI & 실시간 중심 이력서**<br>- 개인 프로젝트 `VoiceLink`<br>- 헥토 `SmartQ` (FastAPI/LangChain)<br>- 엔셀 `Prism` (Python 파서) | • Python 기반 파이프라인 및 비동기 처리 역량<br>• LangChain/FastAPI RAG 서비스 구축<br>• 1인 Full-cycle 인프라(Docker, Nginx, SSL) 운영 능력 | 브레인다이브, AI/SaaS 스타트업, 초기/성장기 스타트업 |
| **엔터프라이즈 / 결제 / 정합성 백엔드** | **정합성 & 안정성 중심 이력서**<br>- 헥토이노베이션 `SafeCash`<br>- 엔셀 `SMIP` | • JUnit5/Mockito 회귀 테스트 체계 (오류 재발률 30% 감소)<br>• 표준 예외 계층 및 관리자 재처리 API 구축<br>• 데이터 정합성 이슈 월 3건 -> 0건 달성 | 금융권, 커머스 정산/결제팀, B2B 솔루션 |

---

## 4. 포털별 `browsermcp` 지원 프로세스

### 1) 원티드 (Wanted)
- **방식**: `browsermcp` 원클릭 간편 지원
- **실무 절차**:
  1. `browser_navigate`로 공고 이동 후 `browser_snapshot` 실행.
  2. 버튼이 `지원완료` (disabled)인지 확인 -> 이미 지원된 공고는 즉시 다음 공고로 이동.
  3. `지원하기` 버튼을 `browser_click`하여 모달 팝업 오픈.
  4. 모달 스냅샷을 확인하여 JD에 매칭되는 이력서 항목(예: Data/Batch vs 실시간 백엔드)의 체크 상태를 확인하고 필요 시 `browser_click`.
  5. 최종 `제출하기` 버튼을 `browser_click`으로 누르고, 페이지에 `지원완료` 상태가 정상 반영되었는지 확인.

### 2) 사람인 (Saramin)
- **방식**: `browsermcp` 빠른 입사지원
- **실무 절차**:
  1. `browser_snapshot`으로 `입사지원` / `빠른 입사지원` 버튼 ref 확인 후 `browser_click`.
  2. 모달 내 이력서 목록 중 타깃 직무 맞춤 이력서/자기소개서를 `browser_click`으로 선택.
  3. 필수 입력 문항 확인 후 제출 버튼 클릭.

### 3) 잡코리아 (JobKorea)
- **방식**: `browsermcp` 온라인 입사지원
- **실무 절차**:
  1. `온라인 입사지원` 클릭 후 대표 이력서/포트폴리오 첨부 상태 확인.
  2. 최종 제출 클릭 및 접수 완료 메시지 검증.

---

## 5. 자동화 시 체크리스트
- [ ] 파이썬 매크로/스크립트나 DevTools 조작 없이 현재 설치된 `browsermcp` 도구로만 수행되었는가?
- [ ] 회사의 주요 업무/스택에 가장 적합한 이력서 버전이 선택되었는가?
- [ ] 최종 제출 후 화면에 지원 완료 상태가 반영되었는가?
