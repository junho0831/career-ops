import { chromium } from 'playwright';

async function run() {
  console.log("Opening 388097, selecting default resume, and clicking submit...");
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Click default resume item to select it
  const defaultResume = page.locator('li', { hasText: '데이터 정합성·배치 성능 개선' }).first();
  console.log("Default resume exists:", await defaultResume.isVisible());
  if (await defaultResume.isVisible()) {
    await defaultResume.click();
    await page.waitForTimeout(1000);
  }

  // Check if submit button is enabled
  const submitBtn = page.getByRole('button', { name: '제출하기' }).first();
  const isDisabled = await submitBtn.getAttribute('disabled');
  console.log("Submit button disabled attribute after selection:", isDisabled);

  if (isDisabled === null) {
    console.log("Submit button is ENABLED! Clicking submit...");
    await submitBtn.click();
    await page.waitForTimeout(3000);
    console.log("SUBMIT CLICKED! Current URL:", page.url());
  }

  await page.waitForTimeout(2000);
  await context.close();
}
run();
