# QA Test Agent - Quick Start Guide

## Prerequisites

1. **Docker running** (for app server)
2. **Node.js installed** (v18+)
3. **Dependencies installed**

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

## Quick Commands

### Run QA Validation Agent

```bash
# Full validation (recommended first run)
npm run qa:verbose

# Standard validation
npm run qa

# With coverage analysis
npm run qa:coverage

# Skip test execution (checks only)
npm run qa -- --skip-tests
```

### Run QA Test Suites

```bash
# All QA tests
npm run test:qa

# Individual test files
cd frontend
npm run test:e2e -- tests/qa/theme-toggle.spec.ts
npm run test:e2e -- tests/qa/mermaid-editor.spec.ts
npm run test:e2e -- tests/qa/html-export-fix.spec.ts

# Interactive UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug -- tests/qa/theme-toggle.spec.ts
```

## First Time Setup

### 1. Start the Application

```bash
# Using Docker (recommended)
docker-compose up -d app

# Verify server is running
curl http://localhost:3000/api/health
```

### 2. Run QA Validation

```bash
# First run with verbose output
npm run qa:verbose
```

Expected output:
```
████████████████████████████████████████████████████████████████████████████████
   MERMAID DESKTOP TOOL - QA VALIDATION AGENT
████████████████████████████████████████████████████████████████████████████████

ℹ Starting QA validation at 12/29/2025, 5:30:00 PM
ℹ Options: --verbose

================================================================================
  Checking Dependencies
================================================================================

✓ Node modules installed

================================================================================
  Checking Documentation Completeness
================================================================================

✓ README.md exists: 12450 bytes
✓ CLAUDE.md exists: 15230 bytes
...

================================================================================
  QA Validation Summary
================================================================================

Total checks: 25
✓ Passed: 23
⚠ Warnings: 2

✓ QA Validation: PASSED (92.0%)
```

### 3. Run Specific Tests

```bash
# Test dark mode toggle
cd frontend
npm run test:e2e -- tests/qa/theme-toggle.spec.ts

# Test mermaid editor
npm run test:e2e -- tests/qa/mermaid-editor.spec.ts

# Test HTML export
npm run test:e2e -- tests/qa/html-export-fix.spec.ts
```

## Understanding Test Results

### QA Agent Output

```
✓ = Check passed
✗ = Check failed
⚠ = Warning (non-critical)
ℹ = Information
```

### Playwright Output

```
Running 25 tests using 3 workers

 ✓ tests/qa/theme-toggle.spec.ts:12:5 › should default to system preference (1.2s)
 ✓ tests/qa/theme-toggle.spec.ts:25:5 › should respect saved light theme (980ms)
 ...

 25 passed (45.3s)
```

## Common Issues and Solutions

### Issue: Server not running

```bash
# Error: Connection refused to http://localhost:3000

# Solution: Start the server
docker-compose up -d app

# Wait 10 seconds for server to be ready
sleep 10

# Verify
curl http://localhost:3000/api/health
```

### Issue: Tests timing out

```typescript
// In test file, increase timeout
test('slow operation', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ...
})
```

### Issue: Port 3000 already in use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Restart server
docker-compose up -d app
```

### Issue: Node modules missing

```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Issue: Flaky tests

```bash
# Run tests with retries
cd frontend
npm run test:e2e -- --retries=2

# Or run specific test in debug mode
npm run test:e2e:debug -- tests/qa/theme-toggle.spec.ts
```

## Test Development Workflow

### 1. Create New Test

```typescript
// frontend/tests/qa/new-feature.spec.ts
import { test, expect } from '@playwright/test'
import { waitForAppLoad } from '../utils/test-helpers'
import { SELECTORS } from '../utils/mock-data'

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForAppLoad(page)
  })

  test('should work correctly', async ({ page }) => {
    // Your test here
  })
})
```

### 2. Run Your Test

```bash
cd frontend
npm run test:e2e -- tests/qa/new-feature.spec.ts --headed
```

### 3. Debug if Needed

```bash
npm run test:e2e:debug -- tests/qa/new-feature.spec.ts
```

### 4. Add to QA Agent

```javascript
// scripts/qa-agent.js
const CONFIG = {
  testSuites: [
    // ... existing tests
    { name: 'QA: New Feature', path: 'frontend/tests/qa/new-feature.spec.ts' }
  ]
}
```

## Useful Test Utilities

### Common Helpers

```typescript
import {
  waitForAppLoad,
  hasDarkMode,
  switchView,
  uploadFile,
  waitForNotification,
  setMobileViewport
} from '../utils/test-helpers'

import {
  VALID_MERMAID_DIAGRAMS,
  SELECTORS,
  TIMING
} from '../utils/mock-data'

import {
  getBrowserType,
  getPerformanceMetrics,
  testKeyboardNavigation
} from '../utils/browser-utils'
```

### Example Usage

```typescript
test('theme toggle', async ({ page }) => {
  await page.goto('/')
  await waitForAppLoad(page)

  // Check current theme
  const isDark = await hasDarkMode(page)

  // Toggle theme
  const toggle = page.locator(SELECTORS.darkModeToggle)
  await toggle.click()
  await page.waitForTimeout(TIMING.animationDelay)

  // Verify theme changed
  const isDarkAfter = await hasDarkMode(page)
  expect(isDarkAfter).toBe(!isDark)
})
```

## Viewing Test Reports

### Playwright Reports

```bash
# Run tests
cd frontend
npm run test:e2e

# View HTML report
npm run test:report

# Opens browser with interactive report showing:
# - Test results
# - Screenshots
# - Videos (on failure)
# - Traces
```

### Coverage Reports

```bash
# Generate coverage
npm run qa:coverage

# View coverage report
open frontend/coverage/index.html
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: QA Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  qa-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Start application
        run: docker-compose up -d app

      - name: Wait for server
        run: |
          timeout 120 bash -c 'until curl -f http://localhost:3000/api/health; do sleep 2; done'

      - name: Run QA validation
        run: npm run qa:verbose

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            frontend/playwright-report/
            frontend/test-results/
```

## Performance Tips

### Speed Up Tests

1. **Run in parallel**
   ```bash
   cd frontend
   npm run test:e2e -- --workers=4
   ```

2. **Run specific browsers only**
   ```bash
   npm run test:e2e -- --project=chromium
   ```

3. **Skip slow tests**
   ```typescript
   test.skip('slow test', async ({ page }) => {
     // This test won't run
   })
   ```

4. **Use test fixtures**
   ```bash
   # Create fixtures once
   mkdir -p test-fixtures
   echo "graph TD\nA-->B" > test-fixtures/simple.md
   ```

## Best Practices

### ✓ Do

- Use descriptive test names
- Use test utilities from `/utils`
- Clean up after tests (localStorage, files)
- Handle async operations properly
- Use proper assertions
- Add comments for complex logic

### ✗ Don't

- Hard-code timeouts (use TIMING constants)
- Ignore failing tests
- Skip cleanup
- Use brittle selectors
- Leave console.log statements
- Commit test recordings/screenshots

## Next Steps

1. **Run initial validation**: `npm run qa:verbose`
2. **Review results**: Check for any failures
3. **Fix issues**: Address failing tests
4. **Integrate into workflow**: Add to CI/CD
5. **Maintain**: Update tests as features change

## Support

- **Documentation**: See [QA_TEST_SUMMARY.md](./QA_TEST_SUMMARY.md)
- **Detailed Guide**: See [frontend/tests/qa/README.md](./frontend/tests/qa/README.md)
- **Test Utilities**: See [frontend/tests/utils/](./frontend/tests/utils/)

## Quick Reference Card

```bash
# Essential Commands
npm run qa              # Run QA validation
npm run test:qa         # Run QA tests
npm run test:e2e        # Run all E2E tests
npm run qa:coverage     # With coverage

# Development
npm run test:e2e:ui     # Interactive mode
npm run test:e2e:debug  # Debug specific test

# Server
docker-compose up -d app          # Start
docker-compose logs -f app        # View logs
curl localhost:3000/api/health    # Check health
docker-compose down               # Stop

# Troubleshooting
lsof -ti:3000 | xargs kill -9    # Kill port 3000
npm install                       # Reinstall deps
npm run build                     # Test build
```

---

**Happy Testing! 🧪**