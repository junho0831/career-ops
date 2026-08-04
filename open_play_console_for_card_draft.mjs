import { chromium } from 'playwright';

console.log("🌐 [구글 플레이 콘솔 접속] Card Draft 앱 등록을 위한 개발자 콘솔 오픈 중...");

(async () => {
    try {
        const context = await chromium.launchPersistentContext('/home/junho/.config/google-chrome', {
            executablePath: '/opt/google/chrome/chrome',
            headless: false,
            viewport: { width: 1400, height: 950 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await context.newPage();
        console.log("1️⃣ 구글 플레이 콘솔 접속 진행 중...");
        await page.goto('https://play.google.com/console', { waitUntil: 'domcontentloaded' }).catch(e=>{});
        await page.waitForTimeout(3000);

        console.log("✅ 구글 플레이 콘솔 접속 완료!");

    } catch (e) {
        console.error("구글 플레이 콘솔 오픈 에러:", e);
    }
})();
