import { getDefaultContext } from './_cdp.mjs';

const careerTexts = {
  c15: `DataForge | 2026.01 ~ 현재
- Elasticsearch 비활성/검색 예외 시 DB fallback 검색으로 전환하고 ES/DB 응답 스키마를 맞춰 승인/조회 기능을 유지했습니다.
- requester_id, start_at, status 인덱스와 unique constraint로 조회 성능과 중복 신청/중복 승인 방지 정합성을 함께 고려했습니다.
- JWT + Redis 기반 인증 구조로 Refresh Token 저장·검증·회전·삭제를 TTL 기반으로 일원화했고, 관리자 API·표준 오류 응답·알림 메일·전체 재색인·선택적 CSV 동기화 기능을 연결했습니다.

Prism Airflow FTP Batch Migration | 2026.02 ~ 현재
- Java 기반 FTP 파일 처리 배치를 Python/Airflow DAG로 마이그레이션했습니다.
- max_active_runs=1, catchup=False, 입력일+전날 FTP 폴더 스캔으로 반복 실행과 날짜 경계 파일 누락을 줄였습니다.
- 업로드/DB commit 이후 FTP 원본 삭제, source_file unique + upsert, 파일 다운로드/업로드 검증, scratch cleanup을 적용해 재실행 안정성을 높였습니다.

SMIP 유지보수 | 2025.01 ~ 2025.12
- 공통 예외 처리 계층, 표준 오류 응답, 검증 메시지 기준, 테스트 코드 도입으로 장애 분석 리드타임을 줄였습니다.
- Vue 화면 상태는 MVVM + Store 구조로 분리했고, 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트와 문서화 대상으로 분리했습니다.`,
  c16: `AI/개발팀 | 2023.10 ~ 2024.07
- LangChain·RAG 기반 사내 문서 검색 기능을 구현해 키워드 검색의 맥락 검색 한계를 보완했습니다.
- GitLab CI/CD + Docker 기반 배포 자동화 파이프라인을 구축했고, Nginx + Staging 환경으로 배포 전 API 검증 경로를 분리했습니다.
- 빌드 산출물, 실행 환경, 배포 경로를 표준화해 수동 배포 누락과 환경 차이를 줄였습니다.`,
  c17: `세이프캐시 마이데이터개발팀 | 2022.08 ~ 2023.09
- Crontab 기반 정기 데이터 동기화 배치를 자동화하고 실행 이력/결과 로그를 남겼습니다.
- Admin UI/API에 조회·수정·재처리 기능을 연결해 수동 배치 실행과 개발자 DB 확인에 의존하던 작업을 자동 실행, 결과 로깅, 재처리 API 구조로 전환했습니다.`,
};

async function main() {
  const { browser, context } = await getDefaultContext();
  const page = context.pages().find((item) => item.url().includes('/User/Resume/Edit')) || context.pages()[0];
  await page.bringToFront();

  const text = page.locator('#Career_Prfm_Prt_c15');
  await text.fill(careerTexts.c15);

  await page.locator('#Career_Prfm_Prt_c16').fill(careerTexts.c16);
  await page.locator('#Career_Prfm_Prt_c17').fill(careerTexts.c17);

  await page.getByRole('button', { name: '이력서저장' }).click();
  await page.waitForTimeout(4000);
  console.log(JSON.stringify({ title: await page.title(), url: page.url() }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
