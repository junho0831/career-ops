import { getDefaultContext } from './_cdp.mjs';

async function main() {
  const { browser, context } = await getDefaultContext();
  const pages = context.pages();
  const out = [];

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    out.push({
      index: i,
      title: await page.title().catch(() => ''),
      url: page.url(),
    });
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
