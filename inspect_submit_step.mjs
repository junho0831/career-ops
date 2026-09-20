import { chromium } from 'playwright';

async function run() {
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Take screenshot to see current state
  await page.screenshot({ path: '/tmp/submit_screen.png' });
  console.log("Screenshot saved to /tmp/submit_screen.png");

  // Check what is visible in the apply dialog
  const dialog = page.locator('dialog, [role="dialog"], [class*="Modal"], [class*="apply"]');
  console.log("Dialog count:", await dialog.count());
  if (await dialog.count() > 0) {
    console.log("Dialog text:", (await dialog.first().innerText()).slice(0, 300));
  }

  await context.close();
}
run();
