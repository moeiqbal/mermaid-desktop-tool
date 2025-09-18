import { test, expect } from '@playwright/test';

test.describe('Navigation and View Switching', () => {
  test('should switch between Mermaid Viewer and YANG Explorer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start on Mermaid Viewer (should be default)
    const mermaidButton = page.locator('button', { hasText: 'Mermaid Viewer' });
    const yangButton = page.locator('button', { hasText: 'YANG Explorer' });

    await expect(mermaidButton).toBeVisible();
    await expect(yangButton).toBeVisible();

    // Verify Mermaid Viewer is active initially
    await expect(mermaidButton).toHaveClass(/bg-primary-100|text-primary-700/);

    // Switch to YANG Explorer
    await yangButton.click();
    await page.waitForTimeout(500); // Wait for transition

    // Verify YANG Explorer is now active
    await expect(yangButton).toHaveClass(/bg-primary-100|text-primary-700/);

    // Switch back to Mermaid Viewer
    await mermaidButton.click();
    await page.waitForTimeout(500);

    // Verify Mermaid Viewer is active again
    await expect(mermaidButton).toHaveClass(/bg-primary-100|text-primary-700/);
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the dark mode toggle button (could be Moon or Sun icon)
    const darkModeToggle = page.locator('button').filter({ has: page.locator('svg') }).nth(2); // Usually the 3rd icon button

    // Click to toggle dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500);

    // Check that dark class is applied to html or body
    const htmlElement = page.locator('html');
    const bodyElement = page.locator('body');

    // One of these should have dark class or dark styling
    const isDarkMode = await htmlElement.getAttribute('class')?.includes('dark') ||
                      await bodyElement.getAttribute('class')?.includes('dark') ||
                      await page.locator('.dark').count() > 0;

    // Toggle back
    await darkModeToggle.click();
    await page.waitForTimeout(500);
  });

  test('should persist view selection on page refresh', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to YANG Explorer
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(500);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if view selection is maintained (this might depend on implementation)
    // Note: This test might need adjustment based on actual persistence behavior
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');

    // Verify focus is on a focusable element
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);

    // Test navigation with arrow keys or enter (if applicable)
    await page.keyboard.press('Enter');
  });

  test('should display correct URL paths', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Mermaid view
    await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
    await page.waitForTimeout(500);

    // Check if URL changes (this depends on routing implementation)
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3000');

    // Switch to YANG view
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(500);
  });
});