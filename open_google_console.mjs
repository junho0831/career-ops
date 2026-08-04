import { chromium } from 'playwright';

console.log("🌐 [구글 서치 콘솔 페이지 접속] Google Search Console 페이지 진입 중...");

(async () => {
    try {
        const context = await chromium.launchPersistentContext('/home/junho/.config/google-chrome', {
            executablePath: '/opt/google/chrome/chrome',
            headless: false,
            viewport: { width: 1400, height: 950 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await context.newPage();
        console.log("1️⃣ 구글 서치 콘솔 접속 중...");
        await page.goto('https://search.google.com/search-console', { waitUntil: 'domcontentloaded' }).catch(e=>{});
        await page.waitForTimeout(3000);

        console.log("✅ 구글 서치 콘솔 페이지에 성공적으로 접속했습니다!");

    } catch (e) {
        console.error("구글 서치 콘솔 접속 에러:", e);
    }
})();
