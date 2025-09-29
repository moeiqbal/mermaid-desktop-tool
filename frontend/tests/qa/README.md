# QA Test Suite Documentation

Comprehensive QA test suite for the Mermaid Desktop Tool application.

## Overview

This QA test suite provides comprehensive coverage of critical features and bug fixes with:
- **Unit tests** for component functionality
- **Integration tests** for feature workflows
- **E2E tests** using Playwright
- **Visual regression test scenarios**
- **Cross-browser compatibility testing**
- **Performance benchmarks**

## Test Files

### 1. Theme Toggle Tests (`theme-toggle.spec.ts`)

**Feature Tested:** Dark mode toggle functionality

**Test Coverage:**
- Default theme on load (respecting system preference)
- Theme persistence in localStorage
- Theme switching functionality
- Theme switching in fullscreen mode
- Visual validation of theme changes
- No console errors during theme switching
- Keyboard accessibility
- Cross-browser compatibility

**Test Cases:** 25+ tests organized in 8 describe blocks

**Key Scenarios:**
```typescript
// Default theme based on system preference
test('should default to system preference when no saved theme')

// Persistence across reloads
test('should maintain theme after page reload')

// Accessibility
test('should be keyboard accessible')
```

**Run Command:**
```bash
cd frontend
npm run test:e2e -- tests/qa/theme-toggle.spec.ts
```

---

### 2. Mermaid Editor Tests (`mermaid-editor.spec.ts`)

**Feature Tested:** Mermaid diagram editor and rendering

**Test Coverage:**
- File upload and processing
- Diagram rendering accuracy
- Multiple diagram types support
- Real-time preview updates
- Error handling in editor
- Interactive controls (zoom, pan, fullscreen)
- Export functionality
- Responsive design
- Performance benchmarks

**Test Cases:** 30+ tests organized in 9 describe blocks

**Key Scenarios:**
```typescript
// File upload
test('should upload valid mermaid file successfully')

// Rendering
test('should render different diagram types')

// Error handling
test('should allow recovery from errors')

// Performance
test('should render diagrams within acceptable time')
```

**Run Command:**
```bash
cd frontend
npm run test:e2e -- tests/qa/mermaid-editor.spec.ts
```

---

### 3. HTML Export Fix Tests (`html-export-fix.spec.ts`)

**Feature Tested:** HTML export modal bug fixes

**Test Coverage:**
- Export modal positioning (no clipping/overflow)
- No horizontal scroll in exported content
- Responsive design on mobile/tablet/desktop
- Theme selection in export modal
- Dark mode toggle in export modal
- Export functionality with all theme options
- Modal accessibility and keyboard navigation
- Touch-friendly UI elements

**Test Cases:** 30+ tests organized in 8 describe blocks

**Key Scenarios:**
```typescript
// Modal positioning
test('should center modal in viewport')

// No horizontal scroll
test('should not have horizontal scroll in modal on mobile')

// Theme selection
test('should switch between theme options')

// Accessibility
test('should trap focus within modal')
```

**Run Command:**
```bash
cd frontend
npm run test:e2e -- tests/qa/html-export-fix.spec.ts
```

---

## Test Utilities

### `test-helpers.ts`

Common helper functions for tests:

**Key Functions:**
```typescript
// App lifecycle
waitForAppLoad(page: Page): Promise<void>
switchView(page: Page, view: string): Promise<void>

// Console errors
captureConsoleErrors(page: Page): Promise<string[]>
filterExpectedErrors(errors: string[]): string[]

// Storage
getLocalStorageItem(page: Page, key: string): Promise<string | null>
setLocalStorageItem(page: Page, key: string, value: string): Promise<void>

// Theme
hasDarkMode(page: Page): Promise<boolean>
getSystemColorScheme(page: Page): Promise<'light' | 'dark'>

// Viewport
setMobileViewport(page: Page): Promise<void>
setTabletViewport(page: Page): Promise<void>
setDesktopViewport(page: Page): Promise<void>

// Diagrams
isDiagramRendered(page: Page, selector: string): Promise<boolean>
getSVGContent(page: Page, selector: string): Promise<string | null>

// Modals
isModalOpen(page: Page): Promise<boolean>
closeModalByBackdrop(page: Page): Promise<void>
```

**Total Functions:** 40+ helper utilities

---

### `mock-data.ts`

Test fixtures and mock data:

**Key Exports:**
```typescript
// Mermaid diagrams
VALID_MERMAID_DIAGRAMS: {
  flowchart, sequenceDiagram, classDiagram, stateDiagram,
  erDiagram, gantt, pie, gitGraph
}

INVALID_MERMAID_DIAGRAMS: {
  syntaxError, unknownDiagramType, missingArrow, unclosedBracket
}

// YANG models
VALID_YANG_MODEL: string
INVALID_YANG_MODEL: string

// UI selectors
SELECTORS: {
  header, darkModeToggle, diagramContainer, exportButton, etc.
}

// Timing constants
TIMING: {
  animationDelay: 300,
  notificationAutoClose: 5000,
  apiTimeout: 10000
}

// Responsive breakpoints
BREAKPOINTS: {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
}
```

---

### `browser-utils.ts`

Browser-specific testing utilities:

**Key Functions:**
```typescript
// Browser detection
getBrowserType(page: Page): Promise<'chromium' | 'firefox' | 'webkit'>
isSafari(page: Page): Promise<boolean>

// Feature support
getBrowserFeatures(page: Page): Promise<BrowserFeatures>
getCSSFeatureSupport(page: Page): Promise<CSSFeatures>

// Performance
getPerformanceMetrics(page: Page): Promise<PerformanceData>
measureAnimationPerformance(page: Page, selector: string): Promise<FPSData>

// Accessibility
getContrastRatio(page: Page, selector: string): Promise<number>
testKeyboardNavigation(page: Page): Promise<NavigationResults>
validateARIA(page: Page): Promise<ARIAValidation>

// Responsive
testResponsiveLayout(page: Page, viewports: Viewport[]): Promise<LayoutResults[]>
```

---

## QA Validation Agent

### Usage

Run the comprehensive QA validation script:

```bash
# Full validation (all checks)
node scripts/qa-agent.js

# Verbose output
node scripts/qa-agent.js --verbose

# Include code coverage
node scripts/qa-agent.js --coverage

# Skip test execution (validation only)
node scripts/qa-agent.js --skip-tests

# Combined options
node scripts/qa-agent.js --verbose --coverage
```

### What It Checks

1. **Dependencies**
   - Node modules installed
   - Package versions

2. **Documentation**
   - README.md completeness
   - CLAUDE.md exists
   - API documentation

3. **Test Files**
   - All test files exist
   - Test utilities present

4. **Test Execution**
   - Unit tests (Vitest)
   - E2E tests (Playwright)
   - Test pass rates

5. **Code Coverage**
   - Overall coverage percentage
   - Target: 90%+

6. **API Endpoints**
   - Health check endpoint
   - Swagger documentation
   - API response codes

7. **Safari Compatibility**
   - Server-side detection
   - Compatibility page shown

8. **Console Errors**
   - No critical errors
   - Error log analysis

9. **Build Configuration**
   - Config files exist
   - Production build succeeds

### Exit Codes

- `0` - All checks passed
- `1` - Some checks failed or > 5 warnings

---

## Running Tests

### Run All QA Tests

```bash
cd frontend
npm run test:e2e -- tests/qa/
```

### Run Individual Test Suites

```bash
# Theme toggle tests
npm run test:e2e -- tests/qa/theme-toggle.spec.ts

# Mermaid editor tests
npm run test:e2e -- tests/qa/mermaid-editor.spec.ts

# HTML export tests
npm run test:e2e -- tests/qa/html-export-fix.spec.ts
```

### Run with UI Mode

```bash
npm run test:e2e:ui
```

### Run Specific Browser

```bash
# Chromium only
npm run test:e2e -- --project=chromium

# Firefox only
npm run test:e2e -- --project=firefox

# WebKit (Safari) only
npm run test:e2e -- --project=webkit
```

### Debug Mode

```bash
npm run test:e2e:debug -- tests/qa/theme-toggle.spec.ts
```

---

## Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Overall Coverage | 90% | TBD |
| Unit Tests | 95% | TBD |
| Integration Tests | 85% | TBD |
| E2E Tests | 80% | TBD |

---

## Test Scenarios

### Critical User Flows

1. **Dark Mode Toggle Flow**
   - Open app → Toggle dark mode → Reload page → Verify persistence

2. **Diagram Upload Flow**
   - Upload file → View diagram → Zoom/pan → Export

3. **HTML Export Flow**
   - Upload file → Open export modal → Select theme → Export HTML

4. **Error Recovery Flow**
   - Upload invalid file → See error → Upload valid file → Success

5. **Mobile Responsive Flow**
   - Switch to mobile viewport → Upload file → Interact → Verify layout

---

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: QA Tests

on: [push, pull_request]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci && cd frontend && npm ci
      - name: Start server
        run: docker-compose up -d app
      - name: Run QA validation
        run: node scripts/qa-agent.js --coverage
```

---

## Best Practices

### Writing New Tests

1. **Use descriptive test names**
   ```typescript
   test('should maintain theme after page reload')
   // Not: test('test 1')
   ```

2. **Use test utilities**
   ```typescript
   import { waitForAppLoad, hasDarkMode } from '../utils/test-helpers'
   ```

3. **Clean up after tests**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await clearLocalStorage(page)
   })
   ```

4. **Handle async operations**
   ```typescript
   await page.waitForTimeout(TIMING.animationDelay)
   ```

5. **Use proper assertions**
   ```typescript
   expect(result).toBe(true)
   // Not: if (result) { ... }
   ```

### Test Organization

- Group related tests in `describe` blocks
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Skip flaky tests with `.skip`
- Focus on specific tests with `.only` (during development)

---

## Troubleshooting

### Tests Timing Out

```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ...
})
```

### Flaky Tests

```typescript
// Add retries for flaky tests
test('flaky test', async ({ page }) => {
  test.fixme() // Mark as known issue
  // OR
  await page.waitForTimeout(TIMING.longWait)
})
```

### Server Not Running

```bash
# Ensure server is running
docker-compose up -d app

# Check server health
curl http://localhost:3000/api/health
```

### Port Already in Use

```bash
# Kill existing process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart server
docker-compose up -d app
```

---

## Contributing

When adding new features:

1. Add corresponding test file in `tests/qa/`
2. Update this README with test documentation
3. Add test utilities if needed
4. Update QA agent script with new checks
5. Ensure tests pass before PR

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## License

Same as parent project (see root LICENSE file)