import { getDefaultContext } from './_cdp.mjs';

async function main() {
  const { browser, context } = await getDefaultContext();
  const page = context.pages().find((item) => item.url().includes('saramin.co.kr/zf_user/resume/resume-manage'));
  if (!page) {
    throw new Error('Saramin resume manage page not found');
  }

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map((a) => ({
        text: (a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim(),
        href: a.href,
      }))
      .filter((item) => item.href.includes('/zf_user/member/resume/view/') || item.text.includes('수정하기'))
  );

  console.log(JSON.stringify(links, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
