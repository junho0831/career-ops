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

## 1. 핵심 원칙: 회사/포지션별 맞춤 이력서 선택

> [!IMPORTANT]
> **모든 회사에 동일한 한 가지 이력서만 일괄 제출하지 않습니다.**
> - 지원 대상 회사의 도메인과 공고의 핵심 요구 스택(Java vs Python, 실시간 트래픽 vs 대용량 데이터/배치, 커머스/결제 vs AI/검색)에 따라 **가장 적합한 버전의 이력서/자기소개서를 선택하여 제출**해야 서류 합격률이 극대화됩니다.
> - 단, 어떤 이력서 버전을 사용하더라도 기재된 사실은 반드시 [`cv.md`](file:///home/junho/IdeaProjects/career-ops/cv.md)에 기반해야 합니다 (100% 진실성 유지).

---

## 2. 현재 설치된 `browsermcp` 연동 제어 원칙

> [!WARNING]
> **파이썬 스크립트(x11/매크로) 및 DevTools 콘솔 조작 일체 금지**
> - 포커스 이탈 및 화면 가림을 방지하기 위해 오직 사용자 환경에 연동된 **`browsermcp`** 도구만을 사용합니다.
> 1. `browser_navigate`: 공고 URL 직접 이동 (추천 포지션, 직무 상세 링크)
> 2. `browser_snapshot`: 공고 텍스트, `지원하기` vs `지원완료` 버튼 상태 식별, 모달 내부 이력서 목록 확인
> 3. `browser_click`: 타깃 맞춤 이력서 선택 및 최종 제출 버튼 클릭
> 4. `browser_wait`: 모달 렌더링 및 제출 완료 대기

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
