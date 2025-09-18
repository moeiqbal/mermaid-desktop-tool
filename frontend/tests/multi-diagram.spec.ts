import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Multi-Diagram Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display multiple diagrams from uploaded markdown file', async ({ page }) => {
    // Ensure we're in Mermaid view
    const mermaidButton = page.locator('button:has-text("Mermaid Viewer")')
    if (await mermaidButton.isVisible()) {
      await mermaidButton.click()
    }

    // Upload the test file with multiple diagrams
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)

    // Wait for file to appear in list
    await page.waitForSelector('text=test-multi-diagrams.md', { timeout: 5000 })

    // Click on the uploaded file
    await page.click('text=test-multi-diagrams.md')

    // Wait for multi-diagram viewer to load
    await page.waitForSelector('text=8 diagrams', { timeout: 5000 })

    // Verify diagram navigator is visible
    await expect(page.locator('text=Diagram Navigator')).toBeVisible()

    // Verify first diagram is displayed
    await expect(page.locator('text=System Architecture')).toBeVisible()
    await expect(page.locator('text=Diagram 1')).toBeVisible()

    // Navigate through diagrams using navigator
    await page.click('text=Database Schema')
    await expect(page.locator('text=Diagram 3')).toBeVisible()

    // Test keyboard navigation
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(500) // Wait for smooth scroll
    await expect(page.locator('text=State Machine')).toBeVisible()

    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(500)
    await expect(page.locator('text=Database Schema')).toBeVisible()
  })

  test('should open diagram in full-screen mode', async ({ page, context }) => {
    // Upload and select the test file
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)
    await page.waitForSelector('text=test-multi-diagrams.md')
    await page.click('text=test-multi-diagrams.md')

    // Wait for multi-diagram viewer
    await page.waitForSelector('text=8 diagrams')

    // Click the full-screen button on the first diagram
    const fullScreenButton = page.locator('button[title="Open in Full Screen"]').first()
    await fullScreenButton.click()

    // Wait for navigation to full-screen route
    await page.waitForURL(/\/diagram\/.*\/0/)

    // Verify full-screen view elements
    await expect(page.locator('text=Exit Full Screen')).toBeVisible()
    await expect(page.locator('text=Diagram 1 of 8')).toBeVisible()
    await expect(page.locator('text=System Architecture')).toBeVisible()

    // Test navigation in full-screen
    await page.keyboard.press('ArrowRight')
    await page.waitForURL(/\/diagram\/.*\/1/)
    await expect(page.locator('text=Diagram 2 of 8')).toBeVisible()

    // Exit full-screen
    await page.keyboard.press('Escape')
    await page.waitForURL('/')
  })

  test('should open diagram in new tab', async ({ page, context }) => {
    // Upload and select the test file
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)
    await page.waitForSelector('text=test-multi-diagrams.md')
    await page.click('text=test-multi-diagrams.md')

    // Wait for multi-diagram viewer
    await page.waitForSelector('text=8 diagrams')

    // Listen for new tab
    const newPagePromise = context.waitForEvent('page')

    // Click "Open in New Tab" button
    const newTabButton = page.locator('button[title="Open in New Tab"]').first()
    await newTabButton.click()

    // Wait for new tab and switch to it
    const newPage = await newPagePromise
    await newPage.waitForLoadState()

    // Verify new tab shows full-screen diagram
    await expect(newPage).toHaveURL(/\/diagram\/.*\/0/)
    await expect(newPage.locator('text=System Architecture')).toBeVisible()

    // Close new tab
    await newPage.close()
  })

  test('should handle view mode switching between list and grid', async ({ page }) => {
    // Upload and select the test file
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)
    await page.waitForSelector('text=test-multi-diagrams.md')
    await page.click('text=test-multi-diagrams.md')

    // Wait for multi-diagram viewer
    await page.waitForSelector('text=8 diagrams')

    // Find view mode buttons
    const listViewButton = page.locator('button[title="List View"]')
    const gridViewButton = page.locator('button[title="Grid View"]')

    // Default should be list view
    await expect(listViewButton).toHaveClass(/bg-white/)

    // Switch to grid view
    await gridViewButton.click()
    await expect(gridViewButton).toHaveClass(/bg-white/)

    // Verify grid layout is applied
    const diagramContainer = page.locator('.grid')
    await expect(diagramContainer).toBeVisible()

    // Switch back to list view
    await listViewButton.click()
    await expect(listViewButton).toHaveClass(/bg-white/)
  })

  test('should show diagram count indicator', async ({ page }) => {
    // Upload and select the test file
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)
    await page.waitForSelector('text=test-multi-diagrams.md')
    await page.click('text=test-multi-diagrams.md')

    // Verify diagram count badge
    await expect(page.locator('text=8 diagrams')).toBeVisible()

    // Verify navigation counter
    await expect(page.locator('text=1 / 8')).toBeVisible()

    // Navigate and verify counter updates
    await page.click('text=Component Hierarchy')
    await expect(page.locator('text=6 / 8')).toBeVisible()
  })

  test('should handle keyboard shortcuts in full-screen mode', async ({ page }) => {
    // Upload and select the test file
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '..', '..', 'test-multi-diagrams.md')
    await fileInput.setInputFiles(testFilePath)
    await page.waitForSelector('text=test-multi-diagrams.md')
    await page.click('text=test-multi-diagrams.md')

    // Open full-screen
    await page.waitForSelector('text=8 diagrams')
    const fullScreenButton = page.locator('button[title="Open in Full Screen"]').first()
    await fullScreenButton.click()

    // Wait for full-screen view
    await page.waitForURL(/\/diagram\/.*\/0/)

    // Test F key for browser fullscreen
    await page.keyboard.press('f')
    // Note: We can't actually test browser fullscreen in Playwright, but we can verify the handler exists

    // Test arrow navigation
    await page.keyboard.press('ArrowRight')
    await page.waitForURL(/\/diagram\/.*\/1/)

    await page.keyboard.press('ArrowLeft')
    await page.waitForURL(/\/diagram\/.*\/0/)

    // Test ESC to exit
    await page.keyboard.press('Escape')
    await page.waitForURL('/')
  })

  test('should display proper error when no diagrams found', async ({ page }) => {
    // Create and upload a markdown file without diagrams
    const markdownWithoutDiagrams = `# Test Document

This is a markdown file without any mermaid diagrams.

\`\`\`javascript
const code = 'not mermaid';
\`\`\`

Just regular content.`

    // Create a file blob
    const buffer = Buffer.from(markdownWithoutDiagrams)
    const fileInput = page.locator('input[type="file"]')

    // Upload the file
    await fileInput.setInputFiles({
      name: 'no-diagrams.md',
      mimeType: 'text/markdown',
      buffer: buffer
    })

    // Wait for file to appear and click it
    await page.waitForSelector('text=no-diagrams.md')
    await page.click('text=no-diagrams.md')

    // Verify error message
    await expect(page.locator('text=No Mermaid diagrams found')).toBeVisible()
  })
})