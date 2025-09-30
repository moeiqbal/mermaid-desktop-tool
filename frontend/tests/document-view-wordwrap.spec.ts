import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

test.describe('Document View - Word Wrap Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should properly wrap long words and prevent horizontal overflow in Document View', async ({ page, browserName }) => {
    // Create test markdown file with content designed to cause overflow
    const testContent = `# Word Wrap Test Document

## Test Case 1: Very Long Words Without Spaces

ThisIsAnExtremelyLongWordWithoutAnySpacesOrBreaksThatShouldDefinitelyWrapToTheNextLineInsteadOfCausingHorizontalScrollingOrOverflowIssuesInTheDocumentViewerComponentThisIsExactlyTheKindOfContentThatWouldHaveFailedBeforeTheFixWasImplemented

## Test Case 2: Long URLs

https://www.example.com/this/is/a/very/long/url/path/that/extends/beyond/normal/viewport/width/and/should/wrap/properly/without/causing/horizontal/overflow/issues/in/the/document/viewer/component

## Test Case 3: Very Long Email Address

thisisaverylongemailaddressthatdoesnothaveanynaturalbreakingpointsandshouldbewrapped@anextremelylong-domain-name-that-extends-way-beyond-the-viewport-width.com

## Test Case 4: Continuous Alphanumeric String

ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

## Test Case 5: Normal Paragraph with Mixed Content

This is a normal paragraph that contains some regular text, followed by a verylongwordwithoutanyspacesorbreaksthatshoulddefinitelywrapdespiteitslengthandnotcauseanyhorizontalscrollingintheuserinterfacecomponent, and then continues with more regular text to ensure that the wrapping works correctly in mixed content scenarios.

## Test Case 6: Code Block with Long Lines

\`\`\`
const verylongvariablename = "ThisIsAVeryLongStringValueThatMightCauseIssuesIfNotHandledProperlyInCodeBlocks"
function extremelylongfunctionnamethatexceedsnormalexpectations() { return "test" }
\`\`\`

## Test Case 7: Inline Code

Here is some inline code with a long value: \`ThisIsAnExtremelyLongInlineCodeValueThatShouldWrapProperlyWithoutBreakingTheLayout\`

## Test Case 8: Multiple Paragraphs with Long Content

First paragraph with extremelylongwordwithoutanybreakpointsthatneedstobehandledproperly.

Second paragraph with anotherlongwordthatshouldalsobewrappedcorrectlytopreventhorizontaloverflow.

Third paragraph with normallongwordthatstillneedstobewrappedproperly.

## Test Case 9: List with Long Items

- Thisisaverylonglistitemwithoutanyproperbreakpointsthatshouldbewrappedwithinthelistcontainer
- Anotherextrmelylonglistitemthatextendswaybeyondthenormalviewportwidthandneedswordwrapping
- Shortitem
- Yetanotherverylonglistitemwithlotsofrepeatedcontenttovalidatewordwrappingbehavior

## Test Case 10: Blockquote with Long Content

> Thisisalongblockquotewithaverylongwordthatextendswaybeyondnormalexpectationsandshouldbewrappedproperlytopreventhorizontalscrollingandoverflowissuesintheblockquotecomponent

## Conclusion

If all the above content renders without horizontal scrolling, the word wrap fix is working correctly.
`

    const testDir = path.join(process.cwd(), '..', 'uploads')
    const testFile = path.join(testDir, 'wordwrap-test.md')

    // Ensure uploads directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    // Write test file
    fs.writeFileSync(testFile, testContent, 'utf-8')

    try {
      // Navigate to Mermaid Viewer (default view)
      await page.waitForSelector('button:has-text("Mermaid Viewer")', { timeout: 10000 })

      // Upload the test file
      const fileInput = await page.locator('input[type="file"]').first()
      await fileInput.setInputFiles(testFile)

      // Wait for file to be processed
      await page.waitForTimeout(1000)

      // Switch to Document View by clicking the Document View button
      const documentViewButton = await page.locator('button:has-text("Document View")').first()
      await documentViewButton.click()

      // Wait for the file to appear in the sidebar
      await page.waitForTimeout(1000)

      // Click on the uploaded file to view it
      await page.locator('text=wordwrap-test.md').first().click()

      // Wait for document content to load
      await page.waitForSelector('.document-content', { timeout: 10000 })

      // Wait for content to fully render
      await page.waitForTimeout(1500)

      // Get the document content container
      const documentContent = await page.locator('.document-content')
      await expect(documentContent).toBeVisible()

      // CRITICAL VALIDATION: Check for horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        const docContent = document.querySelector('.document-content')
        if (!docContent) return true

        // Check if the document content or any of its children cause horizontal scroll
        const contentScrollWidth = docContent.scrollWidth
        const contentClientWidth = docContent.clientWidth

        // Also check the parent container
        const parent = docContent.parentElement
        const parentScrollWidth = parent ? parent.scrollWidth : 0
        const parentClientWidth = parent ? parent.clientWidth : 0

        console.log('Document Content:', {
          scrollWidth: contentScrollWidth,
          clientWidth: contentClientWidth,
          hasOverflow: contentScrollWidth > contentClientWidth
        })

        console.log('Parent Container:', {
          scrollWidth: parentScrollWidth,
          clientWidth: parentClientWidth,
          hasOverflow: parentScrollWidth > parentClientWidth
        })

        // Return true if either has horizontal overflow
        return (contentScrollWidth > contentClientWidth + 5) || (parentScrollWidth > parentClientWidth + 5)
      })

      // MAIN ASSERTION: No horizontal overflow should exist
      expect(hasHorizontalOverflow).toBe(false)

      // Validate that all test case headers are visible
      await expect(page.locator('text=Test Case 1: Very Long Words Without Spaces')).toBeVisible()
      await expect(page.locator('text=Test Case 2: Long URLs')).toBeVisible()
      await expect(page.locator('text=Test Case 3: Very Long Email Address')).toBeVisible()
      await expect(page.locator('text=Test Case 4: Continuous Alphanumeric String')).toBeVisible()
      await expect(page.locator('text=Test Case 5: Normal Paragraph with Mixed Content')).toBeVisible()

      // Validate word-breaking CSS is applied
      const wordBreakStyle = await page.evaluate(() => {
        const docContent = document.querySelector('.document-content')
        if (!docContent) return null

        const styles = window.getComputedStyle(docContent)
        return {
          overflowX: styles.overflowX,
          overflowWrap: styles.overflowWrap,
          wordBreak: styles.wordBreak,
          maxWidth: styles.maxWidth
        }
      })

      console.log('Word Break Styles:', wordBreakStyle)

      // Verify correct CSS properties are applied
      expect(wordBreakStyle?.overflowX).toBe('hidden')
      expect(wordBreakStyle?.overflowWrap).toBe('break-word')
      expect(wordBreakStyle?.wordBreak).toBe('break-word')

      // Test at different viewport sizes to ensure responsive behavior
      const viewportSizes = [
        { width: 1920, height: 1080, name: 'Desktop Large' },
        { width: 1366, height: 768, name: 'Desktop Medium' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ]

      for (const viewport of viewportSizes) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.waitForTimeout(500) // Allow layout recalculation

        const overflowAtSize = await page.evaluate(() => {
          const docContent = document.querySelector('.document-content')
          if (!docContent) return true
          return docContent.scrollWidth > docContent.clientWidth + 5
        })

        console.log(`${viewport.name} (${viewport.width}x${viewport.height}): Overflow = ${overflowAtSize}`)
        expect(overflowAtSize).toBe(false)
      }

      // Take a screenshot for visual verification
      await page.setViewportSize({ width: 1366, height: 768 })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: `test-results/document-view-wordwrap-${browserName}.png`,
        fullPage: true
      })

    } finally {
      // Cleanup: Remove test file
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile)
      }
    }
  })

  test('should handle mixed content with long words in different themes', async ({ page }) => {
    const testContent = `# Theme Test Document

This document tests word wrapping across different themes.

VeryLongWordWithoutSpacesThatShouldWrapProperlyInAllThemesRegardlessOfThemeConfiguration

## Normal Content

Regular text to verify basic rendering still works correctly.
`

    const testDir = path.join(process.cwd(), '..', 'uploads')
    const testFile = path.join(testDir, 'theme-wordwrap-test.md')

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    fs.writeFileSync(testFile, testContent, 'utf-8')

    try {
      await page.waitForSelector('button:has-text("Mermaid Viewer")', { timeout: 10000 })

      const fileInput = await page.locator('input[type="file"]').first()
      await fileInput.setInputFiles(testFile)

      await page.waitForTimeout(1000)

      const documentViewButton = await page.locator('button:has-text("Document View")').first()
      await documentViewButton.click()

      // Wait for the file to appear in the sidebar
      await page.waitForTimeout(1000)

      // Click on the uploaded file to view it
      await page.locator('text=theme-wordwrap-test.md').first().click()

      await page.waitForSelector('.document-content', { timeout: 10000 })
      await page.waitForTimeout(1500)

      // Test with different themes
      const themes = ['Tailwind', 'GitHub', 'Custom']

      for (const theme of themes) {
        // Open theme selector (if available)
        const themeButton = await page.locator(`button:has-text("${theme}")`).first()
        if (await themeButton.isVisible()) {
          await themeButton.click()
          await page.waitForTimeout(500)
        }

        // Verify no horizontal overflow with this theme
        const hasOverflow = await page.evaluate(() => {
          const docContent = document.querySelector('.document-content')
          if (!docContent) return true
          return docContent.scrollWidth > docContent.clientWidth + 5
        })

        console.log(`Theme "${theme}": Overflow = ${hasOverflow}`)
        expect(hasOverflow).toBe(false)
      }

    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile)
      }
    }
  })

  test('should properly wrap content in dark mode', async ({ page }) => {
    const testContent = `# Dark Mode Word Wrap Test

ExtremelyLongWordWithoutSpacesThatShouldWrapProperlyInDarkModeConfiguration

Normal content to verify basic rendering.
`

    const testDir = path.join(process.cwd(), '..', 'uploads')
    const testFile = path.join(testDir, 'darkmode-wordwrap-test.md')

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    fs.writeFileSync(testFile, testContent, 'utf-8')

    try {
      await page.waitForSelector('button:has-text("Mermaid Viewer")', { timeout: 10000 })

      const fileInput = await page.locator('input[type="file"]').first()
      await fileInput.setInputFiles(testFile)

      await page.waitForTimeout(1000)

      const documentViewButton = await page.locator('button:has-text("Document View")').first()
      await documentViewButton.click()

      // Wait for the file to appear in the sidebar
      await page.waitForTimeout(1000)

      // Click on the uploaded file to view it
      await page.locator('text=darkmode-wordwrap-test.md').first().click()

      await page.waitForSelector('.document-content', { timeout: 10000 })
      await page.waitForTimeout(1500)

      // Toggle dark mode
      const darkModeToggle = await page.locator('[aria-label="Toggle dark mode"]').or(page.locator('button:has-text("Dark")')).first()
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click()
        await page.waitForTimeout(500)
      }

      // Verify no horizontal overflow in dark mode
      const hasOverflow = await page.evaluate(() => {
        const docContent = document.querySelector('.document-content')
        if (!docContent) return true
        return docContent.scrollWidth > docContent.clientWidth + 5
      })

      console.log(`Dark Mode: Overflow = ${hasOverflow}`)
      expect(hasOverflow).toBe(false)

    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile)
      }
    }
  })
})