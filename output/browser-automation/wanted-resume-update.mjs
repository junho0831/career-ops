import { getDefaultContext } from './_cdp.mjs';

const intro = `Java/Spring Boot 기반 백엔드 개발자로, 운영 중인 업무 시스템에서 중단 가능성, 중복 처리, 데이터 유실, 재처리 실패처럼 실제 운영에서 문제가 되는 흐름을 줄이는 작업을 해왔습니다.

엔셀에서는 검색 엔진 장애 시 조회가 중단될 수 있는 문제를 DB fallback 경로와 ES/DB 응답 정렬 정책 통일로 해결했고, Redis TTL 기반 Refresh Token 관리, 관리자 API, 공통 예외/validation 응답 표준화, Python/Airflow 기반 FTP 배치 이관과 재실행 안정화를 담당했습니다. 헥토에서는 수동 배포와 운영 복구 의존도를 줄이기 위해 GitLab CI/CD, Docker, Nginx 기반 배포 표준화와 RAG 검색 API, 운영 재처리 API를 개발했습니다.

개인 서비스 VoiceLink에서는 취소 직후 stale match, 중복 선점, 유령 세션, 종료 후 재매칭 충돌 문제를 Redis Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub, FOR UPDATE SKIP LOCKED, PESSIMISTIC_WRITE로 해결했고, LiveKit/WebRTC, Docker, Nginx, SSL, DNS까지 직접 운영했습니다.`;

const achievements = [
  {
    title: 'Airflow FTP 배치 마이그레이션 및 재실행 안정화',
    body: `FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어 Java 배치를 Python/Airflow DAG로 이관하며 처리 단계를 재설계했습니다. 다운로드, 검증, 변환, 저장, 업로드, 원본 정리 단계를 task로 분리해 어느 단계에서 실패했는지 확인하고 해당 지점부터 재처리할 수 있도록 개선했습니다. 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정하고, source_file unique constraint와 upsert 적재 로직으로 동일 파일 반복 실행 중복 적재를 방지했습니다. 입력일+전일 폴더 병행 스캔, max_active_runs=1, catchup=false, scratch cleanup으로 날짜 경계 누락과 반복 실행 리스크를 줄였습니다.`,
  },
  {
    title: '검색 fallback·인증·운영 API 안정화',
    body: `검색 엔진 비활성 또는 예외 상황에서 야근 신청 조회가 중단될 수 있어 Elasticsearch 실패 조건을 분리하고 DB fallback 검색 경로를 설계했습니다. ES/DB 응답 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 사용자와 운영자가 동일한 조회 결과를 해석할 수 있도록 개선했습니다. Redis TTL 기반 Refresh Token 저장·검증·회전·삭제와 관리자 API, 공통 오류 응답, 재색인/시트 동기화 기능까지 연결해 운영 대응 흐름을 정리했습니다.`,
  },
  {
    title: '공통 예외 처리·회귀 테스트 표준화',
    body: `API마다 오류 응답과 validation 메시지 해석 방식이 달라 장애 분석 기준이 흔들리는 문제가 있어 공통 예외 처리 계층과 표준 오류 응답으로 통합했습니다. 프론트엔드, 운영자, 개발자가 같은 오류 포맷을 기준으로 원인을 파악하도록 validation 정책과 메시지 구조를 정리하고, 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정했습니다. Vue.js 화면 상태도 MVVM + 공통 스토어 구조로 재정리해 장애 분석 리드타임을 40분에서 12분으로 줄이고 동일 오류 재발률을 30% 감소시켰습니다.`,
  },
  {
    title: 'RAG 검색 API 및 CI/CD 표준화',
    body: `키워드 검색만으로는 사내 문서의 맥락을 찾기 어려운 문제가 있어 LangChain 기반 RAG 검색 API로 의미 기반 질의응답 흐름을 보완했습니다. 질의응답 API를 모듈화하고 큐 기반 응답 흐름을 설계해 기존 시스템 변경 범위를 줄인 상태로 적용했으며, 질의 응답 정확도를 60%에서 80%로 높이고 답변 대기 시간을 5분에서 1분으로 줄였습니다. 동시에 수동 배포 누락과 환경 차이 리스크를 줄이기 위해 GitLab CI/CD, Docker, Nginx, Staging 환경 기반으로 빌드·테스트·배포 절차를 표준화해 릴리스 리드타임을 1시간에서 25분으로 단축했습니다.`,
  },
  {
    title: '정기 배치 및 Admin 재처리 API 구축',
    body: `수동 실행과 개발자 DB 확인에 의존하던 정기 데이터 동기화 작업을 Crontab 기반 배치로 자동화했습니다. 실행 이력과 결과 로깅 구조를 추가해 이상 징후를 운영자가 빠르게 확인하도록 개선하고, Admin UI/API에 조회·수정·재처리 기능을 연결해 개발자 개입 없이 운영자가 직접 복구 가능한 흐름을 구축했습니다. 데이터 정합성 이슈를 월 3건에서 0건으로 낮췄습니다.`,
  },
];

const details = [
  `AI를 구현·디버깅·문서화·실험 가속 도구로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영했습니다. 취소 직후 stale 결과가 반환되거나 동일 후보가 중복 선점되는 문제를 Redis ZSET 대기열, Presence TTL, Lua Script 기반 Atomic Claim, Cancel Marker 재검증으로 해결했습니다. Pub/Sub 유실 또는 노드 재시작 상황에서도 결과를 회수할 수 있도록 DB Outbox + Redis Pub/Sub + FOR UPDATE SKIP LOCKED 기반 발행 구조를 설계했고, LiveKit webhook과 /match/end 흐름을 CallSession.ended_at 기준으로 통합하고 PESSIMISTIC_WRITE로 종료 처리를 직렬화해 유령 세션과 종료 후 재매칭 충돌을 해결했습니다.`,
  `Spring Boot 기반 이커머스 플랫폼 설계·구현 과정을 수료했습니다. 도메인 모델링, API 설계, 계층 분리, 상황별 기술 선택을 중심으로 백엔드 설계 판단 기준을 정리했습니다.`,
  `Spring Security 기반 인증·권한 관리와 카카오·네이버·구글 OAuth2 소셜 로그인, JWT 발급·세션 관리 흐름을 구현했습니다.`,
];

async function main() {
  const { browser, context } = await getDefaultContext();
  const page = context.pages().find((item) => item.url().includes('/cv/AAYCAgIDDAJPBA8BAA0HBUpA')) || context.pages()[0];
  await page.bringToFront();

  await page.locator('textarea[placeholder*="채용 담당자들이 가장 먼저 읽게 되는 글입니다."]').fill(intro);

  const titleInputs = page.locator('input[placeholder="주요 성과"]');
  const bodyAreas = page.locator('textarea[placeholder*="업무 경험을 성과 기반으로 작성해 보세요."]');
  for (let i = 0; i < achievements.length; i += 1) {
    await titleInputs.nth(i).fill(achievements[i].title);
    await bodyAreas.nth(i).fill(achievements[i].body);
  }

  const detailAreas = page.locator('textarea[placeholder="세부 내용을 작성해 보세요."]');
  for (let i = 0; i < details.length; i += 1) {
    await detailAreas.nth(i).fill(details[i]);
  }

  await page.getByRole('button', { name: '작성 완료' }).click();
  await page.waitForTimeout(3000);
  console.log(JSON.stringify({ title: await page.title(), url: page.url() }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
