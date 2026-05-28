import { getDefaultContext } from './_cdp.mjs';

async function main() {
  const url = process.argv[2];
  if (!url) {
    throw new Error('Usage: node open-url.mjs <url>');
  }

  const { browser, context } = await getDefaultContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log(JSON.stringify({
    title: await page.title(),
    url: page.url(),
  }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
