#!/usr/bin/env node

const SITEMAP_INDEX_URL = 'https://zighang.com/seo/sitemap/sitemap-index.xml';
const MAX_SITEMAPS = 12;
const MAX_URLS = 300;
const MAX_MATCHES = 30;
const FETCH_TIMEOUT_MS = 15000;
const POSITIVE_KEYWORDS = [
  'backend',
  'back-end',
  'back end',
  '백엔드',
  'server',
  '서버 개발',
  'java',
  'spring',
  'spring boot',
  'kotlin',
  'python',
  'data engineer',
  'data platform',
  'data pipeline',
  '데이터 엔지니어',
  '데이터 플랫폼',
  '데이터 파이프라인',
  'etl',
  'elt',
  'airflow',
  'mes 개발',
  '스마트팩토리 개발',
  '스마트제조 개발',
  '공정 데이터',
  '설비 데이터',
  '로봇 sw',
  '로봇 제어',
];

const NEGATIVE_KEYWORDS = [
  '디자이너',
  '퍼블리싱',
  '유지보전',
  '사무원',
  '물류사무',
  '생산직',
  '조작원',
  '보온재',
  '우레탄',
  '공무',
  '전기공사',
  '현장직',
  '홀 서버',
  '레스토랑',
  '웨딩홀',
  '홀서빙',
  '조리',
  '주방',
  '간호',
  '의사',
  '단순노무',
  '프론트엔드',
  'frontend',
];

function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {
    controller,
    promise: promise(controller.signal).finally(() => clearTimeout(timer)),
  };
}

async function fetchText(url) {
  const { promise } = withTimeout(
    (signal) =>
      fetch(url, {
        headers: { 'user-agent': 'career-ops/zighang-parser' },
        redirect: 'follow',
        signal,
      }),
    FETCH_TIMEOUT_MS,
  );
  const res = await promise;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractAll(regex, text) {
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}

function parseSitemapIndex(xml) {
  return extractAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/sitemap>/g, xml)
    .map(([, loc, lastmod]) => ({ loc, lastmod }))
    .filter((item) => item.loc.includes('sitemap-recruitment-') && item.lastmod.startsWith('2026-'))
    .sort((a, b) => String(b.lastmod).localeCompare(String(a.lastmod)))
    .slice(0, MAX_SITEMAPS);
}

function parseRecruitmentSitemap(xml) {
  return extractAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g, xml).map(
    ([, loc, lastmod]) => ({ loc, lastmod }),
  );
}

function parseRecruitmentPage(html, url) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const titleText = decodeHtml(titleMatch?.[1] || '').trim();
  if (!titleText) return null;

  const normalizedTitle = titleText.replace(/\s*\|\s*[^|]+$/, '').trim();
  const companyMatch = normalizedTitle.match(/^\[(.+?)\]\s*(.+)$/);
  const company = companyMatch ? companyMatch[1].trim() : '직행';
  const role = companyMatch ? companyMatch[2].trim() : normalizedTitle;

  const regionMatch = html.match(/"addressRegion":"([^"]+)"/);
  const location = regionMatch ? decodeHtml(regionMatch[1]) : '';

  return {
    title: role,
    url,
    company,
    location,
  };
}

function isBackendLike(title) {
  const normalized = String(title).toLowerCase();
  if (NEGATIVE_KEYWORDS.some((neg) => normalized.includes(neg))) return false;
  return POSITIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

async function main() {
  const indexXml = await fetchText(SITEMAP_INDEX_URL);
  const recentSitemaps = parseSitemapIndex(indexXml);

  const allEntries = [];
  for (const sitemap of recentSitemaps) {
    const sitemapXml = await fetchText(sitemap.loc);
    allEntries.push(...parseRecruitmentSitemap(sitemapXml));
  }

  const uniqueUrls = [...new Set(allEntries.map((entry) => entry.loc))].slice(0, MAX_URLS);
  const jobs = [];
  const CONCURRENCY = 15;

  for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY) {
    if (jobs.length >= MAX_MATCHES) break;
    const batch = uniqueUrls.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const html = await fetchText(url);
        return parseRecruitmentPage(html, url);
      })
    );

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value?.title && isBackendLike(res.value.title)) {
        jobs.push(res.value);
        if (jobs.length >= MAX_MATCHES) break;
      }
    }
  }

  process.stdout.write(`${JSON.stringify(jobs, null, 2)}\n`);
}

main().catch((err) => {
  console.error(`zighang parser failed: ${err.message}`);
  process.exit(1);
});
