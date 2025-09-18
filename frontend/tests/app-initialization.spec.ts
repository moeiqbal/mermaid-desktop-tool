import { test, expect } from '@playwright/test';

test.describe('Application Initialization', () => {
  test('should load application without errors', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the application to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is set correctly
    await expect(page).toHaveTitle(/Mermaid/);

    // Verify the header is visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Mermaid & YANG Visualizer');

    // Verify navigation buttons are present
    await expect(page.locator('button', { hasText: 'Mermaid Viewer' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'YANG Explorer' })).toBeVisible();

    // Verify dark mode toggle is present
    await expect(page.locator('button[aria-label*="dark mode"], button:has-text("☾"), button:has-text("☽")').first()).toBeVisible();

    // Check that there are no JavaScript errors in console
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);

    // Verify no console errors (excluding favicon 404 which is expected)
    const actualErrors = logs.filter(log => !log.includes('favicon'));
    expect(actualErrors).toEqual([]);

    // Verify the page is not showing a black screen
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(50); // Should have substantial content
  });

  test('should display correct header information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check logo and title
    await expect(page.locator('img[alt="Moe Logo"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Mermaid & YANG Visualizer');
    await expect(page.locator('p', { hasText: 'Network Model Analysis Tool' })).toBeVisible();
  });

  test('should have proper responsive design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('header')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('header')).toBeVisible();
  });

  test('should handle page refresh gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify application still works
    await expect(page.locator('h1')).toContainText('Mermaid & YANG Visualizer');
    await expect(page.locator('button', { hasText: 'Mermaid Viewer' })).toBeVisible();
  });
});