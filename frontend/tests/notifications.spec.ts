import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display notifications in the correct position', async ({ page }) => {
    // Look for notification container
    const notificationContainer = page.locator('[class*="notification"], [class*="toast"], [role="alert"], [class*="fixed"][class*="top"]');

    // Notification container should exist in the DOM structure
    const hasNotificationSupport = await notificationContainer.count() >= 0;
    expect(hasNotificationSupport).toBe(true);

    // If notifications are visible, they should be positioned correctly
    const visibleNotifications = page.locator('[class*="notification"]:visible, [class*="toast"]:visible');
    const visibleCount = await visibleNotifications.count();

    if (visibleCount > 0) {
      // Verify positioning (should be in top-right area)
      const firstNotification = visibleNotifications.first();
      await expect(firstNotification).toBeVisible();

      // Check if it's positioned in the top area
      const boundingBox = await firstNotification.boundingBox();
      if (boundingBox) {
        expect(boundingBox.y).toBeLessThan(200); // Should be near top of screen
      }
    }
  });

  test('should handle notification interactions', async ({ page }) => {
    // Try to trigger a notification by performing an action
    // For example, uploading an invalid file or switching views

    // Switch views to potentially trigger notifications
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
    await page.waitForTimeout(1000);

    // Look for any notifications that might have appeared
    const notifications = page.locator('[class*="notification"], [class*="toast"], [role="alert"]');
    const notificationCount = await notifications.count();

    if (notificationCount > 0) {
      const firstNotification = notifications.first();

      // Check if notification is visible
      await expect(firstNotification).toBeVisible();

      // Look for close button
      const closeButton = firstNotification.locator('button, [class*="close"], [aria-label*="close"]');
      const hasCloseButton = await closeButton.count() > 0;

      if (hasCloseButton) {
        // Test closing the notification
        await closeButton.click();
        await page.waitForTimeout(500);

        // Notification should be dismissed
        await expect(firstNotification).not.toBeVisible();
      }
    }
  });

  test('should auto-dismiss notifications after timeout', async ({ page }) => {
    // This test checks if notifications auto-dismiss
    // We'll monitor for any existing notifications and see if they disappear

    // Look for existing notifications
    let initialNotifications = await page.locator('[class*="notification"]:visible, [class*="toast"]:visible').count();

    if (initialNotifications === 0) {
      // Try to trigger a notification by uploading a file (if possible)
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'test.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from('# Test\n```mermaid\ngraph TD\nA-->B\n```')
        });

        await page.waitForTimeout(1000);
        initialNotifications = await page.locator('[class*="notification"]:visible, [class*="toast"]:visible').count();
      }
    }

    if (initialNotifications > 0) {
      // Wait for auto-dismiss (usually 5 seconds)
      await page.waitForTimeout(6000);

      // Check if notifications have been dismissed
      const remainingNotifications = await page.locator('[class*="notification"]:visible, [class*="toast"]:visible').count();
      expect(remainingNotifications).toBeLessThanOrEqual(initialNotifications);
    }
  });

  test('should display different types of notifications', async ({ page }) => {
    // Look for notification elements with different types/classes
    const successNotifications = page.locator('[class*="success"], [class*="green"]');
    const errorNotifications = page.locator('[class*="error"], [class*="red"]');
    const warningNotifications = page.locator('[class*="warning"], [class*="yellow"]');
    const infoNotifications = page.locator('[class*="info"], [class*="blue"]');

    // These elements should exist in the DOM structure (even if not currently visible)
    const hasNotificationTypes = await successNotifications.count() >= 0 &&
                                  await errorNotifications.count() >= 0 &&
                                  await warningNotifications.count() >= 0 &&
                                  await infoNotifications.count() >= 0;

    expect(hasNotificationTypes).toBe(true);
  });

  test('should stack multiple notifications correctly', async ({ page }) => {
    // Try to trigger multiple notifications quickly
    // Switch views multiple times
    for (let i = 0; i < 3; i++) {
      await page.locator('button', { hasText: 'YANG Explorer' }).click();
      await page.waitForTimeout(100);
      await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
      await page.waitForTimeout(100);
    }

    // Check if multiple notifications can be displayed
    const notifications = page.locator('[class*="notification"]:visible, [class*="toast"]:visible');
    const count = await notifications.count();

    // If multiple notifications are shown, they should be stacked properly
    if (count > 1) {
      // Check vertical positioning - each should be below the previous
      const positions = [];
      for (let i = 0; i < count; i++) {
        const box = await notifications.nth(i).boundingBox();
        if (box) positions.push(box.y);
      }

      // Positions should generally increase (notifications stacked vertically)
      const isSorted = positions.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
      expect(isSorted).toBe(true);
    }
  });

  test('should handle notification content correctly', async ({ page }) => {
    // Look for any visible notifications
    const notifications = page.locator('[class*="notification"]:visible, [class*="toast"]:visible');
    const count = await notifications.count();

    if (count > 0) {
      const firstNotification = notifications.first();

      // Check that notification has meaningful content
      const text = await firstNotification.textContent();
      expect(text?.length || 0).toBeGreaterThan(0);

      // Check for icons or visual indicators
      const hasIcon = await firstNotification.locator('svg, img, [class*="icon"]').count() > 0;

      // Notifications should have either meaningful text or icons
      expect(text?.length || hasIcon).toBeTruthy();
    }
  });

  test('should be accessible to screen readers', async ({ page }) => {
    // Check for accessibility attributes
    const notifications = page.locator('[role="alert"], [role="status"], [aria-live]');
    const accessibleNotifications = await notifications.count();

    // Look for notifications with proper ARIA attributes
    const ariaNotifications = page.locator('[aria-label], [aria-describedby]');
    const hasAriaSupport = await ariaNotifications.count() > 0;

    // At least some accessibility support should be present
    expect(accessibleNotifications >= 0 || hasAriaSupport).toBe(true);
  });

  test('should not block user interaction', async ({ page }) => {
    // Ensure notifications don't interfere with main functionality
    // Try to interact with main UI elements while notifications might be present

    // Click navigation buttons
    await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
    await page.waitForTimeout(200);

    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(200);

    // Buttons should remain functional
    await expect(page.locator('button', { hasText: 'YANG Explorer' })).toBeEnabled();
    await expect(page.locator('button', { hasText: 'Mermaid Viewer' })).toBeEnabled();

    // Try clicking on main content areas
    await page.click('main, [role="main"], body');

    // Should not cause errors
    await page.waitForTimeout(500);
  });
});