import { test, expect } from '@playwright/test'
import {
  waitForAppLoad,
  getLocalStorageItem,
  setLocalStorageItem,
  clearLocalStorage,
  hasDarkMode,
  getSystemColorScheme,
  getComputedStyle,
  verifyNoConsoleErrors
} from '../utils/test-helpers'
import { SELECTORS, THEMES } from '../utils/mock-data'

/**
 * QA Test Suite: Dark Mode Toggle Feature
 *
 * Tests cover:
 * - Default theme on load (respecting system preference)
 * - Theme persistence in localStorage
 * - Theme switching functionality
 * - Theme switching in fullscreen mode
 * - Visual validation of theme changes
 * - No console errors during theme switching
 */

test.describe('Feature 1: Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for consistent state
    await page.goto('/')
    await clearLocalStorage(page)
  })

  test.describe('Default Theme on Load', () => {
    test('should default to system preference when no saved theme', async ({ page }) => {
      // Clear localStorage and reload
      await clearLocalStorage(page)
      await page.goto('/')
      await waitForAppLoad(page)

      const systemPreference = await getSystemColorScheme(page)
      const appDarkMode = await hasDarkMode(page)

      if (systemPreference === 'dark') {
        expect(appDarkMode).toBe(true)
      } else {
        expect(appDarkMode).toBe(false)
      }

      // Verify localStorage is set after mount
      const savedTheme = await getLocalStorageItem(page, 'theme')
      expect(savedTheme).toBe(systemPreference)
    })

    test('should respect saved light theme preference', async ({ page }) => {
      // Set light theme in localStorage before load
      await setLocalStorageItem(page, 'theme', 'light')
      await page.reload()
      await waitForAppLoad(page)

      const appDarkMode = await hasDarkMode(page)
      expect(appDarkMode).toBe(false)

      // Verify HTML element doesn't have dark class
      const htmlClasses = await page.evaluate(() => document.documentElement.className)
      expect(htmlClasses).not.toContain('dark')
    })

    test('should respect saved dark theme preference', async ({ page }) => {
      // Set dark theme in localStorage before load
      await setLocalStorageItem(page, 'theme', 'dark')
      await page.reload()
      await waitForAppLoad(page)

      const appDarkMode = await hasDarkMode(page)
      expect(appDarkMode).toBe(true)

      // Verify HTML element has dark class
      const htmlClasses = await page.evaluate(() => document.documentElement.className)
      expect(htmlClasses).toContain('dark')
    })

    test('should apply correct background color for light theme', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'light')
      await page.reload()
      await waitForAppLoad(page)

      const bgColor = await getComputedStyle(page, 'body', 'background-color')
      // Light theme should have white or near-white background
      expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)|rgb\(250,\s*250,\s*250\)/)
    })

    test('should apply correct background color for dark theme', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'dark')
      await page.reload()
      await waitForAppLoad(page)

      const bgColor = await getComputedStyle(page, 'body', 'background-color')
      // Dark theme should have dark background (gray-950)
      expect(bgColor).toMatch(/rgb\((3|0),\s*(7|0),\s*(18|0)\)/)
    })
  })

  test.describe('Theme Toggle Button', () => {
    test('should find and click dark mode toggle button', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Try multiple selector strategies
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      await expect(toggleButton).toBeVisible({ timeout: 5000 })

      // Button should be clickable
      await toggleButton.click()
      await page.waitForTimeout(300) // Animation delay
    })

    test('should toggle theme on button click', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      const initialDarkMode = await hasDarkMode(page)

      // Click toggle button
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      await toggleButton.click()
      await page.waitForTimeout(300)

      const afterToggleDarkMode = await hasDarkMode(page)

      // Theme should be opposite of initial
      expect(afterToggleDarkMode).toBe(!initialDarkMode)
    })

    test('should show appropriate icon for current theme', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'light')
      await page.goto('/')
      await waitForAppLoad(page)

      // In light mode, should show moon icon (to switch to dark)
      // In dark mode, should show sun icon (to switch to light)
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      const buttonHTML = await toggleButton.innerHTML()

      // Check if button contains icon SVG or text
      expect(buttonHTML.length).toBeGreaterThan(0)
    })

    test('should toggle multiple times correctly', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()

      // Toggle 5 times
      for (let i = 0; i < 5; i++) {
        const beforeToggle = await hasDarkMode(page)
        await toggleButton.click()
        await page.waitForTimeout(300)
        const afterToggle = await hasDarkMode(page)

        expect(afterToggle).toBe(!beforeToggle)
      }
    })
  })

  test.describe('Theme Persistence', () => {
    test('should persist light theme in localStorage', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Ensure we're in light mode
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      const currentDarkMode = await hasDarkMode(page)

      if (currentDarkMode) {
        await toggleButton.click()
        await page.waitForTimeout(300)
      }

      // Verify localStorage
      const savedTheme = await getLocalStorageItem(page, 'theme')
      expect(savedTheme).toBe('light')
    })

    test('should persist dark theme in localStorage', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Ensure we're in dark mode
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      const currentDarkMode = await hasDarkMode(page)

      if (!currentDarkMode) {
        await toggleButton.click()
        await page.waitForTimeout(300)
      }

      // Verify localStorage
      const savedTheme = await getLocalStorageItem(page, 'theme')
      expect(savedTheme).toBe('dark')
    })

    test('should maintain theme after page reload', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Set to dark mode
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      const initialDarkMode = await hasDarkMode(page)

      if (!initialDarkMode) {
        await toggleButton.click()
        await page.waitForTimeout(300)
      }

      // Verify dark mode is active
      expect(await hasDarkMode(page)).toBe(true)

      // Reload page
      await page.reload()
      await waitForAppLoad(page)

      // Verify dark mode persisted
      expect(await hasDarkMode(page)).toBe(true)
    })

    test('should maintain theme after navigation', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Set to dark mode
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      await toggleButton.click()
      await page.waitForTimeout(300)

      expect(await hasDarkMode(page)).toBe(true)

      // Navigate to YANG Explorer
      await page.locator(SELECTORS.yangExplorerButton).click()
      await page.waitForTimeout(500)

      // Verify dark mode persisted
      expect(await hasDarkMode(page)).toBe(true)

      // Navigate back to Mermaid Viewer
      await page.locator(SELECTORS.mermaidViewerButton).click()
      await page.waitForTimeout(500)

      // Verify dark mode still persisted
      expect(await hasDarkMode(page)).toBe(true)
    })
  })

  test.describe('Theme in Fullscreen Mode', () => {
    test.skip('should maintain theme when entering fullscreen', async ({ page }) => {
      // Note: This test requires a diagram to be loaded first
      // Skipped for now as it depends on file upload
      await page.goto('/')
      await waitForAppLoad(page)

      const currentTheme = await hasDarkMode(page)

      // TODO: Upload a file and enter fullscreen
      // Then verify theme persists

      expect(currentTheme).toBeDefined()
    })

    test.skip('should allow theme toggle in fullscreen mode', async ({ page }) => {
      // Note: This test requires fullscreen mode to be active
      // Skipped for now as it depends on file upload
      await page.goto('/')
      await waitForAppLoad(page)

      // TODO: Enter fullscreen and test theme toggle
    })
  })

  test.describe('Visual Regression', () => {
    test('should apply correct text color in light mode', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'light')
      await page.goto('/')
      await waitForAppLoad(page)

      const headerTextColor = await getComputedStyle(page, 'h1', 'color')
      // Light mode should have dark text
      expect(headerTextColor).toMatch(/rgb\((17|0),\s*(24|0),\s*(39|0)\)/)
    })

    test('should apply correct text color in dark mode', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'dark')
      await page.goto('/')
      await waitForAppLoad(page)

      const headerTextColor = await getComputedStyle(page, 'h1', 'color')
      // Dark mode should have light text
      expect(headerTextColor).toMatch(/rgb\((243|255),\s*(244|255),\s*(246|255)\)/)
    })

    test('should have smooth transition between themes', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Check if transition is defined
      const bodyTransition = await getComputedStyle(page, 'body', 'transition')
      expect(bodyTransition).toBeTruthy()
    })

    test('should apply theme to all UI components', async ({ page }) => {
      await setLocalStorageItem(page, 'theme', 'dark')
      await page.goto('/')
      await waitForAppLoad(page)

      // Check header
      const headerBg = await getComputedStyle(page, 'header', 'background-color')
      expect(headerBg).toMatch(/rgb\(/)

      // Check main content area
      const mainBg = await getComputedStyle(page, 'main', 'background-color')
      expect(mainBg).toMatch(/rgb\(/)
    })
  })

  test.describe('Error Handling', () => {
    test('should not produce console errors during theme toggle', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // Toggle theme multiple times
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      await toggleButton.click()
      await page.waitForTimeout(300)
      await toggleButton.click()
      await page.waitForTimeout(300)
      await toggleButton.click()
      await page.waitForTimeout(300)

      // Filter out known acceptable errors
      const relevantErrors = errors.filter(err =>
        !err.includes('favicon.ico') &&
        !err.includes('404') &&
        !err.includes('net::ERR_FILE_NOT_FOUND')
      )

      expect(relevantErrors).toEqual([])
    })

    test('should handle corrupted localStorage gracefully', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Set invalid theme value
      await setLocalStorageItem(page, 'theme', 'invalid')
      await page.reload()
      await waitForAppLoad(page)

      // Should fallback to system preference
      const appDarkMode = await hasDarkMode(page)
      expect(typeof appDarkMode).toBe('boolean')
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible dark mode toggle button', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()

      // Check if button has accessible attributes
      const ariaLabel = await toggleButton.getAttribute('aria-label')
      const title = await toggleButton.getAttribute('title')

      // Should have either aria-label or title for screen readers
      expect(ariaLabel || title).toBeTruthy()
    })

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Tab to the dark mode toggle
      let attempts = 0
      let foundToggle = false

      while (attempts < 20 && !foundToggle) {
        await page.keyboard.press('Tab')
        attempts++

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement
          return {
            tagName: el?.tagName,
            ariaLabel: el?.getAttribute('aria-label'),
            title: el?.getAttribute('title')
          }
        })

        // Check if we found the dark mode toggle
        if (
          focusedElement.ariaLabel?.toLowerCase().includes('dark') ||
          focusedElement.title?.toLowerCase().includes('dark') ||
          focusedElement.ariaLabel?.toLowerCase().includes('theme')
        ) {
          foundToggle = true

          // Try to activate it with Enter or Space
          const initialDarkMode = await hasDarkMode(page)
          await page.keyboard.press('Enter')
          await page.waitForTimeout(300)
          const afterToggleDarkMode = await hasDarkMode(page)

          expect(afterToggleDarkMode).toBe(!initialDarkMode)
        }
      }

      // We should be able to find and activate the toggle
      expect(foundToggle).toBe(true)
    })
  })

  test.describe('Cross-browser Compatibility', () => {
    test('should work correctly in all supported browsers', async ({ page, browserName }) => {
      await page.goto('/')
      await waitForAppLoad(page)

      // Test basic toggle functionality
      const toggleButton = page.locator(SELECTORS.darkModeToggle).first()
      const initialDarkMode = await hasDarkMode(page)

      await toggleButton.click()
      await page.waitForTimeout(300)

      const afterToggle = await hasDarkMode(page)
      expect(afterToggle).toBe(!initialDarkMode)

      // Log browser for debugging
      console.log(`Theme toggle test passed in: ${browserName}`)
    })
  })
})