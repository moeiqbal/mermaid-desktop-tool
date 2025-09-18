import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Core Functionality', () => {
  test('application loads successfully and NotificationSystem error is fixed', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the page loads without the black screen issue
    await expect(page.locator('h1')).toContainText('Mermaid & YANG Visualizer');

    // Check that there are no JavaScript errors related to NotificationSystem
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Wait for any delayed JavaScript to execute
    await page.waitForTimeout(3000);

    // Filter out expected errors (like favicon 404)
    const notificationErrors = logs.filter(log =>
      log.includes('NotificationSystem') ||
      log.includes('ReferenceError: NotificationSystem is not defined')
    );

    // Verify the NotificationSystem error is fixed
    expect(notificationErrors).toEqual([]);

    // Verify the page content is visible (not a black screen)
    const headerVisible = await page.locator('header').isVisible();
    const mainContentVisible = await page.locator('main, [role="main"]').isVisible();

    expect(headerVisible).toBe(true);
    expect(mainContentVisible).toBe(true);

    // Verify navigation works
    await expect(page.locator('button', { hasText: 'Mermaid Viewer' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'YANG Explorer' })).toBeVisible();

    // Test view switching
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(500);

    await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
    await page.waitForTimeout(500);

    // Verify no additional errors occurred during navigation
    await page.waitForTimeout(1000);
    const finalNotificationErrors = logs.filter(log =>
      log.includes('NotificationSystem') ||
      log.includes('ReferenceError: NotificationSystem is not defined')
    );
    expect(finalNotificationErrors).toEqual([]);
  });

  test('backend health endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBe(true);

    const healthData = await response.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData.status).toBe('healthy');
  });

  test('basic UI elements are functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test that buttons are clickable and don't cause errors
    const mermaidButton = page.locator('button', { hasText: 'Mermaid Viewer' });
    const yangButton = page.locator('button', { hasText: 'YANG Explorer' });

    await expect(mermaidButton).toBeEnabled();
    await expect(yangButton).toBeEnabled();

    // Click without errors
    await yangButton.click();
    await page.waitForTimeout(200);
    await mermaidButton.click();
    await page.waitForTimeout(200);

    // Verify the page is still functional
    await expect(page.locator('h1')).toContainText('Mermaid & YANG Visualizer');
  });
});