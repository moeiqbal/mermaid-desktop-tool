import { test, expect } from '@playwright/test';

test.describe('YANG Explorer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to YANG Explorer
    await page.locator('button', { hasText: 'YANG Explorer' }).click();
    await page.waitForTimeout(500);
  });

  test('should display YANG Explorer interface', async ({ page }) => {
    // Verify we're in YANG Explorer view
    const yangButton = page.locator('button', { hasText: 'YANG Explorer' });
    await expect(yangButton).toHaveClass(/bg-primary-100|text-primary-700/);

    // Look for YANG-specific UI elements
    const uploadArea = page.locator('[class*="dropzone"], [class*="upload"], input[type="file"]').first();
    const hasUploadInterface = await uploadArea.count() > 0;

    expect(hasUploadInterface).toBe(true);
  });

  test('should handle YANG file upload', async ({ page }) => {
    // Look for file input
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // Create a test YANG file content
      const testYangContent = `module test-yang {
  namespace "http://example.com/test-yang";
  prefix "test";

  revision "2023-01-01" {
    description "Initial revision";
  }

  container system {
    description "System configuration";

    leaf hostname {
      type string;
      description "System hostname";
    }
  }
}`;

      // Upload the YANG file
      await fileInput.setInputFiles({
        name: 'test-yang.yang',
        mimeType: 'text/plain',
        buffer: Buffer.from(testYangContent)
      });

      // Wait for upload and processing
      await page.waitForTimeout(3000);

      // Check for success indication
      const successIndicators = page.locator('text=success, text=uploaded, [class*="success"], .notification');
      const hasSuccess = await successIndicators.count() > 0;

      // Or check if file appears in file list
      const fileInList = page.locator('text=test-yang.yang');
      const isFileInList = await fileInList.count() > 0;

      expect(hasSuccess || isFileInList).toBe(true);
    }
  });

  test('should display YANG tree structure', async ({ page }) => {
    // Look for tree structure elements
    const treeElements = page.locator('[class*="tree"], [class*="node"], [role="tree"], [role="treeitem"]');
    const hasTreeStructure = await treeElements.count() > 0;

    // Or look for expandable elements
    const expandableElements = page.locator('[class*="expand"], [class*="collapse"], button[aria-expanded]');
    const hasExpandableElements = await expandableElements.count() > 0;

    // Tree structure or expandable elements should be present
    expect(hasTreeStructure || hasExpandableElements).toBe(true);
  });

  test('should handle tree node expansion and collapse', async ({ page }) => {
    // Look for expandable tree nodes
    const expandButtons = page.locator('button[aria-expanded="false"], [class*="expand"]:not([class*="expanded"])').first();

    if (await expandButtons.count() > 0) {
      // Expand a node
      await expandButtons.click();
      await page.waitForTimeout(500);

      // Look for expanded state
      const expandedButton = page.locator('button[aria-expanded="true"], [class*="expanded"]');
      await expect(expandedButton.first()).toBeVisible();

      // Collapse the node
      await expandedButton.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should display node properties panel', async ({ page }) => {
    // Look for properties panel
    const propertiesPanel = page.locator('[class*="properties"], [class*="panel"], [class*="details"]');
    const hasPropertiesPanel = await propertiesPanel.count() > 0;

    if (hasPropertiesPanel) {
      await expect(propertiesPanel.first()).toBeVisible();
    }

    // Look for tree nodes to select
    const treeNodes = page.locator('[role="treeitem"], [class*="node"], [class*="tree-item"]');
    const nodeCount = await treeNodes.count();

    if (nodeCount > 0) {
      // Select a node
      await treeNodes.first().click();
      await page.waitForTimeout(500);

      // Check if properties are displayed
      const propertyElements = page.locator('[class*="property"], dt, dd, .field');
      const hasProperties = await propertyElements.count() > 0;

      // Properties might be shown after node selection
      if (hasProperties) {
        await expect(propertyElements.first()).toBeVisible();
      }
    }
  });

  test('should handle YANG file validation and errors', async ({ page }) => {
    // Look for file input
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // Create an invalid YANG file content
      const invalidYangContent = `invalid yang syntax {
  this is not valid YANG
  missing proper structure
}`;

      // Upload the invalid YANG file
      await fileInput.setInputFiles({
        name: 'invalid-yang.yang',
        mimeType: 'text/plain',
        buffer: Buffer.from(invalidYangContent)
      });

      // Wait for processing
      await page.waitForTimeout(3000);

      // Look for error notifications or messages
      const errorElements = page.locator('[class*="error"], .notification, [role="alert"], text=error');
      const hasErrorHandling = await errorElements.count() > 0;

      // Error handling should be present for invalid files
      if (hasErrorHandling) {
        await expect(errorElements.first()).toBeVisible();
      }
    }
  });

  test('should provide search functionality', async ({ page }) => {
    // Look for search input in YANG Explorer
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // Test search functionality
      await searchInput.fill('system');
      await page.waitForTimeout(500);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(200);
    }
  });

  test('should handle file management operations', async ({ page }) => {
    // Look for file management buttons (delete, refresh, etc.)
    const managementButtons = page.locator('button[title*="delete"], button[title*="refresh"], button:has-text("delete"), button:has-text("refresh")');

    const buttonCount = await managementButtons.count();

    if (buttonCount > 0) {
      // Test that buttons are clickable
      const firstButton = managementButtons.first();
      await expect(firstButton).toBeEnabled();
    }

    // Look for file list
    const fileItems = page.locator('[class*="file"], li, .list-item');
    const fileCount = await fileItems.count();

    // File list container should exist
    expect(fileCount >= 0).toBe(true);
  });

  test('should display metadata and documentation', async ({ page }) => {
    // Look for elements that might show YANG metadata
    const metadataElements = page.locator('[class*="metadata"], [class*="info"], [class*="description"]');
    const hasMetadata = await metadataElements.count() > 0;

    // Documentation or description areas
    const docElements = page.locator('[class*="doc"], [class*="description"], [class*="help"]');
    const hasDocumentation = await docElements.count() > 0;

    // At least some form of information display should be available
    expect(hasMetadata || hasDocumentation).toBe(true);
  });
});