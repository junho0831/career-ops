import { chromium } from 'playwright';

async function run() {
  console.log("Launching persistent chromium context with profile...");
  const context = await chromium.launchPersistentContext('/tmp/chrome_debug_profile', {
    headless: false,
    channel: 'chrome',
    args: ['--remote-debugging-port=9222']
  });

  console.log("Context launched successfully!");
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/status/applications');
  await page.waitForTimeout(3000);
  console.log("Current page title:", await page.title());
  console.log("Current page URL:", page.url());

  // Check login state
  const bodyText = await page.innerText('body');
  const isLoggedIn = bodyText.includes('MY 원티드') || bodyText.includes('지원 현황');
  console.log("Is logged in on Wanted:", isLoggedIn);

  // Keep open for testing
  await page.waitForTimeout(5000);
  await context.close();
}
run().catch(err => console.error("Playwright launch error:", err));
