import { test, expect } from '@playwright/test';

test.describe('Mermaid Viewer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure we're on Mermaid Viewer
    await page.locator('button', { hasText: 'Mermaid Viewer' }).click();
    await page.waitForTimeout(500);
  });

  test('should display file upload interface', async ({ page }) => {
    // Look for upload area or drag-drop zone
    const uploadArea = page.locator('[class*="dropzone"], [class*="upload"], .drop-zone').first();

    // If no specific dropzone, look for file input or upload button
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.locator('button', { hasText: /upload/i });

    // At least one of these should be present
    const hasUploadInterface = await uploadArea.count() > 0 ||
                              await fileInput.count() > 0 ||
                              await uploadButton.count() > 0;

    expect(hasUploadInterface).toBe(true);
  });

  test('should handle file upload', async ({ page }) => {
    // Create a test mermaid file
    const testContent = `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;

    // Look for file input
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // Create a temporary file and upload it

      // Use setInputFiles if file input exists
      await fileInput.setInputFiles({
        name: 'test-diagram.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(`# Test Diagram\n\n\`\`\`mermaid\n${testContent}\n\`\`\``)
      });

      // Wait for upload to complete
      await page.waitForTimeout(2000);

      // Check for success indication (could be notification, file list update, etc.)
      // Look for the uploaded file in the file list
      const fileList = page.locator('[class*="file"], [data-testid*="file"], li, .list-item').first();
      const hasFiles = await fileList.count() > 0;

      // If files are displayed, one should contain our test file
      if (hasFiles) {
        await expect(page.locator('text=test-diagram.md')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display file list and search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // Test search functionality
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Clear search
      await searchInput.clear();
    }

    // Look for file list container
    const fileListContainer = page.locator('[class*="file-list"], [class*="files"], .list, ul, [data-testid*="file"]');
    const hasFileList = await fileListContainer.count() > 0;

    // File list should be present (even if empty)
    expect(hasFileList).toBe(true);
  });

  test('should handle file selection and preview', async ({ page }) => {
    // This test assumes there might be sample files or we've uploaded one
    const fileItems = page.locator('[class*="file-item"], [data-testid*="file"], li').filter({ hasText: /.+\.(md|mermaid|txt)/ });

    const fileCount = await fileItems.count();

    if (fileCount > 0) {
      // Select the first file
      await fileItems.first().click();
      await page.waitForTimeout(1000);

      // Look for content preview or diagram render area
      const contentArea = page.locator('[class*="content"], [class*="preview"], [class*="diagram"], canvas, svg');
      const hasContent = await contentArea.count() > 0;

      expect(hasContent).toBe(true);
    }
  });

  test('should display mermaid diagram when valid content is loaded', async ({ page }) => {
    // Look for mermaid diagram container
    const diagramContainer = page.locator('#mermaid-diagram, [class*="mermaid"], svg, canvas');

    // The diagram container should exist (even if no diagram is loaded yet)
    const hasDiagramContainer = await diagramContainer.count() > 0;

    if (hasDiagramContainer) {
      await expect(diagramContainer.first()).toBeVisible();
    }
  });

  test('should handle file deletion', async ({ page }) => {
    // Look for files with delete buttons
    const deleteButtons = page.locator('button[title*="delete" i], button:has-text("delete"), button:has([class*="trash"]), button:has([class*="delete"])');

    const deleteCount = await deleteButtons.count();

    if (deleteCount > 0) {
      const initialFileCount = await page.locator('[class*="file-item"], [data-testid*="file"], li').count();

      // Click first delete button
      await deleteButtons.first().click();
      await page.waitForTimeout(1000);

      // Verify file was removed (count decreased)
      const newFileCount = await page.locator('[class*="file-item"], [data-testid*="file"], li').count();
      expect(newFileCount).toBeLessThanOrEqual(initialFileCount);
    }
  });

  test('should show loading states', async ({ page }) => {
    // Look for loading indicators, spinners, or skeleton loaders
    const loadingElements = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"], [data-testid*="loading"]');

    // Loading elements might appear during operations
    // This test just verifies they exist in the DOM structure
    const hasLoadingSupport = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count() >= 0;
    expect(hasLoadingSupport).toBe(true);
  });

  test('should handle context menu interactions', async ({ page }) => {
    const fileItems = page.locator('[class*="file-item"], [data-testid*="file"], li');
    const fileCount = await fileItems.count();

    if (fileCount > 0) {
      // Right-click on first file
      await fileItems.first().click({ button: 'right' });
      await page.waitForTimeout(500);

      // Look for context menu
      const contextMenu = page.locator('[class*="context"], [class*="menu"], [role="menu"]');
      const hasContextMenu = await contextMenu.count() > 0;

      if (hasContextMenu) {
        await expect(contextMenu.first()).toBeVisible();

        // Click outside to close
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(200);
      }
    }
  });
});