import { chromium } from 'playwright';

async function run() {
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  const buttons = await page.$$eval('button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log("All buttons on page 388097:", buttons);
  await context.close();
}
run();
