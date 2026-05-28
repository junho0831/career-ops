import { getDefaultContext } from './_cdp.mjs';

const intro = `Java/Spring Boot 기반 백엔드 개발자로, 운영 중인 업무 시스템에서 인증, 검색 fallback, 배치, 관리자 API, 공통 예외 처리, 데이터 정합성 개선을 중심으로 일해왔습니다.

엔셀에서는 Elasticsearch 장애 시 DB fallback 검색 구조, Redis TTL 기반 Refresh Token 관리, 관리자 API, 공통 예외/validation 응답 표준화, Airflow 기반 FTP 데이터 처리 자동화 파이프라인을 구현했습니다. 헥토에서는 GitLab CI/CD, Docker, Nginx 기반 배포 표준화와 RAG 검색 API, 운영 재처리 API를 개발했습니다.

개인 서비스 VoiceLink에서는 Redis Lua Script 기반 Atomic Claim, DB Outbox + Redis Pub/Sub, FOR UPDATE SKIP LOCKED, PESSIMISTIC_WRITE를 활용해 실시간 매칭과 세션 정합성 문제를 해결했고, LiveKit/WebRTC, Docker, Nginx, SSL, DNS까지 직접 운영했습니다.`;

const achievements = [
  {
    title: 'Airflow FTP 배치 마이그레이션 및 재실행 안정화',
    body: `Java 기반 FTP 파일 처리 배치를 Python/Airflow 데이터 자동화 파이프라인으로 이관했습니다. 입력일+전일 폴더를 함께 스캔해 날짜 경계 파일 누락을 줄였고, 다운로드·업로드 검증, 변환, 저장, 업로드, 원본 정리 단계를 분리해 실패 지점 추적이 가능하도록 재설계했습니다. 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정하고 source_file unique 제약과 upsert를 적용해 동일 파일 중복 적재를 방지했습니다.`,
  },
  {
    title: '검색 fallback·인증·운영 API 안정화',
    body: `야근 신청/승인/반려/조회 흐름을 운영 가능한 Spring 기반 백엔드로 구현했습니다. Elasticsearch 비활성 또는 검색 예외 시 DB fallback 검색으로 전환해 검색 중단 없이 서비스를 유지했고, ES/DB 결과 포맷과 정렬 정책을 통일해 fallback 전환 시 응답 정합성을 유지했습니다. Redis TTL 기반 Refresh Token 저장·검증·회전·삭제와 관리자 API, 공통 오류 응답, 재색인/시트 동기화 기능까지 연결해 운영 대응 효율을 높였습니다.`,
  },
  {
    title: '공통 예외 처리·회귀 테스트 표준화',
    body: `API별로 흩어져 있던 예외 처리 로직을 공통 예외 처리 계층과 표준 오류 응답으로 통합했습니다. validation 정책과 오류 메시지 포맷을 정리하고 JUnit5/Mockito 기반 회귀 테스트를 추가해 반복 장애를 배포 전 검증 흐름으로 이동시켰습니다. Vue.js 화면 상태도 MVVM + 공통 스토어 구조로 재정리해 장애 분석 리드타임을 40분에서 12분으로 줄이고 동일 오류 재발률을 30% 감소시켰습니다.`,
  },
  {
    title: 'RAG 검색 API 및 CI/CD 표준화',
    body: `LangChain 기반 RAG 검색 API를 구현해 키워드 중심 검색의 한계를 의미 기반 검색으로 보완했습니다. 질의응답 API를 모듈화하고 큐 기반 응답 흐름을 설계해 기존 환경 변경 없이 적용했으며, 질의 응답 정확도를 60%에서 80%로 높이고 답변 대기 시간을 5분에서 1분으로 줄였습니다. 동시에 GitLab CI/CD, Docker, Nginx, Staging 환경 기반으로 빌드·테스트·배포 절차를 표준화해 릴리스 리드타임을 1시간에서 25분으로 단축했습니다.`,
  },
  {
    title: '정기 배치 및 Admin 재처리 API 구축',
    body: `정기 데이터 동기화 작업을 Crontab 기반 배치로 자동화하고 실행 이력과 결과 로깅 구조를 추가했습니다. Admin UI/API에 조회·수정·재처리 기능을 연결해 운영자가 직접 복구 가능한 흐름을 구축했고, 데이터 정합성 이슈를 월 3건에서 0건으로 낮췄습니다.`,
  },
];

const details = [
  `AI를 구현·디버깅·문서화·실험 가속 도구로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영했습니다. Redis ZSET 대기열 + Presence TTL + Lua Script 기반 Atomic Claim으로 동일 후보 중복 선점 race condition을 차단했고, DB Outbox + Redis Pub/Sub + FOR UPDATE SKIP LOCKED 기반 발행 구조로 재시작/유실 상황에서도 매칭 결과를 회수 가능하게 설계했습니다. LiveKit webhook과 /match/end 흐름을 CallSession.ended_at 기준으로 통합하고 PESSIMISTIC_WRITE로 종료 처리를 직렬화해 유령 세션과 종료 후 재매칭 충돌을 해결했습니다.`,
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
