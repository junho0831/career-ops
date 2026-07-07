import { getDefaultContext } from './_cdp.mjs';

const careerTexts = {
  c15: `DataForge | 2026.01 ~ 현재
- 검색 엔진 비활성 또는 예외 상황에서 야근 신청 조회가 중단될 수 있어 Elasticsearch 실패 조건을 분리하고 DB fallback 검색 경로를 설계했습니다.
- ES/DB 응답 포맷과 정렬 정책을 맞춰 fallback 전환 후에도 사용자와 운영자가 동일한 조회 결과를 해석할 수 있도록 개선했습니다.
- requester_id, start_at, status 인덱스와 unique constraint로 조회 성능과 중복 신청·승인 방지 정합성을 함께 개선했습니다.
- Refresh Token 저장, 검증, 회전, 삭제를 Redis TTL 기준으로 일원화하고 관리자 API·표준 오류 응답·알림 메일·재색인·시트 동기화 기능을 연결했습니다.

Prism Airflow FTP Batch Migration | 2026.02 ~ 현재
- FTP 파일 처리 배치에서 실패 지점 추적이 어렵고 재실행 시 중복 적재·원본 삭제 순서 문제가 생길 수 있어 Java 배치를 Python/Airflow DAG로 이관하며 처리 단계를 재설계했습니다.
- 다운로드, 검증, 변환, 저장, 업로드, 원본 정리 단계를 task로 분리해 어느 단계에서 실패했는지 확인하고 해당 지점부터 재처리할 수 있도록 개선했습니다.
- 업로드 성공과 DB commit 이후에만 FTP 원본을 삭제하도록 순서를 고정하고 source_file unique constraint와 upsert 적재 로직으로 동일 파일 반복 실행 중복 적재를 방지했습니다.
- max_active_runs=1, catchup=False, 입력일+전일 FTP 폴더 스캔, scratch cleanup으로 날짜 경계 누락과 반복 실행 리스크를 줄였습니다.

SMIP 유지보수 | 2025.01 ~ 2025.12
- API마다 오류 응답과 validation 메시지 해석 방식이 달라 장애 분석 기준이 흔들리는 문제가 있어 공통 예외 처리 계층과 표준 오류 응답으로 통합했습니다.
- 프론트엔드, 운영자, 개발자가 같은 오류 포맷을 기준으로 원인을 파악하도록 validation 정책과 메시지 구조를 정리하고 반복 장애 케이스를 JUnit5/Mockito 회귀 테스트로 고정했습니다.
- Vue 화면 상태는 MVVM + Store 구조로 분리해 UI 상태 변경 영향 범위와 인수인계 비용을 줄였습니다.`,
  c16: `AI/개발팀 | 2023.10 ~ 2024.07
- 키워드 검색만으로는 사내 문서의 맥락을 찾기 어려운 문제가 있어 LangChain 기반 RAG 검색 API로 의미 기반 질의응답 흐름을 보완했습니다.
- 수동 배포 누락과 환경 차이 리스크를 줄이기 위해 GitLab CI/CD + Docker 기반 빌드·테스트·배포 파이프라인을 구축했고, Nginx + Staging 환경으로 배포 전 API 검증 경로를 분리했습니다.
- 빌드 산출물, 실행 환경, 배포 경로를 표준화해 릴리스 확인 절차를 팀 공통 흐름으로 정리했습니다.`,
  c17: `세이프캐시 마이데이터개발팀 | 2022.08 ~ 2023.09
- 수동 실행과 개발자 DB 확인에 의존하던 정기 데이터 동기화 작업을 Crontab 기반 배치로 자동화했습니다.
- 실행 이력과 결과 로깅 구조를 추가해 이상 징후를 운영자가 빠르게 확인하도록 개선하고, Admin UI/API에 조회·수정·재처리 기능을 연결해 운영자가 직접 복구할 수 있는 흐름을 구축했습니다.
- 데이터 정합성 이슈를 월 3건에서 0건으로 낮췄습니다.`,
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
