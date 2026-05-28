# Browser Automation Scripts

이 폴더에는 이번 세션에서 실제로 동작 확인이 끝난 CDP/Playwright 보조 스크립트만 남깁니다.

전제:

- Chrome이 `--remote-debugging-port=9222` 로 실행 중이어야 함
- 프로젝트 루트에서 실행할 것
- `playwright` 패키지가 설치돼 있어야 함

예시:

```bash
node output/browser-automation/cdp-pages.mjs
node output/browser-automation/open-url.mjs 'https://www.wanted.co.kr/cv/matchup'
node output/browser-automation/list-fillable-by-index.mjs 8
node output/browser-automation/saramin-edit-link.mjs
node output/browser-automation/jobkorea-career-inputs.mjs
```

이번에 검증된 용도:

- 디버깅 크롬 CDP 연결
- 열린 탭 목록 확인
- 새 URL 열기
- 특정 탭의 입력 가능한 필드/폼 구조 추출
- 사람인 이력서 편집 링크 추출
- 잡코리아 경력 필드 구조 추출

주의:

- 포털 저장 스크립트는 아직 최종 검증 전이라 여기에는 넣지 않았습니다.
