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
  'server',
  '백엔드',
  '서버',
  'java',
  'kotlin',
  'spring',
  'spring boot',
  'api',
  'platform',
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
    .filter((item) => item.loc.includes('sitemap-recruitment-'))
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

  for (const url of uniqueUrls) {
    try {
      const html = await fetchText(url);
      const job = parseRecruitmentPage(html, url);
      if (job?.title && isBackendLike(job.title)) {
        jobs.push(job);
        if (jobs.length >= MAX_MATCHES) break;
      }
    } catch (err) {
      console.error(`zighang parser warning: ${url} — ${err.message}`);
    }
  }

  process.stdout.write(`${JSON.stringify(jobs, null, 2)}\n`);
}

main().catch((err) => {
  console.error(`zighang parser failed: ${err.message}`);
  process.exit(1);
});
