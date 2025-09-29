import { Page, expect } from '@playwright/test'

/**
 * Test helper utilities for Mermaid Desktop Tool QA tests
 */

/**
 * Wait for the application to fully load
 */
export async function waitForAppLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1:has-text("Mermaid & YANG Visualizer")', { timeout: 10000 })
}

/**
 * Check for console errors and return them
 */
export async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * Filter out known/acceptable errors (like favicon 404)
 */
export function filterExpectedErrors(errors: string[]): string[] {
  return errors.filter(error =>
    !error.includes('favicon.ico') &&
    !error.includes('net::ERR_FILE_NOT_FOUND') &&
    !error.includes('404')
  )
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  })
}

/**
 * Get computed styles of an element
 */
export async function getComputedStyle(page: Page, selector: string, property: string): Promise<string> {
  return await page.evaluate(
    ({ sel, prop }) => {
      const element = document.querySelector(sel)
      if (!element) return ''
      return window.getComputedStyle(element).getPropertyValue(prop)
    },
    { sel: selector, prop: property }
  )
}

/**
 * Get localStorage value
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((k) => localStorage.getItem(k), key)
}

/**
 * Set localStorage value
 */
export async function setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(
    ({ k, v }) => localStorage.setItem(k, v),
    { k: key, v: value }
  )
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear())
}

/**
 * Check if element has dark mode classes
 */
export async function hasDarkMode(page: Page): Promise<boolean> {
  const rootClasses = await page.evaluate(() => {
    return document.documentElement.className
  })
  return rootClasses.includes('dark')
}

/**
 * Get system color scheme preference
 */
export async function getSystemColorScheme(page: Page): Promise<'light' | 'dark'> {
  return await page.evaluate(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
}

/**
 * Upload a file using dropzone or file input
 */
export async function uploadFile(
  page: Page,
  fileInputSelector: string,
  filePath: string
): Promise<void> {
  const fileInput = page.locator(fileInputSelector)
  await fileInput.setInputFiles(filePath)
}

/**
 * Wait for notification to appear and capture its message
 */
export async function waitForNotification(
  page: Page,
  type?: 'success' | 'error' | 'info' | 'warning'
): Promise<string> {
  const selector = type
    ? `.notification[data-type="${type}"]`
    : '.notification'

  const notification = page.locator(selector).first()
  await notification.waitFor({ state: 'visible', timeout: 5000 })
  return await notification.textContent() || ''
}

/**
 * Check for horizontal scrollbar
 */
export async function hasHorizontalScrollbar(page: Page, selector?: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = sel ? document.querySelector(sel) : document.documentElement
    if (!element) return false
    return element.scrollWidth > element.clientWidth
  }, selector)
}

/**
 * Get viewport size
 */
export async function getViewportSize(page: Page): Promise<{ width: number; height: number }> {
  return await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }))
}

/**
 * Set viewport to mobile size
 */
export async function setMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 })
}

/**
 * Set viewport to tablet size
 */
export async function setTabletViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 768, height: 1024 })
}

/**
 * Set viewport to desktop size
 */
export async function setDesktopViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1920, height: 1080 })
}

/**
 * Switch to a view (Mermaid Viewer, YANG Explorer, etc.)
 */
export async function switchView(page: Page, view: 'Mermaid Viewer' | 'YANG Explorer'): Promise<void> {
  await page.locator(`button:has-text("${view}")`).click()
  await page.waitForTimeout(500) // Allow for transition
}

/**
 * Check if an element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  }, selector)
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStableElement(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector)
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel)
      if (!element) return false
      const rect = element.getBoundingClientRect()
      return rect.top !== 0 && rect.height !== 0
    },
    selector,
    { timeout: 5000 }
  )
}

/**
 * Measure element dimensions
 */
export async function getElementDimensions(
  page: Page,
  selector: string
): Promise<{ width: number; height: number; x: number; y: number }> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return { width: 0, height: 0, x: 0, y: 0 }
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y
    }
  }, selector)
}

/**
 * Check if modal is open
 */
export async function isModalOpen(page: Page): Promise<boolean> {
  const backdrop = page.locator('.fixed.inset-0.bg-black.bg-opacity-50')
  return await backdrop.isVisible().catch(() => false)
}

/**
 * Close modal by clicking backdrop
 */
export async function closeModalByBackdrop(page: Page): Promise<void> {
  const backdrop = page.locator('.fixed.inset-0.bg-black.bg-opacity-50')
  await backdrop.click()
  await page.waitForTimeout(300)
}

/**
 * Get SVG content from diagram
 */
export async function getSVGContent(page: Page, containerSelector: string): Promise<string | null> {
  return await page.evaluate((sel) => {
    const container = document.querySelector(sel)
    const svg = container?.querySelector('svg')
    return svg ? svg.outerHTML : null
  }, containerSelector)
}

/**
 * Check if diagram is rendered
 */
export async function isDiagramRendered(page: Page, containerSelector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const container = document.querySelector(sel)
    const svg = container?.querySelector('svg')
    return svg !== null && svg !== undefined
  }, containerSelector)
}

/**
 * Wait for API request to complete
 */
export async function waitForAPIRequest(
  page: Page,
  urlPattern: string | RegExp
): Promise<void> {
  await page.waitForResponse(
    response => {
      const url = response.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern)
      }
      return urlPattern.test(url)
    },
    { timeout: 10000 }
  )
}

/**
 * Verify no console errors occurred
 */
export async function verifyNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  await page.waitForTimeout(1000)
  const filteredErrors = filterExpectedErrors(errors)
  expect(filteredErrors).toEqual([])
}

/**
 * Get all h2 headings text
 */
export async function getAllHeadings(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'))
    return headings.map(h => h.textContent || '')
  })
}

/**
 * Simulate keyboard shortcut
 */
export async function pressShortcut(page: Page, key: string, modifiers?: string[]): Promise<void> {
  const mod = modifiers || []
  if (mod.includes('ctrl') || mod.includes('meta')) {
    await page.keyboard.down('Control')
  }
  if (mod.includes('shift')) {
    await page.keyboard.down('Shift')
  }
  if (mod.includes('alt')) {
    await page.keyboard.down('Alt')
  }

  await page.keyboard.press(key)

  if (mod.includes('alt')) {
    await page.keyboard.up('Alt')
  }
  if (mod.includes('shift')) {
    await page.keyboard.up('Shift')
  }
  if (mod.includes('ctrl') || mod.includes('meta')) {
    await page.keyboard.up('Control')
  }
}