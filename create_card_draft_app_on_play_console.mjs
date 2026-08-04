import { chromium } from 'playwright';

console.log("🔥 [Card Draft 바로 앱 생성 직행] 구글 플레이 콘솔에서 앱 만들기 버튼 클릭 및 메타데이터 폼 입력!");

(async () => {
    try {
        const context = await chromium.launchPersistentContext('/home/junho/.config/google-chrome', {
            executablePath: '/opt/google/chrome/chrome',
            headless: false,
            viewport: { width: 1400, height: 950 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await context.newPage();
        console.log("1️⃣ 구글 플레이 콘솔 메인 접속...");
        await page.goto('https://play.google.com/console/developers', { waitUntil: 'domcontentloaded' }).catch(e=>{});
        await page.waitForTimeout(3000);

        // 앱 만들기 버튼 클릭
        const createAppBtn = page.locator('button:has-text("앱 만들기"), button:has-text("Create app"), a:has-text("앱 만들기")').first();
        if (await createAppBtn.isVisible().catch(() => false)) {
            await createAppBtn.click({ force: true });
            console.log("   👉 [앱 만들기] 버튼 클릭 성공!");
            await page.waitForTimeout(2500);

            // 앱 이름 입력
            const appNameInput = page.locator('input[type="text"]').first();
            if (await appNameInput.isVisible().catch(() => false)) {
                await appNameInput.fill("Card Draft");
                console.log("   ✅ 앱 이름 'Card Draft' 입력 완료!");
            }

            // 약관 동의 체크박스 전체 클릭
            const checkboxes = page.locator('input[type="checkbox"]');
            const count = await checkboxes.count();
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).check({ force: true }).catch(() => {});
            }
            console.log(`   ✅ 필수 정책 동의 체크박스 ${count}개 체크 완료!`);

            // 최종 앱 만들기 버튼 클릭
            const finalCreate = page.locator('button:has-text("앱 만들기"), button:has-text("Create app")').last();
            if (await finalCreate.isVisible().catch(() => false)) {
                await finalCreate.click({ force: true });
                console.log("   🎉 구글 플레이 콘솔 [Card Draft] 앱 생성 100% 클릭 완료!");
                await page.waitForTimeout(3000);
            }
        } else {
            console.log("📌 플레이 콘솔 개발자 계정 선택/로그인 페이지 대기 중...");
        }

    } catch (e) {
        console.error("앱 생성 실행 에러:", e);
    }
})();
