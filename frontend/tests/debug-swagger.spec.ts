import { test, expect } from '@playwright/test'

test('Debug Swagger UI loading', async ({ page }) => {
  await page.goto('http://localhost:3000/api/docs/')

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Log the page title
  const title = await page.title()
  console.log('Page title:', title)

  // Check if swagger-ui class exists
  const swaggerUI = await page.locator('.swagger-ui')
  const swaggerUIExists = await swaggerUI.count()
  console.log('Swagger UI elements found:', swaggerUIExists)

  // Find all h1 elements
  const h1Elements = await page.locator('h1').all()
  console.log('H1 elements count:', h1Elements.length)

  // Get text content of all h1 elements
  for (let i = 0; i < h1Elements.length; i++) {
    const text = await h1Elements[i].textContent()
    console.log(`H1 ${i}:`, text)
  }

  // Try to find info section
  const infoSection = await page.locator('.info')
  const infoExists = await infoSection.count()
  console.log('Info section found:', infoExists)

  if (infoExists > 0) {
    const infoTitle = await page.locator('.info .title')
    const titleExists = await infoTitle.count()
    console.log('Info title elements found:', titleExists)

    if (titleExists > 0) {
      const titleText = await infoTitle.textContent()
      console.log('Info title text:', titleText)
    }
  }

  // Wait a bit to see if content loads asynchronously
  await page.waitForTimeout(3000)

  // Check again
  const h1ElementsAfterWait = await page.locator('h1').all()
  console.log('H1 elements after wait:', h1ElementsAfterWait.length)

  for (let i = 0; i < h1ElementsAfterWait.length; i++) {
    const text = await h1ElementsAfterWait[i].textContent()
    console.log(`H1 after wait ${i}:`, text)
  }
})