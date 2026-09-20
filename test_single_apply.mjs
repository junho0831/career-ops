import { chromium } from 'playwright';

async function main() {
  console.log("Testing single live application on position 388097...");
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Look for submit button
  const submitBtn = page.getByRole('button', { name: '제출하기' }).first();
  if (await submitBtn.isVisible()) {
    console.log("Submit button found! Clicking '제출하기' now...");
    await submitBtn.click();
    await page.waitForTimeout(3000);
    console.log("Clicked! Checking URL or confirmation...");
    console.log("Current URL:", page.url());
  } else {
    console.log("Submit button not found directly, checking '지원하기'...");
    const applyBtn = page.getByRole('button', { name: '지원하기' }).first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(2000);
      const sub = page.getByRole('button', { name: '제출하기' }).first();
      if (await sub.isVisible()) {
        await sub.click();
        console.log("Clicked submit button after apply button!");
      }
    }
  }

  await page.waitForTimeout(3000);
  await context.close();
}
main();
