import { chromium } from 'playwright';

async function run() {
  const context = await chromium.launchPersistentContext('/home/junho/.config/career-ops-chrome', {
    headless: false,
    channel: 'chrome'
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.wanted.co.kr/wd/388097');
  await page.waitForTimeout(3000);

  // Check all text in the apply modal
  console.log("Page title:", await page.title());
  
  // Find checkboxes or radio buttons
  const inputs = await page.$$eval('input', els => els.map(e => ({
    type: e.type,
    name: e.name,
    checked: e.checked,
    id: e.id,
    value: e.value
  })));
  console.log("All inputs in modal:", inputs);

  // Check labels or text around resumes
  const resumeItems = await page.$$eval('[class*="Resume"], [class*="resume"], li', els => 
    els.map(e => e.innerText.trim()).filter(t => t.includes('이력서') || t.includes('박준호')).slice(0, 5)
  );
  console.log("Resume elements found:", resumeItems);

  await context.close();
}
run();
