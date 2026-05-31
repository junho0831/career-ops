// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Naver Cafe Workhub board-list provider.
// Parses the public cafe-boardlist API used in portals.yml.

function resolveApiUrl(entry) {
  const url = entry.api || '';
  if (!url.includes('cafe-boardlist-api')) return null;
  return url;
}

function assertNaverCafeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`naver-cafe: invalid URL: ${url}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`naver-cafe: URL must use HTTPS: ${url}`);
  if (parsed.hostname !== 'apis.naver.com') {
    throw new Error(`naver-cafe: untrusted hostname "${parsed.hostname}"`);
  }
  if (!parsed.pathname.includes('/cafe-boardlist-api/')) {
    throw new Error(`naver-cafe: unexpected API path: ${parsed.pathname}`);
  }
  return url;
}

/** @type {Provider} */
export default {
  id: 'naver-cafe',

  detect(entry) {
    const apiUrl = resolveApiUrl(entry);
    return apiUrl ? { url: apiUrl } : null;
  },

  async fetch(entry, ctx) {
    const apiUrl = resolveApiUrl(entry);
    if (!apiUrl) throw new Error(`naver-cafe: cannot derive API URL for ${entry.name}`);
    assertNaverCafeUrl(apiUrl);

    const json = await ctx.fetchJson(apiUrl, { redirect: 'error' });
    const rows = Array.isArray(json?.result?.articleList) ? json.result.articleList : [];

    return rows
      .filter(row => row?.type === 'ARTICLE' && row?.item?.articleId)
      .map(row => {
        const item = row.item;
        const cafeId = item.cafeId || '';
        const articleId = item.articleId || '';
        return {
          title: item.subject || '',
          url: `https://cafe.naver.com/f-e/cafes/${cafeId}/articles/${articleId}`,
          company: entry.name,
          location: item.headName || '',
        };
      });
  },
};
