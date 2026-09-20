#!/usr/bin/env node

/**
 * zighang-direct-search.mjs
 * 
 * Direct API Search for Zighang (직행, zighang.com)
 * Uses high-performance https://api.zighang.com/api/recruitments/v4 REST endpoint
 * Filters for Smart Factory, MES, Manufacturing Data, and Industrial Backend roles
 */

const API_BASE_URL = 'https://api.zighang.com/api/recruitments/v4';
const DEFAULT_KEYWORDS = ['스마트팩토리', 'MES 개발', '공정 데이터', '설비 데이터', '제조 백엔드', '로봇 제어'];

const NEGATIVE_KEYWORDS = [
  '디자이너', '퍼블리셔', '유지보전', '사무원', '물류사무', '생산직', '조작원',
  '보온재', '우레탄', '공무', '전기공사', '현장직', '홀 서버', '레스토랑',
  '웨딩홀', '홀서빙', '조리', '주방', '간호', '의사', '단순노무', '단순조립'
];

async function fetchZighangKeyword(keyword, page = 0, size = 20) {
  const url = `${API_BASE_URL}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'career-ops/zighang-direct'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data?.content || [];
  } catch (err) {
    console.error(`Error fetching Zighang keyword "${keyword}":`, err.message);
    return [];
  }
}

async function fetchZighangDetail(id) {
  try {
    const res = await fetch(`https://api.zighang.com/api/recruitments/${id}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'career-ops/zighang-direct'
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const keywordArg = args.find(a => a.startsWith('--keyword='))?.split('=')[1];
  const maxArg = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '20', 10);
  const detailArg = args.includes('--detail');

  const targetKeywords = keywordArg ? [keywordArg] : DEFAULT_KEYWORDS;
  const seenIds = new Set();
  const matchedJobs = [];

  for (const kw of targetKeywords) {
    if (matchedJobs.length >= maxArg) break;
    const items = await fetchZighangKeyword(kw, 0, 30);
    for (const item of items) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const title = item.title || '';
      const isNegative = NEGATIVE_KEYWORDS.some(neg => title.includes(neg));
      if (isNegative) continue;

      let redirectUrl = null;
      let applyMethod = null;
      if (detailArg) {
        const detail = await fetchZighangDetail(item.id);
        if (detail) {
          redirectUrl = detail.redirectUrl;
          applyMethod = detail.applyMethod;
        }
      }

      matchedJobs.push({
        id: item.id,
        company: item.company?.name || '미확인',
        title: item.title,
        affiliate: item.affiliate,
        regions: item.regions || [],
        endDate: item.endDate,
        careerMin: item.careerMin,
        careerMax: item.careerMax,
        url: `https://zighang.com/recruitment/${item.id}`,
        redirectUrl,
        applyMethod
      });

      if (matchedJobs.length >= maxArg) break;
    }
  }

  process.stdout.write(JSON.stringify(matchedJobs, null, 2) + '\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
