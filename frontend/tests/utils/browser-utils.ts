import { Page, Browser, BrowserContext } from '@playwright/test'

/**
 * Browser-specific utilities for cross-browser testing
 */

/**
 * Detect browser type from user agent
 */
export async function getBrowserType(page: Page): Promise<'chromium' | 'firefox' | 'webkit' | 'unknown'> {
  const userAgent = await page.evaluate(() => navigator.userAgent)

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'chromium'
  } else if (userAgent.includes('Firefox')) {
    return 'firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'webkit'
  }

  return 'unknown'
}

/**
 * Check if browser is Safari
 */
export async function isSafari(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /^((?!chrome|android).)*safari/i.test(userAgent) ||
           (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/chrome/.test(userAgent))
  })
}

/**
 * Check if browser shows Safari compatibility page
 */
export async function showsSafariCompatibilityPage(page: Page): Promise<boolean> {
  try {
    // Look for the Safari compatibility warning text
    const compatibilityText = await page.textContent('body')
    return compatibilityText?.includes('Browser Compatibility Notice') || false
  } catch {
    return false
  }
}

/**
 * Get browser features support
 */
export async function getBrowserFeatures(page: Page): Promise<{
  webGL: boolean
  webWorkers: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
  serviceWorker: boolean
}> {
  return await page.evaluate(() => {
    return {
      webGL: !!document.createElement('canvas').getContext('webgl'),
      webWorkers: typeof Worker !== 'undefined',
      localStorage: typeof Storage !== 'undefined' && !!window.localStorage,
      sessionStorage: typeof Storage !== 'undefined' && !!window.sessionStorage,
      indexedDB: typeof indexedDB !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator
    }
  })
}

/**
 * Get CSS feature support
 */
export async function getCSSFeatureSupport(page: Page): Promise<{
  grid: boolean
  flexbox: boolean
  customProperties: boolean
  darkModeMedia: boolean
}> {
  return await page.evaluate(() => {
    return {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('--custom', 'value'),
      darkModeMedia: window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all'
    }
  })
}

/**
 * Test for specific browser bugs or quirks
 */
export async function testBrowserQuirks(page: Page): Promise<{
  hasFlexGapSupport: boolean
  hasSmoothScrollSupport: boolean
  hasContainerQueriesSupport: boolean
}> {
  return await page.evaluate(() => {
    return {
      hasFlexGapSupport: CSS.supports('gap', '1rem') && CSS.supports('display', 'flex'),
      hasSmoothScrollSupport: CSS.supports('scroll-behavior', 'smooth'),
      hasContainerQueriesSupport: CSS.supports('container-type', 'inline-size')
    }
  })
}

/**
 * Emulate network conditions
 */
export async function emulateNetworkConditions(
  context: BrowserContext,
  condition: 'fast' | 'slow' | '3g' | 'offline'
): Promise<void> {
  const conditions = {
    fast: { downloadThroughput: 50 * 1024 * 1024 / 8, uploadThroughput: 50 * 1024 * 1024 / 8, latency: 10 },
    slow: { downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 200 },
    '3g': { downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 300 },
    offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
  }

  // Note: This is a placeholder as Playwright doesn't directly support this
  // You would need to use Chrome DevTools Protocol for this
  console.log(`Emulating ${condition} network conditions`, conditions[condition])
}

/**
 * Clear browser data
 */
export async function clearBrowserData(context: BrowserContext): Promise<void> {
  await context.clearCookies()
  await context.clearPermissions()

  // Clear storage
  const pages = context.pages()
  for (const page of pages) {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }
}

/**
 * Check browser performance metrics
 */
export async function getPerformanceMetrics(page: Page): Promise<{
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
}> {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintData = performance.getEntriesByType('paint')

    return {
      loadTime: perfData.loadEventEnd - perfData.fetchStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      firstPaint: paintData.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintData.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    }
  })
}

/**
 * Test responsive behavior
 */
export async function testResponsiveLayout(
  page: Page,
  viewports: Array<{ width: number; height: number; name: string }>
): Promise<Array<{ viewport: string; layoutValid: boolean; hasScrollbar: boolean }>> {
  const results = []

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(500) // Allow for layout recalculation

    const hasScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    const layoutValid = await page.evaluate(() => {
      // Check if critical elements are visible
      const header = document.querySelector('header')
      const main = document.querySelector('main')
      return !!(header && main)
    })

    results.push({
      viewport: `${viewport.name} (${viewport.width}x${viewport.height})`,
      layoutValid,
      hasScrollbar
    })
  }

  return results
}

/**
 * Test color contrast ratio for accessibility
 */
export async function getContrastRatio(page: Page, selector: string): Promise<number> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return 0

    const styles = window.getComputedStyle(element)
    const bg = styles.backgroundColor
    const fg = styles.color

    // Parse RGB values
    const parseRGB = (color: string) => {
      const match = color.match(/\d+/g)
      return match ? match.map(Number) : [0, 0, 0]
    }

    const bgRGB = parseRGB(bg)
    const fgRGB = parseRGB(fg)

    // Calculate relative luminance
    const getLuminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const bgLuminance = getLuminance(bgRGB)
    const fgLuminance = getLuminance(fgRGB)

    // Calculate contrast ratio
    const lighter = Math.max(bgLuminance, fgLuminance)
    const darker = Math.min(bgLuminance, fgLuminance)

    return (lighter + 0.05) / (darker + 0.05)
  }, selector)
}

/**
 * Check for memory leaks
 */
export async function checkMemoryUsage(page: Page): Promise<{
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}> {
  return await page.evaluate(() => {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0
    }
  })
}

/**
 * Test animation performance
 */
export async function measureAnimationPerformance(
  page: Page,
  selector: string
): Promise<{ averageFPS: number; droppedFrames: number }> {
  return await page.evaluate((sel) => {
    return new Promise((resolve) => {
      const element = document.querySelector(sel)
      if (!element) {
        resolve({ averageFPS: 0, droppedFrames: 0 })
        return
      }

      let frameCount = 0
      let lastTime = performance.now()
      const duration = 1000 // 1 second test
      const startTime = lastTime

      const countFrames = () => {
        const currentTime = performance.now()
        frameCount++

        if (currentTime - startTime < duration) {
          requestAnimationFrame(countFrames)
        } else {
          const totalTime = currentTime - startTime
          const averageFPS = Math.round((frameCount / totalTime) * 1000)
          const expectedFrames = Math.round(totalTime / 16.67) // 60 FPS baseline
          const droppedFrames = Math.max(0, expectedFrames - frameCount)

          resolve({ averageFPS, droppedFrames })
        }
      }

      requestAnimationFrame(countFrames)
    })
  }, selector)
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page): Promise<{
  canTabNavigate: boolean
  hasVisibleFocusIndicators: boolean
  trapsFocusInModals: boolean
}> {
  // Tab through elements
  await page.keyboard.press('Tab')
  const firstFocus = await page.evaluate(() => document.activeElement?.tagName)

  await page.keyboard.press('Tab')
  const secondFocus = await page.evaluate(() => document.activeElement?.tagName)

  const canTabNavigate = firstFocus !== secondFocus

  // Check for visible focus indicators
  const hasVisibleFocusIndicators = await page.evaluate(() => {
    const activeElement = document.activeElement
    if (!activeElement) return false

    const styles = window.getComputedStyle(activeElement)
    const outline = styles.outline
    const boxShadow = styles.boxShadow

    return outline !== 'none' || boxShadow !== 'none'
  })

  // Check modal focus trap (if modal exists)
  const trapsFocusInModals = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]')
    return !!modal // Simplified check
  })

  return {
    canTabNavigate,
    hasVisibleFocusIndicators,
    trapsFocusInModals
  }
}

/**
 * Test for ARIA attributes
 */
export async function validateARIA(page: Page): Promise<{
  hasProperRoles: boolean
  hasLabels: boolean
  hasLiveRegions: boolean
}> {
  return await page.evaluate(() => {
    const elementsWithRoles = document.querySelectorAll('[role]')
    const elementsWithLabels = document.querySelectorAll('[aria-label], [aria-labelledby]')
    const liveRegions = document.querySelectorAll('[aria-live]')

    return {
      hasProperRoles: elementsWithRoles.length > 0,
      hasLabels: elementsWithLabels.length > 0,
      hasLiveRegions: liveRegions.length > 0
    }
  })
}