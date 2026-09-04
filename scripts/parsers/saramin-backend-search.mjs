#!/usr/bin/env node

const SEARCH_URLS = [
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=%EB%B0%B1%EC%97%94%EB%93%9C%20Java%20Spring&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=Java%20Backend%20Engineer&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=Kotlin%20Spring%20%EB%B0%B1%EC%97%94%EB%93%9C&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=Data%20Engineer%20Airflow&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EC%97%94%EC%A7%80%EB%8B%88%EC%96%B4%20Airflow&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
  'https://www.saramin.co.kr/zf_user/search/recruit?searchword=Python%20Airflow%20Batch&search_optional_item=n&search_done=y&searchType=search&recruitPage=1&recruitSort=reg_dt&recruitPageCount=40',
];

const FETCH_TIMEOUT_MS = 15000;
const MAX_MATCHES = 50;
const POSITIVE_KEYWORDS = [
  'backend',
  'back-end',
  'back end',
  'server',
  'api',
  'platform',
  'java',
  'kotlin',
  'spring',
  'data engineer',
  'data platform',
  'data pipeline',
  'etl',
  'elt',
  'batch',
  'airflow',
  'ingestion',
  '백엔드',
  '백앤드',
  '서버',
  '데이터 엔지니어',
  '데이터 플랫폼',
  '데이터 파이프라인',
  '배치',
];
const NEGATIVE_KEYWORDS = [
  'frontend',
  'front-end',
  'front end',
  '프론트',
  '퍼블리셔',
  '디자이너',
  'ios',
  'android',
  'flutter',
  'full stack',
  'full-stack',
  '풀스택',
  'lead',
  '리드',
  '팀장',
  '프리랜서',
  'contract',
  '계약직',
  'intern',
  '인턴',
  'data scientist',
  'data analyst',
  'analytics engineer',
  'analytics',
  'analyst',
  'business intelligence',
  'bi analyst',
  'bi engineer',
  'bi data engineer',
  'machine learning',
  'ml engineer',
  'mlops',
  'sre',
  'site reliability',
  'architect',
  'databricks',
  'junior',
  '분석가',
  '데이터 분석',
  '리서치',
  '신입',
  '주니어',
  '시니어',
  '아키텍트',
];

function withTimeout(promiseFactory, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return promiseFactory(controller.signal).finally(() => clearTimeout(timer));
}

async function fetchText(url) {
  const response = await withTimeout(
    (signal) =>
      fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
        signal,
      }),
    FETCH_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return await response.text();
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function stripTags(value) {
  return decodeHtml(String(value || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function isBackendLike(title) {
  const normalized = String(title || '').toLowerCase();
  return (
    POSITIVE_KEYWORDS.some((keyword) => normalized.includes(keyword)) &&
    !NEGATIVE_KEYWORDS.some((keyword) => normalized.includes(keyword))
  );
}

function parseJobs(html) {
  const jobs = [];
  const cardRegex =
    /<div class="area_job">[\s\S]*?<h2 class="job_tit">\s*<a[^>]*title="([^"]+)"[^>]*href="([^"]+)"[\s\S]*?<div class="job_condition">([\s\S]*?)<\/div>[\s\S]*?<strong class="corp_name">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/strong>/g;

  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const [, rawTitle, rawHref, rawCondition, rawCompany] = match;
    const title = decodeHtml(rawTitle).replace(/\s+/g, ' ').trim();
    if (!isBackendLike(title)) continue;

    const url = new URL(decodeHtml(rawHref), 'https://www.saramin.co.kr');
    const spans = [...rawCondition.matchAll(/<span>([\s\S]*?)<\/span>/g)].map((entry) => stripTags(entry[1]));
    const location = spans[0] || '';
    const company = stripTags(rawCompany);

    jobs.push({ title, url: url.href, company, location });
  }

  return jobs;
}

async function main() {
  const seen = new Set();
  const results = [];

  for (const url of SEARCH_URLS) {
    try {
      const html = await fetchText(url);
      for (const job of parseJobs(html)) {
        const recIdx = new URL(job.url).searchParams.get('rec_idx') || job.url;
        if (seen.has(recIdx)) continue;
        seen.add(recIdx);
        results.push(job);
        if (results.length >= MAX_MATCHES) break;
      }
      if (results.length >= MAX_MATCHES) break;
    } catch (error) {
      console.error(`saramin parser warning: ${url} — ${error.message}`);
    }
  }

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`saramin parser failed: ${error.message}`);
  process.exit(1);
});
