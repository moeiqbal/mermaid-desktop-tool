const { chromium } = require('playwright');

async function testNotificationSystemFix() {
  console.log('Testing NotificationSystem fix...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Monitor console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('Console error:', msg.text());
    }
  });

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    console.log('Page loaded successfully');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    console.log('Network idle reached');

    // Check for the specific NotificationSystem error
    const notificationErrors = errors.filter(error =>
      error.includes('NotificationSystem') ||
      error.includes('ReferenceError: NotificationSystem is not defined')
    );

    if (notificationErrors.length === 0) {
      console.log('✅ SUCCESS: No NotificationSystem errors found!');
    } else {
      console.log('❌ FAILED: NotificationSystem errors still present:');
      notificationErrors.forEach(error => console.log('  -', error));
    }

    // Check if page content is visible (not black screen)
    const title = await page.title();
    console.log('Page title:', title);

    const headerVisible = await page.locator('header').isVisible();
    const mainVisible = await page.locator('main').isVisible();

    console.log('Header visible:', headerVisible);
    console.log('Main content visible:', mainVisible);

    if (headerVisible && mainVisible && title.includes('Mermaid')) {
      console.log('✅ SUCCESS: Page is displaying correctly (no black screen)');
    } else {
      console.log('❌ FAILED: Page may have display issues');
    }

    // Test navigation
    try {
      await page.locator('button', { hasText: 'YANG Explorer' }).click();
      console.log('✅ Navigation to YANG Explorer works');

      await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
      console.log('✅ Navigation to Mermaid Viewer works');
    } catch (error) {
      console.log('⚠️  Navigation test failed:', error.message);
    }

    // Final error check
    await page.waitForTimeout(2000);
    const finalNotificationErrors = errors.filter(error =>
      error.includes('NotificationSystem') ||
      error.includes('ReferenceError: NotificationSystem is not defined')
    );

    if (finalNotificationErrors.length === 0) {
      console.log('✅ FINAL RESULT: NotificationSystem error is FIXED!');
    } else {
      console.log('❌ FINAL RESULT: NotificationSystem error is NOT fixed');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

testNotificationSystemFix();