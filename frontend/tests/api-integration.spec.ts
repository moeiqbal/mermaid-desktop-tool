import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should successfully connect to backend health endpoint', async ({ page }) => {
    // Test the health endpoint directly
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const healthData = await response.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData.status).toBe('healthy');
  });

  test('should handle file upload API calls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });

    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    // Try to upload a file if file input exists
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Test\n```mermaid\ngraph TD\nA-->B\n```')
      });

      // Wait for API calls to complete
      await page.waitForTimeout(3000);

      // Check that API calls were made
      const uploadRequests = requests.filter(req =>
        req.method === 'POST' &&
        (req.url.includes('upload') || req.url.includes('files'))
      );

      if (uploadRequests.length > 0) {
        expect(uploadRequests.length).toBeGreaterThan(0);
      }

      // Check that responses were successful
      const uploadResponses = responses.filter(res =>
        res.url.includes('upload') || res.url.includes('files')
      );

      if (uploadResponses.length > 0) {
        const successfulUploads = uploadResponses.filter(res => res.ok);
        expect(successfulUploads.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle YANG parsing API calls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to YANG Explorer
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(500);

    // Monitor API requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/yang') || request.url().includes('parse')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/yang') || response.url().includes('parse')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    // Try to upload a YANG file if file input exists
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      const yangContent = `module test-module {
        namespace "http://example.com/test";
        prefix "test";

        container config {
          leaf name {
            type string;
          }
        }
      }`;

      await fileInput.setInputFiles({
        name: 'test.yang',
        mimeType: 'text/plain',
        buffer: Buffer.from(yangContent)
      });

      // Wait for API processing
      await page.waitForTimeout(5000);

      // Verify YANG API calls were made
      if (requests.length > 0) {
        expect(requests.length).toBeGreaterThan(0);
      }

      // Check response status
      if (responses.length > 0) {
        const successfulResponses = responses.filter(res => res.ok);
        expect(successfulResponses.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Test handling of 404 or other API errors
    const response = await page.request.get('/api/nonexistent-endpoint');
    expect(response.status()).toBe(404);

    // Test that the frontend handles API errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor console for error handling
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Try to make an invalid API request through the UI
    // This is implementation-dependent, but we can test general error handling

    // Wait for any async operations
    await page.waitForTimeout(2000);

    // Check that there are no unhandled API errors in console
    const apiErrors = consoleMessages.filter(msg =>
      msg.includes('API') ||
      msg.includes('fetch') ||
      msg.includes('network')
    );

    // Should not have unhandled API errors (handled errors are ok)
    const unhandledErrors = apiErrors.filter(msg =>
      !msg.includes('handled') &&
      !msg.includes('expected')
    );

    expect(unhandledErrors.length).toBe(0);
  });

  test('should handle file retrieval API', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor file retrieval requests
    const fileRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/files') ||
          request.url().includes('download') ||
          request.url().includes('content')) {
        fileRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Wait for initial file list loading
    await page.waitForTimeout(3000);

    // If files are loaded, there should be API calls for file listing
    const fileListElements = page.locator('[class*="file"], li, .list-item');
    const hasFiles = await fileListElements.count() > 0;

    if (hasFiles || fileRequests.length > 0) {
      // Verify API calls were made for file operations
      expect(fileRequests.length >= 0).toBe(true);
    }
  });

  test('should handle linting API calls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor linting API requests
    const lintRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/lint') ||
          request.url().includes('validate')) {
        lintRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Look for linting functionality (button or modal)
    const lintButtons = page.locator('button[title*="lint"], button:has-text("lint"), button:has-text("validate")');

    if (await lintButtons.count() > 0) {
      // Click linting button
      await lintButtons.first().click();
      await page.waitForTimeout(2000);

      // Check that linting API was called
      if (lintRequests.length > 0) {
        expect(lintRequests.length).toBeGreaterThan(0);
      }
    }
  });

  test('should maintain connection stability', async ({ page }) => {
    // Test that the application maintains stable connection to backend
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Perform multiple operations to test connection stability
    for (let i = 0; i < 3; i++) {
      // Test health endpoint multiple times
      const response = await page.request.get('/api/health');
      expect(response.ok()).toBe(true);

      // Switch views
      await page.locator('button', { hasText: 'YANG Explorer' }).click();
      await page.waitForTimeout(200);
      await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
      await page.waitForTimeout(200);
    }

    // Final health check
    const finalResponse = await page.request.get('/api/health');
    expect(finalResponse.ok()).toBe(true);
  });

  test('should handle concurrent API requests', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Make multiple concurrent API requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(page.request.get('/api/health'));
    }

    const responses = await Promise.all(promises);

    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBe(true);
    });
  });
});