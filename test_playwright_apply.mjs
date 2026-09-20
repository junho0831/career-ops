import { chromium } from 'playwright';

async function run() {
  console.log("Opening saved session in Playwright...");
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized']
  });

  const page = context.pages()[0] || await context.newPage();
  
  // Listen to all network requests to catch the exact API when apply button is clicked!
  page.on('request', req => {
    if (req.url().includes('/api/') && (req.method() === 'POST' || req.method() === 'GET')) {
      if (req.url().includes('apply') || req.url().includes('application') || req.url().includes('jobs')) {
        console.log(`[NET REQ] ${req.method()} ${req.url()}`);
        if (req.postData()) {
          console.log(`  POST DATA: ${req.postData().slice(0, 300)}`);
        }
      }
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/') && (res.url().includes('apply') || res.url().includes('application'))) {
      console.log(`[NET RES] ${res.status()} ${res.url()}`);
    }
  });

  // Navigate to position 388097
  console.log("Navigating to position 388097...");
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Click 지원하기 button directly using Playwright's native locator!
  console.log("Locating '지원하기' button...");
  const applyBtn = page.getByRole('button', { name: '지원하기' }).first();
  if (await applyBtn.isVisible()) {
    console.log("Apply button is visible! Clicking now...");
    await applyBtn.click();
    await page.waitForTimeout(3000);
    console.log("Modal opened! Current URL:", page.url());
    
    // Check if resume or submit modal appeared
    const submitBtn = page.getByRole('button', { name: '제출하기' }).or(page.getByRole('button', { name: '작성 완료' })).first();
    const isSubmitVisible = await submitBtn.isVisible().catch(() => false);
    console.log("Is submit button visible in modal?", isSubmitVisible);
  } else {
    console.log("Apply button not found or already applied!");
  }

  await page.waitForTimeout(4000);
  await context.close();
}
run().catch(err => console.error(err));
