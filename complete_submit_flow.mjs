import { chromium } from 'playwright';

async function run() {
  console.log("Opening 388097, selecting resume, clicking submit and any confirmation modal...");
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Click default resume
  const defaultResume = page.locator('li', { hasText: '데이터 정합성·배치 성능 개선' }).first();
  if (await defaultResume.isVisible()) {
    await defaultResume.click();
    await page.waitForTimeout(1000);
  }

  // Click submit button
  const submitBtn = page.getByRole('button', { name: '제출하기' }).first();
  await submitBtn.click();
  console.log("Clicked submit button!");
  await page.waitForTimeout(2000);

  // Check if a confirmation popup appeared (e.g. '지원하시겠습니까?' or '동의')
  const confirmBtns = await page.$$eval('button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log("Buttons after submit click:", confirmBtns);

  const finalConfirm = page.getByRole('button', { name: '확인' }).or(page.getByRole('button', { name: '지원하기' })).or(page.getByRole('button', { name: '동의하고 제출' })).first();
  if (await finalConfirm.isVisible().catch(() => false)) {
    console.log("Found confirmation button! Clicking...");
    await finalConfirm.click();
    await page.waitForTimeout(3000);
  }

  console.log("Final page URL:", page.url());
  await context.close();
}
run();
