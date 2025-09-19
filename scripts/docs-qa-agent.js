#!/usr/bin/env node

/**
 * Documentation Quality Assurance Agent
 * Comprehensive documentation checking and validation system
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// Configuration
const CONFIG = {
  // File patterns to check
  patterns: {
    documentation: ['**/*.md', '**/*.mdx', '**/README.*'],
    code: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.vue'],
    config: ['**/*.json', '**/*.yml', '**/*.yaml', '**/*.toml'],
    scripts: ['**/*.sh', '**/*.bash', 'scripts/**/*']
  },

  // Directories to exclude
  exclude: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    'playwright-report',
    'test-results'
  ],

  // Quality scoring weights
  weights: {
    completeness: 0.3,
    accuracy: 0.25,
    consistency: 0.2,
    accessibility: 0.15,
    maintenance: 0.1
  },

  // Link checking
  linkTimeout: 5000,
  maxRedirects: 5,

  // Documentation requirements
  requirements: {
    minReadmeLength: 500,
    requireChangeLog: true,
    requireLicense: true,
    requireContributing: false,
    jsDocCoverage: 0.8
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Documentation QA Agent class
 */
class DocsQAAgent {
  constructor() {
    this.results = {
      completeness: { score: 0, issues: [], checks: 0 },
      accuracy: { score: 0, issues: [], checks: 0 },
      consistency: { score: 0, issues: [], checks: 0 },
      accessibility: { score: 0, issues: [], checks: 0 },
      maintenance: { score: 0, issues: [], checks: 0 }
    };

    this.files = {
      documentation: [],
      code: [],
      config: [],
      scripts: []
    };

    this.links = new Map();
  }

  /**
   * Find files matching patterns
   */
  findFiles() {
    logInfo('🔍 Scanning files...');

    for (const [category, patterns] of Object.entries(CONFIG.patterns)) {
      this.files[category] = [];

      for (const pattern of patterns) {
        try {
          const command = `find . -name "${pattern.replace('**/', '')}" -type f | head -1000`;
          const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

          const files = output.trim().split('\n')
            .filter(file => file && !CONFIG.exclude.some(exclude => file.includes(exclude)))
            .map(file => path.resolve(file));

          this.files[category].push(...files);
        } catch (error) {
          // Silent fail for pattern matching
        }
      }

      // Remove duplicates
      this.files[category] = [...new Set(this.files[category])];
      logInfo(`Found ${this.files[category].length} ${category} files`);
    }
  }

  /**
   * Check documentation completeness
   */
  checkCompleteness() {
    logInfo('📋 Checking documentation completeness...');

    const checks = [
      this.checkReadmeExists.bind(this),
      this.checkReadmeQuality.bind(this),
      this.checkChangelogExists.bind(this),
      this.checkLicenseExists.bind(this),
      this.checkApiDocumentation.bind(this),
      this.checkCodeDocumentation.bind(this),
      this.checkInstallationInstructions.bind(this),
      this.checkUsageExamples.bind(this),
      this.checkTroubleshooting.bind(this)
    ];

    let passed = 0;
    for (const check of checks) {
      if (check()) passed++;
    }

    this.results.completeness.score = (passed / checks.length) * 100;
    this.results.completeness.checks = checks.length;

    logInfo(`Completeness: ${this.results.completeness.score.toFixed(1)}% (${passed}/${checks.length})`);
  }

  checkReadmeExists() {
    const readmeFiles = this.files.documentation.filter(file =>
      path.basename(file).toLowerCase().startsWith('readme')
    );

    if (readmeFiles.length === 0) {
      this.results.completeness.issues.push('Missing README file');
      return false;
    }
    return true;
  }

  checkReadmeQuality() {
    const readmeFiles = this.files.documentation.filter(file =>
      path.basename(file).toLowerCase().startsWith('readme')
    );

    if (readmeFiles.length === 0) return false;

    try {
      const content = fs.readFileSync(readmeFiles[0], 'utf8');

      if (content.length < CONFIG.requirements.minReadmeLength) {
        this.results.completeness.issues.push(
          `README is too short (${content.length} chars, minimum ${CONFIG.requirements.minReadmeLength})`
        );
        return false;
      }

      const requiredSections = ['installation', 'usage', 'features'];
      const missingSections = requiredSections.filter(section =>
        !content.toLowerCase().includes(section)
      );

      if (missingSections.length > 0) {
        this.results.completeness.issues.push(
          `README missing sections: ${missingSections.join(', ')}`
        );
        return false;
      }

      return true;
    } catch (error) {
      this.results.completeness.issues.push(`Error reading README: ${error.message}`);
      return false;
    }
  }

  checkChangelogExists() {
    const changelogFiles = this.files.documentation.filter(file =>
      /changelog|changes|history/i.test(path.basename(file))
    );

    if (CONFIG.requirements.requireChangeLog && changelogFiles.length === 0) {
      this.results.completeness.issues.push('Missing CHANGELOG file');
      return false;
    }
    return true;
  }

  checkLicenseExists() {
    const licenseFiles = this.files.documentation.filter(file =>
      /license|copying/i.test(path.basename(file))
    );

    if (CONFIG.requirements.requireLicense && licenseFiles.length === 0) {
      this.results.completeness.issues.push('Missing LICENSE file');
      return false;
    }
    return true;
  }

  checkApiDocumentation() {
    // Check if API endpoints are documented
    const backendFiles = this.files.code.filter(file =>
      file.includes('/backend/') && file.includes('/routes/')
    );

    if (backendFiles.length === 0) return true; // No backend, no API to document

    let hasApiDocs = false;

    // Look for OpenAPI/Swagger documentation
    for (const file of this.files.code) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('swagger') || content.includes('openapi') ||
            content.includes('@swagger') || content.includes('api-docs')) {
          hasApiDocs = true;
          break;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (!hasApiDocs) {
      this.results.completeness.issues.push('API endpoints lack documentation');
      return false;
    }

    return true;
  }

  checkCodeDocumentation() {
    let totalFunctions = 0;
    let documentedFunctions = 0;

    for (const file of this.files.code) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count functions/methods
        const functionMatches = content.match(/(function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*{|export\s+(function|const)\s+\w+)/g);
        if (functionMatches) {
          totalFunctions += functionMatches.length;

          // Count documented functions (JSDoc style)
          const docMatches = content.match(/\/\*\*[\s\S]*?\*\/\s*(function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|export\s+(function|const)\s+\w+)/g);
          if (docMatches) {
            documentedFunctions += docMatches.length;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const coverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) : 1;

    if (coverage < CONFIG.requirements.jsDocCoverage) {
      this.results.completeness.issues.push(
        `Low code documentation coverage: ${(coverage * 100).toFixed(1)}% (target: ${CONFIG.requirements.jsDocCoverage * 100}%)`
      );
      return false;
    }

    return true;
  }

  checkInstallationInstructions() {
    const hasInstallDocs = this.files.documentation.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return /install|setup|getting.started/i.test(content);
      } catch (error) {
        return false;
      }
    });

    if (!hasInstallDocs) {
      this.results.completeness.issues.push('Missing installation/setup instructions');
      return false;
    }

    return true;
  }

  checkUsageExamples() {
    const hasExamples = this.files.documentation.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return /example|usage|how.to/i.test(content) && /```/.test(content);
      } catch (error) {
        return false;
      }
    });

    if (!hasExamples) {
      this.results.completeness.issues.push('Missing usage examples with code blocks');
      return false;
    }

    return true;
  }

  checkTroubleshooting() {
    const hasTroubleshooting = this.files.documentation.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return /troubleshoot|faq|common.issues|problems/i.test(content);
      } catch (error) {
        return false;
      }
    });

    if (!hasTroubleshooting) {
      this.results.completeness.issues.push('Missing troubleshooting guide');
      return false;
    }

    return true;
  }

  /**
   * Check documentation accuracy
   */
  checkAccuracy() {
    logInfo('🎯 Checking documentation accuracy...');

    const checks = [
      this.checkLinks.bind(this),
      this.checkCodeExamples.bind(this),
      this.checkVersionConsistency.bind(this),
      this.checkApiDocSync.bind(this)
    ];

    let passed = 0;
    for (const check of checks) {
      if (check()) passed++;
    }

    this.results.accuracy.score = (passed / checks.length) * 100;
    this.results.accuracy.checks = checks.length;

    logInfo(`Accuracy: ${this.results.accuracy.score.toFixed(1)}% (${passed}/${checks.length})`);
  }

  async checkLinks() {
    logInfo('🔗 Validating links...');

    // Extract links from documentation
    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);

        if (linkMatches) {
          for (const match of linkMatches) {
            const urlMatch = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (urlMatch) {
              const url = urlMatch[2];
              if (!this.links.has(url)) {
                this.links.set(url, { files: [file], status: 'pending' });
              } else {
                this.links.get(url).files.push(file);
              }
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    let validLinks = 0;
    let totalLinks = this.links.size;

    // Validate each unique link
    for (const [url, info] of this.links.entries()) {
      const isValid = await this.validateLink(url);
      this.links.set(url, { ...info, status: isValid ? 'valid' : 'invalid' });

      if (isValid) {
        validLinks++;
      } else {
        this.results.accuracy.issues.push(`Invalid link: ${url} (found in ${info.files.length} files)`);
      }
    }

    logInfo(`Link validation: ${validLinks}/${totalLinks} links valid`);
    return totalLinks === 0 || (validLinks / totalLinks) >= 0.9;
  }

  async validateLink(url) {
    // Skip internal links and fragments
    if (url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) {
      return true; // Assume internal links are valid
    }

    // Skip mailto links
    if (url.startsWith('mailto:')) {
      return true;
    }

    // Validate HTTP(S) links
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new Promise((resolve) => {
        try {
          const urlObj = new URL(url);
          const client = urlObj.protocol === 'https:' ? https : http;

          const req = client.request(url, { method: 'HEAD', timeout: CONFIG.linkTimeout }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
          });

          req.on('error', () => resolve(false));
          req.on('timeout', () => {
            req.destroy();
            resolve(false);
          });

          req.end();
        } catch (error) {
          resolve(false);
        }
      });
    }

    return true; // Default to valid for other protocols
  }

  checkCodeExamples() {
    // This is a simplified check - in practice, you'd want to actually run the code
    let validExamples = 0;
    let totalExamples = 0;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const codeBlocks = content.match(/```[\s\S]*?```/g);

        if (codeBlocks) {
          totalExamples += codeBlocks.length;

          for (const block of codeBlocks) {
            // Basic syntax validation
            const lang = block.match(/```(\w+)/);
            if (lang) {
              const code = block.replace(/```\w*\n/, '').replace(/\n```$/, '');

              // Very basic syntax check
              if (lang[1] === 'javascript' || lang[1] === 'js') {
                try {
                  // This is a very basic check - doesn't actually execute
                  if (code.trim() && !code.includes('undefined_function')) {
                    validExamples++;
                  }
                } catch (error) {
                  // Invalid syntax
                }
              } else {
                // Assume non-JS examples are valid if they have content
                if (code.trim()) {
                  validExamples++;
                }
              }
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (totalExamples > 0 && (validExamples / totalExamples) < 0.8) {
      this.results.accuracy.issues.push(
        `${totalExamples - validExamples} potentially invalid code examples found`
      );
      return false;
    }

    return true;
  }

  checkVersionConsistency() {
    const versions = new Set();

    // Check package.json files
    for (const file of this.files.config) {
      if (path.basename(file) === 'package.json') {
        try {
          const content = JSON.parse(fs.readFileSync(file, 'utf8'));
          if (content.version) {
            versions.add(content.version);
          }
        } catch (error) {
          // Skip invalid JSON files
        }
      }
    }

    // Check if documentation mentions consistent versions
    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const versionMatches = content.match(/v?\d+\.\d+\.\d+/g);
        if (versionMatches) {
          for (const version of versionMatches) {
            versions.add(version.replace(/^v/, ''));
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (versions.size > 3) { // Allow some version references, but not too many different ones
      this.results.accuracy.issues.push(`Inconsistent version numbers found: ${Array.from(versions).join(', ')}`);
      return false;
    }

    return true;
  }

  checkApiDocSync() {
    // This would check if API documentation matches actual API implementation
    // Simplified for now
    return true;
  }

  /**
   * Check documentation consistency
   */
  checkConsistency() {
    logInfo('📐 Checking documentation consistency...');

    const checks = [
      this.checkMarkdownFormatting.bind(this),
      this.checkTerminologyConsistency.bind(this),
      this.checkStyleConsistency.bind(this),
      this.checkStructureConsistency.bind(this)
    ];

    let passed = 0;
    for (const check of checks) {
      if (check()) passed++;
    }

    this.results.consistency.score = (passed / checks.length) * 100;
    this.results.consistency.checks = checks.length;

    logInfo(`Consistency: ${this.results.consistency.score.toFixed(1)}% (${passed}/${checks.length})`);
  }

  checkMarkdownFormatting() {
    let consistentFiles = 0;
    let totalFiles = this.files.documentation.length;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for consistent header formatting
        const headers = content.match(/^#+\s+.+$/gm);
        if (headers) {
          const inconsistentHeaders = headers.filter(header =>
            !/^#{1,6}\s+[A-Z]/.test(header) // Headers should start with capital letter
          );

          if (inconsistentHeaders.length === 0) {
            consistentFiles++;
          } else {
            this.results.consistency.issues.push(
              `${path.basename(file)}: Inconsistent header formatting`
            );
          }
        } else {
          consistentFiles++; // No headers is consistent
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return totalFiles === 0 || (consistentFiles / totalFiles) >= 0.8;
  }

  checkTerminologyConsistency() {
    // Check for consistent use of terms across documentation
    const terms = new Map();
    const variations = new Map();

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();

        // Check for common term variations
        const termPairs = [
          ['javascript', 'js'],
          ['typescript', 'ts'],
          ['command line', 'cli'],
          ['configuration', 'config'],
          ['documentation', 'docs']
        ];

        for (const [term1, term2] of termPairs) {
          const count1 = (content.match(new RegExp(term1, 'g')) || []).length;
          const count2 = (content.match(new RegExp(term2, 'g')) || []).length;

          if (count1 > 0 && count2 > 0) {
            if (!variations.has(`${term1}/${term2}`)) {
              variations.set(`${term1}/${term2}`, 0);
            }
            variations.set(`${term1}/${term2}`, variations.get(`${term1}/${term2}`) + 1);
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (variations.size > 0) {
      for (const [terms, count] of variations.entries()) {
        this.results.consistency.issues.push(
          `Inconsistent terminology: ${terms} used interchangeably in ${count} contexts`
        );
      }
      return false;
    }

    return true;
  }

  checkStyleConsistency() {
    // Check for consistent writing style
    return true; // Simplified for now
  }

  checkStructureConsistency() {
    // Check if documentation files follow consistent structure
    return true; // Simplified for now
  }

  /**
   * Check accessibility
   */
  checkAccessibility() {
    logInfo('♿ Checking accessibility...');

    const checks = [
      this.checkImageAltText.bind(this),
      this.checkHeadingHierarchy.bind(this),
      this.checkReadability.bind(this)
    ];

    let passed = 0;
    for (const check of checks) {
      if (check()) passed++;
    }

    this.results.accessibility.score = (passed / checks.length) * 100;
    this.results.accessibility.checks = checks.length;

    logInfo(`Accessibility: ${this.results.accessibility.score.toFixed(1)}% (${passed}/${checks.length})`);
  }

  checkImageAltText() {
    let imagesWithAlt = 0;
    let totalImages = 0;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const images = content.match(/!\[([^\]]*)\]\([^)]+\)/g);

        if (images) {
          totalImages += images.length;

          for (const image of images) {
            const altMatch = image.match(/!\[([^\]]*)\]/);
            if (altMatch && altMatch[1].trim()) {
              imagesWithAlt++;
            } else {
              this.results.accessibility.issues.push(
                `${path.basename(file)}: Image missing alt text: ${image}`
              );
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return totalImages === 0 || (imagesWithAlt / totalImages) >= 0.9;
  }

  checkHeadingHierarchy() {
    let validFiles = 0;
    let totalFiles = this.files.documentation.length;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const headers = content.match(/^(#+)\s+.+$/gm);

        if (headers) {
          const levels = headers.map(header => header.match(/^(#+)/)[1].length);
          let isValid = true;

          // Check if headers follow logical hierarchy
          for (let i = 1; i < levels.length; i++) {
            if (levels[i] > levels[i-1] + 1) {
              isValid = false;
              break;
            }
          }

          if (isValid) {
            validFiles++;
          } else {
            this.results.accessibility.issues.push(
              `${path.basename(file)}: Invalid heading hierarchy`
            );
          }
        } else {
          validFiles++; // No headers is valid
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return totalFiles === 0 || (validFiles / totalFiles) >= 0.8;
  }

  checkReadability() {
    // Basic readability check (simplified)
    let readableFiles = 0;
    let totalFiles = this.files.documentation.length;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Remove code blocks and markdown formatting
        const plainText = content
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]*`/g, '')
          .replace(/[#*_[\]()]/g, '');

        const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = plainText.split(/\s+/).filter(w => w.length > 0);

        if (sentences.length > 0 && words.length > 0) {
          const avgWordsPerSentence = words.length / sentences.length;

          // Check if average sentence length is reasonable (5-25 words)
          if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 25) {
            readableFiles++;
          } else {
            this.results.accessibility.issues.push(
              `${path.basename(file)}: Average sentence length may affect readability (${avgWordsPerSentence.toFixed(1)} words/sentence)`
            );
          }
        } else {
          readableFiles++; // Empty files don't affect readability score
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return totalFiles === 0 || (readableFiles / totalFiles) >= 0.7;
  }

  /**
   * Check maintenance status
   */
  checkMaintenance() {
    logInfo('🔧 Checking maintenance status...');

    const checks = [
      this.checkRecentUpdates.bind(this),
      this.checkTodoItems.bind(this),
      this.checkDeprecatedContent.bind(this)
    ];

    let passed = 0;
    for (const check of checks) {
      if (check()) passed++;
    }

    this.results.maintenance.score = (passed / checks.length) * 100;
    this.results.maintenance.checks = checks.length;

    logInfo(`Maintenance: ${this.results.maintenance.score.toFixed(1)}% (${passed}/${checks.length})`);
  }

  checkRecentUpdates() {
    try {
      const lastCommit = execSync('git log -1 --format="%cr"', { encoding: 'utf8', stdio: 'pipe' }).trim();

      if (lastCommit.includes('months ago') || lastCommit.includes('year')) {
        this.results.maintenance.issues.push(`Documentation may be outdated (last commit: ${lastCommit})`);
        return false;
      }

      return true;
    } catch (error) {
      return true; // If git is not available, assume it's maintained
    }
  }

  checkTodoItems() {
    let todoCount = 0;

    for (const file of [...this.files.documentation, ...this.files.code]) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const todos = content.match(/TODO|FIXME|XXX|HACK/gi);

        if (todos) {
          todoCount += todos.length;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (todoCount > 10) {
      this.results.maintenance.issues.push(`High number of TODO items: ${todoCount}`);
      return false;
    }

    return true;
  }

  checkDeprecatedContent() {
    let deprecatedCount = 0;

    for (const file of this.files.documentation) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const deprecated = content.match(/deprecated|obsolete|legacy/gi);

        if (deprecated) {
          deprecatedCount += deprecated.length;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (deprecatedCount > 5) {
      this.results.maintenance.issues.push(`Content may contain deprecated information (${deprecatedCount} references)`);
      return false;
    }

    return true;
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore() {
    let totalScore = 0;

    for (const [category, weight] of Object.entries(CONFIG.weights)) {
      totalScore += this.results[category].score * weight;
    }

    return Math.round(totalScore * 100) / 100;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const overallScore = this.calculateOverallScore();

    console.log('\n' + '='.repeat(80));
    log('📊 DOCUMENTATION QUALITY REPORT', 'bright');
    console.log('='.repeat(80));

    // Overall score
    const scoreColor = overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red';
    log(`\n🎯 Overall Quality Score: ${overallScore}%`, scoreColor);

    // Category breakdown
    console.log('\n📋 Category Breakdown:');
    console.log('─'.repeat(40));

    for (const [category, data] of Object.entries(this.results)) {
      const weight = (CONFIG.weights[category] * 100).toFixed(0);
      const color = data.score >= 80 ? 'green' : data.score >= 60 ? 'yellow' : 'red';

      log(`${category.charAt(0).toUpperCase() + category.slice(1).padEnd(15)} ${data.score.toFixed(1).padStart(5)}% (weight: ${weight}%)`, color);

      if (data.issues.length > 0) {
        for (const issue of data.issues.slice(0, 3)) { // Show max 3 issues per category
          log(`  • ${issue}`, 'red');
        }
        if (data.issues.length > 3) {
          log(`  • ... and ${data.issues.length - 3} more issues`, 'yellow');
        }
      }
    }

    // File statistics
    console.log('\n📁 File Statistics:');
    console.log('─'.repeat(40));
    for (const [category, files] of Object.entries(this.files)) {
      console.log(`${category.charAt(0).toUpperCase() + category.slice(1).padEnd(15)} ${files.length.toString().padStart(4)} files`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('─'.repeat(40));

    const allIssues = Object.values(this.results).flatMap(category => category.issues);
    const topIssues = allIssues.slice(0, 5);

    if (topIssues.length > 0) {
      for (let i = 0; i < topIssues.length; i++) {
        log(`${i + 1}. ${topIssues[i]}`, 'yellow');
      }
    } else {
      log('✅ No major issues found!', 'green');
    }

    console.log('\n' + '='.repeat(80));

    // Return report data for potential JSON output
    return {
      overallScore,
      timestamp: new Date().toISOString(),
      categories: this.results,
      fileStats: this.files,
      recommendations: topIssues
    };
  }

  /**
   * Save report to file
   */
  saveReport(reportData) {
    const reportsDir = path.join(process.cwd(), 'docs', 'qa-reports');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `docs-qa-report-${timestamp}.json`;
    const filepath = path.join(reportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));

    logSuccess(`Report saved to docs/qa-reports/${filename}`);

    // Also save a latest report for easy access
    const latestPath = path.join(reportsDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(reportData, null, 2));
  }

  /**
   * Run full documentation QA check
   */
  async run() {
    logInfo('🚀 Starting Documentation QA Agent...');

    this.findFiles();
    this.checkCompleteness();

    await this.checkAccuracy();

    this.checkConsistency();
    this.checkAccessibility();
    this.checkMaintenance();

    const reportData = this.generateReport();
    this.saveReport(reportData);

    const overallScore = this.calculateOverallScore();

    if (overallScore >= 80) {
      logSuccess(`🎉 Documentation quality is excellent! (${overallScore}%)`);
    } else if (overallScore >= 60) {
      logWarning(`📝 Documentation quality is good but could be improved (${overallScore}%)`);
    } else {
      logError(`🔧 Documentation quality needs significant improvement (${overallScore}%)`);
    }

    return overallScore;
  }
}

/**
 * Main function
 */
async function main() {
  const agent = new DocsQAAgent();
  const score = await agent.run();

  // Exit with error code if quality is below threshold
  process.exit(score < 60 ? 1 : 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Error running docs QA agent: ${error.message}`);
    process.exit(1);
  });
}

export { DocsQAAgent };