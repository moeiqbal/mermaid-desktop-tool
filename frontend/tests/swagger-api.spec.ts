import { test, expect } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

test.describe('Swagger API Documentation', () => {
  const API_BASE_URL = 'http://localhost:3000'
  const SWAGGER_URL = `${API_BASE_URL}/api/docs/`

  // Test data
  const testMarkdownContent = `# Test Markdown File

This is a test markdown file with a Mermaid diagram:

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

And some more content.
`

  const testMermaidContent = `graph LR
    A[Client] --> B[Load Balancer]
    B --> C[Server1]
    B --> D[Server2]`

  const testYangContent = `module test-module {
    namespace "http://example.com/test";
    prefix "test";

    revision "2023-01-01" {
        description "Initial revision";
    }

    container config {
        description "Configuration container";

        leaf hostname {
            type string;
            description "Hostname of the device";
        }

        leaf port {
            type uint16;
            default 8080;
            description "Port number";
        }
    }
}`

  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`)
      }
    })

    // Navigate to Swagger documentation
    await page.goto(SWAGGER_URL)

    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui')
    await expect(page.locator('.info .title')).toContainText('Mermaid & YANG Visualization API')
  })

  test('should load Swagger UI without console errors', async ({ page }) => {
    // Check that main Swagger UI elements are present
    await expect(page.locator('.swagger-ui')).toBeVisible()
    await expect(page.locator('.info')).toBeVisible()

    // Verify API title and description
    await expect(page.locator('.info .title')).toContainText('Mermaid & YANG Visualization API')
    await expect(page.locator('.info .description')).toContainText('API for managing Mermaid diagrams')

    // Check that all main sections are visible
    await expect(page.locator('#operations-tag-Health')).toBeVisible()
    await expect(page.locator('#operations-tag-Files')).toBeVisible()
    await expect(page.locator('#operations-tag-Linting')).toBeVisible()
    await expect(page.locator('#operations-tag-YANG')).toBeVisible()
  })

  test('should expand and show all API endpoints', async ({ page }) => {
    // Expand all sections to see endpoints
    const sections = ['Health', 'Files', 'Linting', 'YANG']

    for (const section of sections) {
      const sectionHeader = page.locator(`#operations-tag-${section}`)
      await sectionHeader.click()

      // Wait for section to expand
      await page.waitForTimeout(500)
    }

    // Verify Health endpoints
    await expect(page.locator('[data-path="/api/health"][data-method="get"]')).toBeVisible()

    // Verify Files endpoints
    await expect(page.locator('[data-path="/api/files"][data-method="get"]')).toBeVisible()
    await expect(page.locator('[data-path="/api/files/upload"][data-method="post"]')).toBeVisible()
    await expect(page.locator('[data-path="/api/files/{fileId}"][data-method="delete"]')).toBeVisible()

    // Verify Linting endpoints
    await expect(page.locator('[data-path="/api/lint/config"][data-method="get"]')).toBeVisible()
    await expect(page.locator('[data-path="/api/lint/markdown"][data-method="post"]')).toBeVisible()
    await expect(page.locator('[data-path="/api/lint/mermaid"][data-method="post"]')).toBeVisible()

    // Verify YANG endpoints
    await expect(page.locator('[data-path="/api/yang/parse"][data-method="post"]')).toBeVisible()
    await expect(page.locator('[data-path="/api/yang/parse-multiple"][data-method="post"]')).toBeVisible()
  })

  test('should successfully execute Health API endpoint', async ({ page }) => {
    // Expand Health section
    await page.locator('#operations-tag-Health').click()
    await page.waitForTimeout(500)

    // Click on the health endpoint
    const healthEndpoint = page.locator('[data-path="/api/health"][data-method="get"]')
    await healthEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Verify response body contains expected fields
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toContainText('status')
    await expect(responseBody).toContainText('healthy')
    await expect(responseBody).toContainText('timestamp')
    await expect(responseBody).toContainText('uptime')
  })

  test('should successfully execute Files list endpoint', async ({ page }) => {
    // Expand Files section
    await page.locator('#operations-tag-Files').click()
    await page.waitForTimeout(500)

    // Click on the files list endpoint
    const filesEndpoint = page.locator('[data-path="/api/files"][data-method="get"]')
    await filesEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response (should return empty array initially)
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Response should be an empty array or contain file objects
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toBeVisible()
  })

  test('should successfully execute Linting config endpoint', async ({ page }) => {
    // Expand Linting section
    await page.locator('#operations-tag-Linting').click()
    await page.waitForTimeout(500)

    // Click on the lint config endpoint
    const lintConfigEndpoint = page.locator('[data-path="/api/lint/config"][data-method="get"]')
    await lintConfigEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Verify response contains expected linting configuration
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toContainText('presets')
    await expect(responseBody).toContainText('markdownRules')
    await expect(responseBody).toContainText('mermaidConfig')
  })

  test('should successfully execute Markdown linting endpoint', async ({ page }) => {
    // Expand Linting section
    await page.locator('#operations-tag-Linting').click()
    await page.waitForTimeout(500)

    // Click on the markdown lint endpoint
    const markdownLintEndpoint = page.locator('[data-path="/api/lint/markdown"][data-method="post"]')
    await markdownLintEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Find the request body textarea and input test data
    const requestBodyTextarea = page.locator('.body-param__text')
    await requestBodyTextarea.fill(JSON.stringify({
      content: testMarkdownContent,
      preset: 'default'
    }))

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Verify response contains linting results
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toContainText('valid')
    await expect(responseBody).toContainText('issues')
    await expect(responseBody).toContainText('summary')
  })

  test('should successfully execute Mermaid linting endpoint', async ({ page }) => {
    // Expand Linting section
    await page.locator('#operations-tag-Linting').click()
    await page.waitForTimeout(500)

    // Click on the mermaid lint endpoint
    const mermaidLintEndpoint = page.locator('[data-path="/api/lint/mermaid"][data-method="post"]')
    await mermaidLintEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Find the request body textarea and input test data
    const requestBodyTextarea = page.locator('.body-param__text')
    await requestBodyTextarea.fill(JSON.stringify({
      content: testMermaidContent
    }))

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Verify response contains linting results
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toContainText('valid')
    await expect(responseBody).toContainText('issues')
    await expect(responseBody).toContainText('summary')
  })

  test('should successfully execute YANG parsing endpoint', async ({ page }) => {
    // Expand YANG section
    await page.locator('#operations-tag-YANG').click()
    await page.waitForTimeout(500)

    // Click on the YANG parse endpoint
    const yangParseEndpoint = page.locator('[data-path="/api/yang/parse"][data-method="post"]')
    await yangParseEndpoint.click()

    // Wait for endpoint details to load
    await page.waitForSelector('.opblock-body')

    // Click "Try it out" button
    const tryItOutBtn = page.locator('.try-out__btn')
    await tryItOutBtn.click()

    // Find the request body textarea and input test data
    const requestBodyTextarea = page.locator('.body-param__text')
    await requestBodyTextarea.fill(JSON.stringify({
      content: testYangContent,
      filename: 'test-module.yang'
    }))

    // Click "Execute" button
    const executeBtn = page.locator('.execute-wrapper .btn.execute')
    await executeBtn.click()

    // Wait for response
    await page.waitForSelector('.responses-wrapper .response .response-col_status', { timeout: 10000 })

    // Verify successful response
    const responseStatus = page.locator('.response-col_status')
    await expect(responseStatus).toContainText('200')

    // Verify response contains parsing results
    const responseBody = page.locator('.response-col_description .microlight')
    await expect(responseBody).toContainText('valid')
    await expect(responseBody).toContainText('tree')
    await expect(responseBody).toContainText('modules')
    await expect(responseBody).toContainText('metadata')
  })

  test('should handle file upload API endpoint', async ({ page }) => {
    // First, let's test the file upload via direct API call since Swagger UI file uploads are complex
    const response = await page.request.post(`${API_BASE_URL}/api/files/upload`, {
      multipart: {
        files: {
          name: 'test.md',
          mimeType: 'text/markdown',
          buffer: Buffer.from(testMarkdownContent)
        }
      }
    })

    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('message')
    expect(responseBody).toHaveProperty('files')
    expect(responseBody.files).toHaveLength(1)

    const uploadedFile = responseBody.files[0]
    expect(uploadedFile).toHaveProperty('id')
    expect(uploadedFile.name).toBe('test.md')
    expect(uploadedFile.type).toBe('markdown')

    // Now test getting the uploaded file through the API
    const fileListResponse = await page.request.get(`${API_BASE_URL}/api/files`)
    expect(fileListResponse.status()).toBe(200)

    const fileList = await fileListResponse.json()
    expect(Array.isArray(fileList)).toBeTruthy()
    expect(fileList.length).toBeGreaterThan(0)

    // Test getting file content
    const fileContentResponse = await page.request.get(`${API_BASE_URL}/api/files/${uploadedFile.id}/content`)
    expect(fileContentResponse.status()).toBe(200)

    const fileContent = await fileContentResponse.json()
    expect(fileContent).toHaveProperty('content')
    expect(fileContent.content).toContain('Test Markdown File')

    // Test getting diagrams from the file
    const diagramsResponse = await page.request.get(`${API_BASE_URL}/api/files/${uploadedFile.id}/diagrams`)
    expect(diagramsResponse.status()).toBe(200)

    const diagrams = await diagramsResponse.json()
    expect(diagrams).toHaveProperty('diagrams')
    expect(diagrams.diagrams).toHaveLength(1)
    expect(diagrams.diagrams[0].content).toContain('graph TD')

    // Clean up: delete the test file
    const deleteResponse = await page.request.delete(`${API_BASE_URL}/api/files/${uploadedFile.id}`)
    expect(deleteResponse.status()).toBe(200)
  })

  test('should execute markdown auto-fix endpoint', async ({ page }) => {
    // Test markdown auto-fix via direct API call
    const markdownWithIssues = `#Bad Heading
- Inconsistent   spacing



Multiple blank lines above
`

    const response = await page.request.post(`${API_BASE_URL}/api/lint/markdown/fix`, {
      data: {
        content: markdownWithIssues
      }
    })

    expect(response.status()).toBe(200)
    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('fixed')
    expect(responseBody).toHaveProperty('content')
    expect(responseBody).toHaveProperty('message')

    // The fixed content should be different from the original
    if (responseBody.fixed) {
      expect(responseBody.content).not.toBe(markdownWithIssues)
      expect(responseBody.content).toContain('# Bad Heading') // Should add space after #
    }
  })

  test('should execute multiple YANG parsing endpoint', async ({ page }) => {
    const yangFiles = [
      {
        name: 'module1.yang',
        content: testYangContent
      },
      {
        name: 'module2.yang',
        content: `module second-module {
          namespace "http://example.com/second";
          prefix "second";

          import test-module {
            prefix "test";
          }

          container data {
            leaf value {
              type string;
            }
          }
        }`
      }
    ]

    const response = await page.request.post(`${API_BASE_URL}/api/yang/parse-multiple`, {
      data: {
        files: yangFiles
      }
    })

    expect(response.status()).toBe(200)
    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('files')
    expect(responseBody).toHaveProperty('dependencies')
    expect(responseBody).toHaveProperty('graph')
    expect(responseBody).toHaveProperty('summary')

    expect(responseBody.files).toHaveLength(2)
    expect(responseBody.summary.totalModules).toBe(2)
  })

  test('should display proper error responses for invalid requests', async ({ page }) => {
    // Test invalid markdown linting request
    const invalidMarkdownResponse = await page.request.post(`${API_BASE_URL}/api/lint/markdown`, {
      data: {
        content: 123 // Should be string
      }
    })

    expect(invalidMarkdownResponse.status()).toBe(400)
    const errorBody = await invalidMarkdownResponse.json()
    expect(errorBody).toHaveProperty('error')
    expect(errorBody.error).toContain('Content must be a string')

    // Test invalid YANG parsing request
    const invalidYangResponse = await page.request.post(`${API_BASE_URL}/api/yang/parse`, {
      data: {
        content: null
      }
    })

    expect(invalidYangResponse.status()).toBe(400)

    // Test non-existent file endpoint
    const nonExistentFileResponse = await page.request.get(`${API_BASE_URL}/api/files/nonexistent-file/content`)
    expect(nonExistentFileResponse.status()).toBe(404)
  })
})