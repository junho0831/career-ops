#!/usr/bin/env node

const WANTED_API_URLS = [
  'https://www.wanted.co.kr/api/v4/jobs?country=kr&tag_type_ids=872&job_sort=job.latest_order&limit=50',
  'https://www.wanted.co.kr/api/v4/jobs?country=kr&job_sort=job.latest_order&limit=50',
  'https://www.wanted.co.kr/api/v4/jobs?country=kr&job_sort=job.latest_order&limit=50&offset=50',
  'https://www.wanted.co.kr/api/v4/jobs?country=kr&job_sort=job.latest_order&limit=50&offset=100',
];

const FETCH_TIMEOUT_MS = 15000;
const MAX_MATCHES = 50;

const POSITIVE_KEYWORDS = [
  'backend', 'back-end', 'server', 'api', 'platform', 'java', 'kotlin', 'spring',
  'data engineer', 'data platform', 'data pipeline', 'etl', 'elt', 'batch', 'airflow', 'ingestion',
  '백엔드', '서버', '데이터 엔지니어', '데이터 플랫폼', '데이터 파이프라인', '배치'
];

const NEGATIVE_KEYWORDS = [
  'frontend', 'front-end', 'ios', 'android', 'flutter', 'lead', '리드', '팀장', '인턴', 'intern',
  'data scientist', 'data analyst', 'analytics', 'analyst', 'business intelligence', 'bi analyst',
  'bi engineer', 'bi data engineer', 'ml engineer', 'machine learning', 'mlops', 'sre', 'site reliability',
  'architect', 'databricks', 'junior', '신입', '주니어', '시니어', '아키텍트', '분석가', '데이터 분석', '리서치'
];

function isBackendLike(title) {
  const normalized = String(title || '').toLowerCase();
  return (
    POSITIVE_KEYWORDS.some((k) => normalized.includes(k)) &&
    !NEGATIVE_KEYWORDS.some((k) => normalized.includes(k))
  );
}

async function main() {
  const seen = new Set();
  const results = [];

  for (const apiUrl of WANTED_API_URLS) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'accept': 'application/json',
        },
      });
      if (!response.ok) continue;
      const data = await response.json();
      const items = data.data || [];

      for (const item of items) {
        if (!item || item.status !== 'active') continue;
        const title = item.position || '';
        if (!isBackendLike(title)) continue;

        const jobId = item.id;
        if (seen.has(jobId)) continue;
        seen.add(jobId);

        const company = item.company?.name || '원티드 등록기업';
        const location = item.address?.location || '서울';
        const url = `https://www.wanted.co.kr/wd/${jobId}`;

        results.push({ title, url, company, location });
        if (results.length >= MAX_MATCHES) break;
      }
    } catch (error) {
      console.error(`wanted parser warning: ${error.message}`);
    }
  }

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`wanted parser failed: ${error.message}`);
  process.exit(1);
});
