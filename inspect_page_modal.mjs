import { chromium } from 'playwright';

async function run() {
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Check if apply button or submit button exists
  const applyBtn = page.getByRole('button', { name: '지원하기' }).first();
  console.log("Is applyBtn visible?", await applyBtn.isVisible().catch(() => false));
  
  const submitBtn = page.getByRole('button', { name: '제출하기' }).first();
  console.log("Is submitBtn visible?", await submitBtn.isVisible().catch(() => false));

  // Screenshot page
  await page.screenshot({ path: '/tmp/current_modal.png' });
  console.log("Saved /tmp/current_modal.png");

  await context.close();
}
run();
