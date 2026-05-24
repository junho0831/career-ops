import { getDefaultContext } from './_cdp.mjs';

async function main() {
  const { browser, context } = await getDefaultContext();
  const page = context.pages().find((item) => item.url().includes('jobkorea.co.kr/User/Resume/Edit'));
  if (!page) {
    throw new Error('JobKorea resume edit page not found');
  }

  const fields = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input, textarea, select'))
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        id: el.id || '',
        name: el.getAttribute('name') || '',
        value: 'value' in el ? String(el.value || '') : '',
        checked: 'checked' in el ? el.checked : undefined,
      }))
      .filter((item) => item.name.includes('Career[c15]') || item.id.includes('Career_'))
  );

  console.log(JSON.stringify(fields, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
