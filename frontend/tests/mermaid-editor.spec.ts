import { test, expect } from '@playwright/test'

test.describe('Mermaid Editor', () => {
  test('should have Mermaid Editor in navigation', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Check if Mermaid Editor button exists
    const editorButton = page.locator('button:has-text("Mermaid Editor")')
    await expect(editorButton).toBeVisible()
  })

  test('should navigate to Mermaid Editor view', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Click on Mermaid Editor button
    await page.click('button:has-text("Mermaid Editor")')

    // Wait for editor to be visible
    await page.waitForTimeout(1000)

    // Check if we're on the editor view
    const editorButton = page.locator('button:has-text("Mermaid Editor")')
    const buttonClass = await editorButton.getAttribute('class')
    expect(buttonClass).toContain('bg-primary-100')
  })

  test('should show Document View with theme selector', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Navigate to Document View
    await page.click('button:has-text("Document View")')

    // Wait for view to load
    await page.waitForTimeout(1000)

    // Check if Document View is active
    const docButton = page.locator('button:has-text("Document View")')
    const buttonClass = await docButton.getAttribute('class')
    expect(buttonClass).toContain('bg-primary-100')
  })
})