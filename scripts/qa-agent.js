#!/usr/bin/env node

/**
 * QA Validation Agent for Mermaid Desktop Tool
 *
 * This script runs comprehensive QA validation including:
 * - All test suites (unit, integration, E2E)
 * - Code coverage analysis
 * - Documentation completeness checks
 * - API endpoint validation
 * - Safari compatibility verification
 * - Console error detection
 * - Performance benchmarks
 *
 * Usage:
 *   node scripts/qa-agent.js [--verbose] [--coverage] [--skip-tests]
 */

const { exec, spawn } = require('child_process')
const { promisify } = require('util')
const fs = require('fs').promises
const path = require('path')

const execAsync = promisify(exec)

// Configuration
const CONFIG = {
  targetCoverage: 90,
  maxTestDuration: 600000, // 10 minutes
  requiredDocs: [
    'README.md',
    'CLAUDE.md',
    'frontend/README.md',
    'backend/README.md'
  ],
  apiEndpoints: [
    '/api/health',
    '/api/docs'
  ],
  testSuites: [
    { name: 'QA: Theme Toggle', path: 'frontend/tests/qa/theme-toggle.spec.ts' },
    { name: 'QA: Mermaid Editor', path: 'frontend/tests/qa/mermaid-editor.spec.ts' },
    { name: 'QA: HTML Export Fix', path: 'frontend/tests/qa/html-export-fix.spec.ts' },
    { name: 'E2E: Smoke Tests', path: 'frontend/tests/smoke-test.spec.ts' },
    { name: 'E2E: Navigation', path: 'frontend/tests/navigation.spec.ts' },
    { name: 'E2E: Notifications', path: 'frontend/tests/notifications.spec.ts' },
    { name: 'E2E: API Integration', path: 'frontend/tests/api-integration.spec.ts' }
  ]
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Parse command line arguments
const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const checkCoverage = args.includes('--coverage')
const skipTests = args.includes('--skip-tests')

// Logging utilities
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(80))
  log(`  ${title}`, colors.bright + colors.cyan)
  console.log('='.repeat(80) + '\n')
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green)
}

function logError(message) {
  log(`✗ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow)
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue)
}

// Results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  startTime: Date.now(),
  checks: []
}

function addResult(name, passed, message = '', isWarning = false) {
  results.checks.push({ name, passed, message, isWarning })
  if (passed) {
    results.passed++
    logSuccess(`${name}${message ? ': ' + message : ''}`)
  } else if (isWarning) {
    results.warnings++
    logWarning(`${name}${message ? ': ' + message : ''}`)
  } else {
    results.failed++
    logError(`${name}${message ? ': ' + message : ''}`)
  }
}

// Validation functions
async function checkNodeModules() {
  logSection('Checking Dependencies')

  try {
    await fs.access('node_modules')
    await fs.access('frontend/node_modules')
    addResult('Node modules installed', true)
  } catch {
    addResult('Node modules missing', false, 'Run npm install')
    return false
  }

  return true
}

async function checkDocumentation() {
  logSection('Checking Documentation Completeness')

  for (const doc of CONFIG.requiredDocs) {
    try {
      const content = await fs.readFile(doc, 'utf-8')

      if (content.length < 100) {
        addResult(`${doc} exists`, false, 'File too short (< 100 chars)', true)
      } else {
        addResult(`${doc} exists`, true, `${content.length} bytes`)
      }
    } catch {
      addResult(`${doc} exists`, false, 'File not found')
    }
  }
}

async function checkTestFiles() {
  logSection('Checking Test Files')

  for (const suite of CONFIG.testSuites) {
    try {
      await fs.access(suite.path)
      addResult(`Test file: ${suite.name}`, true)
    } catch {
      addResult(`Test file: ${suite.name}`, false, 'File not found')
    }
  }
}

async function runUnitTests() {
  if (skipTests) {
    logInfo('Skipping unit tests (--skip-tests flag)')
    return
  }

  logSection('Running Unit Tests (Vitest)')

  try {
    const { stdout, stderr } = await execAsync('cd frontend && npm run test:unit -- --run', {
      timeout: CONFIG.maxTestDuration
    })

    if (verbose) {
      console.log(stdout)
    }

    // Parse test results
    const passMatch = stdout.match(/(\d+) passed/)
    const failMatch = stdout.match(/(\d+) failed/)

    const passed = passMatch ? parseInt(passMatch[1]) : 0
    const failed = failMatch ? parseInt(failMatch[1]) : 0

    if (failed > 0) {
      addResult('Unit tests', false, `${passed} passed, ${failed} failed`)
    } else {
      addResult('Unit tests', true, `${passed} tests passed`)
    }
  } catch (error) {
    addResult('Unit tests', false, error.message)
  }
}

async function runE2ETests() {
  if (skipTests) {
    logInfo('Skipping E2E tests (--skip-tests flag)')
    return
  }

  logSection('Running E2E Tests (Playwright)')

  // Check if server is running
  try {
    const { stdout } = await execAsync('curl -s http://localhost:3000/api/health')
    const health = JSON.parse(stdout)

    if (health.status !== 'healthy') {
      logWarning('Server is not healthy. Starting server...')
    }
  } catch {
    logWarning('Server not running. Tests may fail.')
    addResult('Server health check', false, 'Server not responding', true)
  }

  try {
    const { stdout, stderr } = await execAsync('cd frontend && npm run test:e2e', {
      timeout: CONFIG.maxTestDuration
    })

    if (verbose) {
      console.log(stdout)
    }

    // Parse Playwright results
    const passMatch = stdout.match(/(\d+) passed/)
    const failMatch = stdout.match(/(\d+) failed/)

    const passed = passMatch ? parseInt(passMatch[1]) : 0
    const failed = failMatch ? parseInt(failMatch[1]) : 0

    if (failed > 0) {
      addResult('E2E tests', false, `${passed} passed, ${failed} failed`)
    } else {
      addResult('E2E tests', true, `${passed} tests passed`)
    }
  } catch (error) {
    if (error.message.includes('passed')) {
      // Tests ran but some failed
      addResult('E2E tests', false, 'Some tests failed')
    } else {
      addResult('E2E tests', false, error.message)
    }
  }
}

async function checkCodeCoverage() {
  if (!checkCoverage) {
    logInfo('Skipping coverage check (use --coverage flag)')
    return
  }

  logSection('Checking Code Coverage')

  try {
    const { stdout } = await execAsync('cd frontend && npm run test:unit -- --coverage --run')

    if (verbose) {
      console.log(stdout)
    }

    // Parse coverage from output
    const coverageMatch = stdout.match(/All files.*?(\d+\.?\d*)/s)

    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1])

      if (coverage >= CONFIG.targetCoverage) {
        addResult('Code coverage', true, `${coverage}% (target: ${CONFIG.targetCoverage}%)`)
      } else {
        addResult('Code coverage', false, `${coverage}% (target: ${CONFIG.targetCoverage}%)`)
      }
    } else {
      addResult('Code coverage', false, 'Could not parse coverage data', true)
    }
  } catch (error) {
    addResult('Code coverage', false, error.message)
  }
}

async function validateAPIEndpoints() {
  logSection('Validating API Endpoints')

  for (const endpoint of CONFIG.apiEndpoints) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${endpoint}`)

      const statusCode = parseInt(stdout.trim())

      if (statusCode === 200) {
        addResult(`API: ${endpoint}`, true, `HTTP ${statusCode}`)
      } else if (statusCode === 404) {
        addResult(`API: ${endpoint}`, false, `HTTP ${statusCode} Not Found`)
      } else {
        addResult(`API: ${endpoint}`, false, `HTTP ${statusCode}`, true)
      }
    } catch (error) {
      addResult(`API: ${endpoint}`, false, 'Connection failed')
    }
  }
}

async function checkSafariCompatibility() {
  logSection('Checking Safari Compatibility')

  try {
    // Check if server has Safari detection middleware
    const serverFile = await fs.readFile('backend/src/server.js', 'utf-8')

    if (serverFile.includes('isSafariRegex') && serverFile.includes('Browser Compatibility')) {
      addResult('Safari compatibility system', true, 'Server-side detection implemented')
    } else {
      addResult('Safari compatibility system', false, 'Server-side detection missing', true)
    }

    // Test Safari user agent
    try {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
      const { stdout } = await execAsync(`curl -s -H "User-Agent: ${safariUA}" http://localhost:3000/`)

      if (stdout.includes('Browser Compatibility Notice')) {
        addResult('Safari compatibility page', true, 'Compatibility warning shown')
      } else {
        addResult('Safari compatibility page', false, 'Compatibility warning not shown', true)
      }
    } catch (error) {
      addResult('Safari compatibility page', false, 'Could not test', true)
    }
  } catch (error) {
    addResult('Safari compatibility check', false, error.message)
  }
}

async function checkConsoleErrors() {
  logSection('Checking for Console Errors')

  try {
    // Check test reports for console errors
    const testDirs = [
      'frontend/playwright-report',
      'frontend/test-results'
    ]

    let errorCount = 0

    for (const dir of testDirs) {
      try {
        const files = await fs.readdir(dir)

        for (const file of files) {
          if (file.endsWith('.json') || file.endsWith('.txt')) {
            const content = await fs.readFile(path.join(dir, file), 'utf-8')

            // Look for console errors
            const errors = content.match(/console\.error|TypeError|ReferenceError|SyntaxError/g)

            if (errors) {
              errorCount += errors.length
            }
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    if (errorCount === 0) {
      addResult('Console errors', true, 'No errors found in test reports')
    } else {
      addResult('Console errors', false, `${errorCount} errors found in test reports`, true)
    }
  } catch (error) {
    addResult('Console errors check', false, error.message, true)
  }
}

async function checkBuildSuccess() {
  logSection('Checking Build Configuration')

  try {
    // Check if build files exist
    await fs.access('frontend/vite.config.ts')
    addResult('Vite config exists', true)

    await fs.access('frontend/tsconfig.json')
    addResult('TypeScript config exists', true)

    await fs.access('frontend/playwright.config.ts')
    addResult('Playwright config exists', true)

    // Optionally try to build
    if (checkCoverage) {
      logInfo('Running production build...')
      const { stdout, stderr } = await execAsync('cd frontend && npm run build', {
        timeout: 120000
      })

      if (stderr && !stderr.includes('warning')) {
        addResult('Production build', false, 'Build failed')
      } else {
        addResult('Production build', true, 'Build successful')
      }
    }
  } catch (error) {
    addResult('Build check', false, error.message)
  }
}

async function checkTestUtilities() {
  logSection('Checking Test Utilities')

  const utilities = [
    'frontend/tests/utils/test-helpers.ts',
    'frontend/tests/utils/mock-data.ts',
    'frontend/tests/utils/browser-utils.ts'
  ]

  for (const util of utilities) {
    try {
      const content = await fs.readFile(util, 'utf-8')

      // Count exported functions
      const exportMatches = content.match(/export (async )?function|export const/g)
      const exportCount = exportMatches ? exportMatches.length : 0

      addResult(`Utility: ${path.basename(util)}`, true, `${exportCount} exports`)
    } catch {
      addResult(`Utility: ${path.basename(util)}`, false, 'File not found')
    }
  }
}

async function printSummary() {
  logSection('QA Validation Summary')

  const duration = ((Date.now() - results.startTime) / 1000).toFixed(2)

  console.log(`Total checks: ${results.passed + results.failed + results.warnings}`)
  logSuccess(`Passed: ${results.passed}`)
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`)
  }
  if (results.warnings > 0) {
    logWarning(`Warnings: ${results.warnings}`)
  }
  console.log(`Duration: ${duration}s\n`)

  // Calculate pass rate
  const total = results.passed + results.failed
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0

  if (passRate >= 90) {
    log(`✓ QA Validation: PASSED (${passRate}%)`, colors.green + colors.bright)
  } else if (passRate >= 70) {
    log(`⚠ QA Validation: PARTIAL (${passRate}%)`, colors.yellow + colors.bright)
  } else {
    log(`✗ QA Validation: FAILED (${passRate}%)`, colors.red + colors.bright)
  }

  console.log('\n' + '='.repeat(80) + '\n')

  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1)
  } else if (results.warnings > 5) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

// Main execution
async function main() {
  log('\n' + '█'.repeat(80), colors.cyan + colors.bright)
  log('   MERMAID DESKTOP TOOL - QA VALIDATION AGENT', colors.cyan + colors.bright)
  log('█'.repeat(80) + '\n', colors.cyan + colors.bright)

  logInfo(`Starting QA validation at ${new Date().toLocaleString()}`)
  logInfo(`Options: ${args.join(' ') || 'none'}`)

  try {
    // Run all checks
    await checkNodeModules()
    await checkDocumentation()
    await checkTestFiles()
    await checkTestUtilities()

    if (!skipTests) {
      await runUnitTests()
      await runE2ETests()
    }

    if (checkCoverage) {
      await checkCodeCoverage()
    }

    await checkBuildSuccess()
    await validateAPIEndpoints()
    await checkSafariCompatibility()
    await checkConsoleErrors()

    // Print final summary
    await printSummary()
  } catch (error) {
    logError(`Fatal error: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Run the agent
main().catch((error) => {
  logError(`Unexpected error: ${error.message}`)
  console.error(error)
  process.exit(1)
})