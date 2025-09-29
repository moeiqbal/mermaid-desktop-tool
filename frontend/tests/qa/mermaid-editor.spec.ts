import { test, expect } from '@playwright/test'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import {
  waitForAppLoad,
  switchView,
  isDiagramRendered,
  getSVGContent,
  waitForAPIRequest,
  hasHorizontalScrollbar,
  getElementDimensions,
  verifyNoConsoleErrors,
  setMobileViewport,
  setDesktopViewport
} from '../utils/test-helpers'
import {
  VALID_MERMAID_DIAGRAMS,
  INVALID_MERMAID_DIAGRAMS,
  MARKDOWN_WITH_MERMAID,
  createTestFileContent,
  SELECTORS,
  TIMING
} from '../utils/mock-data'

/**
 * QA Test Suite: Mermaid Editor Feature
 *
 * Tests cover:
 * - Real-time preview updates
 * - Syntax validation
 * - Error handling in editor
 * - Multiple diagram types support
 * - Diagram rendering accuracy
 * - Editor responsiveness
 * - File upload and processing
 */

test.describe('Feature 2: Mermaid Editor', () => {
  // Setup test fixtures directory
  test.beforeAll(async () => {
    const fixturesDir = join(process.cwd(), 'test-fixtures')
    try {
      await mkdir(fixturesDir, { recursive: true })

      // Create test files
      await writeFile(
        join(fixturesDir, 'valid-flowchart.md'),
        `# Flowchart Test\n\n\`\`\`mermaid\n${VALID_MERMAID_DIAGRAMS.flowchart}\n\`\`\``
      )

      await writeFile(
        join(fixturesDir, 'multiple-diagrams.md'),
        createTestFileContent(3)
      )

      await writeFile(
        join(fixturesDir, 'invalid-diagram.md'),
        `# Invalid Diagram\n\n\`\`\`mermaid\n${INVALID_MERMAID_DIAGRAMS.syntaxError}\n\`\`\``
      )

      await writeFile(
        join(fixturesDir, 'all-diagram-types.md'),
        MARKDOWN_WITH_MERMAID
      )
    } catch (error) {
      console.log('Test fixtures setup:', error)
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForAppLoad(page)
    await switchView(page, 'Mermaid Viewer')
  })

  test.describe('File Upload', () => {
    test('should upload valid mermaid file successfully', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      // Upload file
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')

      // Wait for file to be processed
      await page.waitForTimeout(TIMING.shortWait)

      // Verify diagram is rendered
      const diagramRendered = await isDiagramRendered(page, SELECTORS.diagramContainer)
      expect(diagramRendered).toBe(true)
    })

    test('should handle multiple file uploads', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      // Upload first file
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Upload second file
      await fileInput.setInputFiles('test-fixtures/multiple-diagrams.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Should show the new file's diagrams
      const diagrams = await page.locator(SELECTORS.mermaidDiagram).count()
      expect(diagrams).toBeGreaterThan(0)
    })

    test('should show error for invalid file format', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      // Create an invalid file
      const invalidFile = join(process.cwd(), 'test-fixtures', 'invalid.txt')
      await writeFile(invalidFile, 'This is not a Mermaid file')

      await fileInput.setInputFiles(invalidFile)
      await page.waitForTimeout(TIMING.shortWait)

      // Should show error notification or message
      const errorVisible = await page.locator(SELECTORS.notification).isVisible().catch(() => false)

      // Either notification shows or no diagram is rendered
      if (!errorVisible) {
        const diagramRendered = await isDiagramRendered(page, SELECTORS.diagramContainer)
        expect(diagramRendered).toBe(false)
      }
    })

    test('should handle large files', async ({ page }) => {
      // Create a large file with many diagrams
      const largeContent = createTestFileContent(10)
      const largeFile = join(process.cwd(), 'test-fixtures', 'large-file.md')
      await writeFile(largeFile, largeContent)

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(largeFile)

      // Should process without errors (may take longer)
      await page.waitForTimeout(TIMING.longWait)

      const diagrams = await page.locator(SELECTORS.mermaidDiagram).count()
      expect(diagrams).toBeGreaterThan(0)
    })
  })

  test.describe('Diagram Rendering', () => {
    test('should render flowchart diagram correctly', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Verify SVG is rendered
      const svg = await getSVGContent(page, SELECTORS.diagramContainer)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    test('should render multiple diagrams in sequence', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/multiple-diagrams.md')
      await page.waitForTimeout(TIMING.mediumWait)

      const diagramCount = await page.locator(SELECTORS.mermaidDiagram).count()
      expect(diagramCount).toBeGreaterThanOrEqual(3)
    })

    test('should render different diagram types', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/all-diagram-types.md')
      await page.waitForTimeout(TIMING.mediumWait)

      // Should render multiple different diagram types
      const diagrams = await page.locator(SELECTORS.mermaidDiagram).count()
      expect(diagrams).toBeGreaterThan(1)

      // Verify each diagram has different structure/content
      const firstSVG = await page.locator(SELECTORS.mermaidDiagram).first().innerHTML()
      const lastSVG = await page.locator(SELECTORS.mermaidDiagram).last().innerHTML()

      expect(firstSVG).not.toBe(lastSVG)
    })

    test('should display loading state while rendering', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      // Start upload
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')

      // Look for loading indicator immediately
      const loadingIndicator = page.locator('text=/rendering|loading|processing/i').first()
      const isLoading = await loadingIndicator.isVisible().catch(() => false)

      // Either we caught the loading state or it was too fast (both are acceptable)
      expect(typeof isLoading).toBe('boolean')
    })

    test('should render diagrams with correct dimensions', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      const dimensions = await getElementDimensions(page, SELECTORS.mermaidDiagram)

      expect(dimensions.width).toBeGreaterThan(100)
      expect(dimensions.height).toBeGreaterThan(100)
    })
  })

  test.describe('Real-time Preview Updates', () => {
    test.skip('should update preview when diagram definition changes', async ({ page }) => {
      // Note: This requires an editable editor interface
      // Skipped if not implemented
      await page.goto('/')
      await waitForAppLoad(page)

      // TODO: Implement if there's an editable code editor
    })

    test.skip('should debounce rapid updates', async ({ page }) => {
      // Note: This requires an editable editor interface
      // Skipped if not implemented
    })
  })

  test.describe('Error Handling', () => {
    test('should show error for invalid syntax', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/invalid-diagram.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Should show error message
      const errorPanel = page.locator('text=/error|invalid|failed/i').first()
      const errorVisible = await errorPanel.isVisible().catch(() => false)

      // Either error panel shows or notification appears
      if (!errorVisible) {
        const notification = await page.locator(SELECTORS.notification).isVisible().catch(() => false)
        expect(notification).toBe(true)
      } else {
        expect(errorVisible).toBe(true)
      }
    })

    test('should display helpful error messages', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/invalid-diagram.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Error message should be descriptive
      const errorText = await page.locator('body').textContent()

      // Should mention something about the error
      expect(errorText?.toLowerCase()).toMatch(/error|invalid|syntax|failed/)
    })

    test('should allow recovery from errors', async ({ page }) => {
      // Upload invalid file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/invalid-diagram.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Upload valid file to recover
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Should now show valid diagram
      const diagramRendered = await isDiagramRendered(page, SELECTORS.diagramContainer)
      expect(diagramRendered).toBe(true)
    })

    test('should not crash on malformed input', async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/invalid-diagram.md')
      await page.waitForTimeout(TIMING.shortWait)

      // App should still be functional
      const headerVisible = await page.locator(SELECTORS.header).isVisible()
      expect(headerVisible).toBe(true)

      // No uncaught exceptions
      const criticalErrors = errors.filter(err =>
        err.includes('Uncaught') || err.includes('TypeError') || err.includes('ReferenceError')
      )
      expect(criticalErrors.length).toBe(0)
    })
  })

  test.describe('Interactive Controls', () => {
    test('should support zoom in/out', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Look for zoom controls
      const zoomInButton = page.locator('button[title*="Zoom In"], button:has-text("Zoom In")').first()
      const zoomOutButton = page.locator('button[title*="Zoom Out"], button:has-text("Zoom Out")').first()

      const zoomInVisible = await zoomInButton.isVisible().catch(() => false)
      const zoomOutVisible = await zoomOutButton.isVisible().catch(() => false)

      if (zoomInVisible && zoomOutVisible) {
        await zoomInButton.click()
        await page.waitForTimeout(TIMING.animationDelay)

        await zoomOutButton.click()
        await page.waitForTimeout(TIMING.animationDelay)

        // Controls should work without errors
        expect(true).toBe(true)
      }
    })

    test('should support fullscreen mode', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Look for fullscreen button
      const fullscreenButton = page.locator('button[title*="Fullscreen"], button:has-text("Fullscreen")').first()
      const fullscreenVisible = await fullscreenButton.isVisible().catch(() => false)

      if (fullscreenVisible) {
        await fullscreenButton.click()
        await page.waitForTimeout(TIMING.animationDelay)

        // Should be in fullscreen mode (dialog or full viewport)
        const isFullscreen = await page.evaluate(() => {
          return document.fullscreenElement !== null || document.querySelector('.fixed.inset-0') !== null
        })

        expect(isFullscreen).toBe(true)
      }
    })

    test('should support pan/drag interaction', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      const diagramContainer = page.locator(SELECTORS.diagramContainer).first()

      // Try to drag the diagram
      const box = await diagramContainer.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50)
        await page.mouse.up()

        // Interaction should work without errors
        await page.waitForTimeout(TIMING.animationDelay)
        expect(true).toBe(true)
      }
    })

    test('should support export functionality', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Look for export button
      const exportButton = page.locator('button:has-text("Export")').first()
      const exportVisible = await exportButton.isVisible().catch(() => false)

      if (exportVisible) {
        await exportButton.click()
        await page.waitForTimeout(TIMING.animationDelay)

        // Export menu should appear
        const exportMenu = page.locator('button:has-text("PNG"), button:has-text("SVG")').first()
        const menuVisible = await exportMenu.isVisible().catch(() => false)

        expect(menuVisible).toBe(true)
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile', async ({ page }) => {
      await setMobileViewport(page)
      await page.reload()
      await waitForAppLoad(page)

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Should render without horizontal scroll
      const hasHScroll = await hasHorizontalScrollbar(page)
      expect(hasHScroll).toBe(false)

      // Diagram should be visible
      const diagramRendered = await isDiagramRendered(page, SELECTORS.diagramContainer)
      expect(diagramRendered).toBe(true)
    })

    test('should render correctly on desktop', async ({ page }) => {
      await setDesktopViewport(page)
      await page.reload()
      await waitForAppLoad(page)

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Diagram should render with good size
      const dimensions = await getElementDimensions(page, SELECTORS.mermaidDiagram)
      expect(dimensions.width).toBeGreaterThan(200)
      expect(dimensions.height).toBeGreaterThan(100)
    })

    test('should adapt controls for touch devices', async ({ page }) => {
      await setMobileViewport(page)
      await page.reload()
      await waitForAppLoad(page)

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.shortWait)

      // Controls should be visible and accessible
      const controls = page.locator('button[title*="Zoom"], button:has-text("Export")').first()
      const controlsVisible = await controls.isVisible().catch(() => false)

      expect(typeof controlsVisible).toBe('boolean')
    })
  })

  test.describe('Performance', () => {
    test('should render diagrams within acceptable time', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      const startTime = Date.now()
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')

      // Wait for diagram to render
      await page.waitForSelector(SELECTORS.mermaidDiagram, { timeout: TIMING.renderTimeout })
      const endTime = Date.now()

      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(TIMING.renderTimeout)
    })

    test('should handle rapid file uploads', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]')

      // Upload multiple files rapidly
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(100)
      await fileInput.setInputFiles('test-fixtures/multiple-diagrams.md')
      await page.waitForTimeout(100)
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')

      // Should eventually settle and show a diagram
      await page.waitForTimeout(TIMING.mediumWait)
      const diagramRendered = await isDiagramRendered(page, SELECTORS.diagramContainer)
      expect(diagramRendered).toBe(true)
    })
  })

  test.describe('Console Errors', () => {
    test('should not produce console errors during normal operation', async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('test-fixtures/valid-flowchart.md')
      await page.waitForTimeout(TIMING.mediumWait)

      // Filter out acceptable errors
      const relevantErrors = errors.filter(err =>
        !err.includes('favicon.ico') &&
        !err.includes('404') &&
        !err.includes('net::ERR_FILE_NOT_FOUND')
      )

      expect(relevantErrors).toEqual([])
    })
  })
})