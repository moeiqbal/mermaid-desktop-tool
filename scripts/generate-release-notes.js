#!/usr/bin/env node

/**
 * Automated Release Notes Generation System
 * Analyzes git commits and generates structured release notes
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  categories: {
    '🚀': { name: 'New Features', patterns: ['feat:', 'add:', 'implement:', 'new:'] },
    '🐛': { name: 'Bug Fixes', patterns: ['fix:', 'bug:', 'patch:', 'resolve:'] },
    '⚡': { name: 'Performance Improvements', patterns: ['perf:', 'optimize:', 'performance:'] },
    '📚': { name: 'Documentation', patterns: ['docs:', 'doc:', 'readme:', 'documentation:'] },
    '🔧': { name: 'Technical Improvements', patterns: ['refactor:', 'chore:', 'build:', 'ci:', 'config:'] },
    '⚠️': { name: 'Breaking Changes', patterns: ['BREAKING:', 'breaking:', 'major:'] },
    '🎨': { name: 'UI/UX Improvements', patterns: ['ui:', 'style:', 'design:', 'css:'] },
    '🧪': { name: 'Testing', patterns: ['test:', 'tests:', 'testing:', 'spec:'] },
    '🔒': { name: 'Security', patterns: ['security:', 'auth:', 'vulnerability:'] }
  },
  maxCommitsPerCategory: 20,
  excludePatterns: [
    /^Merge /,
    /^Version bump:/,
    /^v?\d+\.\d+\.\d+/,
    /^Release v?\d+\.\d+\.\d+/,
    /^WIP:/,
    /^wip:/
  ]
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
 * Get git commits since a specific version or date
 */
function getGitCommits(since = null) {
  try {
    let command;
    if (since) {
      // If since is a version tag, get commits since that tag
      if (since.startsWith('v') || /^\d+\.\d+\.\d+/.test(since)) {
        const tagExists = execSync(`git tag -l "${since.startsWith('v') ? since : 'v' + since}"`, { encoding: 'utf8' }).trim();
        if (tagExists) {
          command = `git log ${since.startsWith('v') ? since : 'v' + since}..HEAD --oneline --no-merges`;
        } else {
          logWarning(`Tag ${since} not found, using date-based approach`);
          command = `git log --since="${since}" --oneline --no-merges`;
        }
      } else {
        // Assume it's a date
        command = `git log --since="${since}" --oneline --no-merges`;
      }
    } else {
      // Get commits from the last 30 days
      command = 'git log --since="30 days ago" --oneline --no-merges';
    }

    const output = execSync(command, { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.trim()).map(line => {
      const [hash, ...messageParts] = line.split(' ');
      return {
        hash: hash.trim(),
        message: messageParts.join(' ').trim()
      };
    });
  } catch (error) {
    logError(`Failed to get git commits: ${error.message}`);
    return [];
  }
}

/**
 * Get the current version from package.json
 */
function getCurrentVersion() {
  try {
    const packagePath = path.join(process.cwd(), 'frontend', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    logError(`Failed to read version: ${error.message}`);
    return '0.0.0';
  }
}

/**
 * Get the previous version from version history
 */
function getPreviousVersion() {
  try {
    const historyPath = path.join(process.cwd(), 'version-history.json');
    if (!fs.existsSync(historyPath)) {
      return null;
    }
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    if (history.versions && history.versions.length > 1) {
      return history.versions[1].version;
    }
    return null;
  } catch (error) {
    logWarning(`Could not read version history: ${error.message}`);
    return null;
  }
}

/**
 * Categorize commits based on their messages
 */
function categorizeCommits(commits) {
  const categorized = {};
  const uncategorized = [];

  // Initialize categories
  Object.keys(CONFIG.categories).forEach(emoji => {
    categorized[emoji] = [];
  });

  commits.forEach(commit => {
    // Skip excluded patterns
    if (CONFIG.excludePatterns.some(pattern => pattern.test(commit.message))) {
      return;
    }

    let found = false;
    for (const [emoji, category] of Object.entries(CONFIG.categories)) {
      if (category.patterns.some(pattern =>
        commit.message.toLowerCase().includes(pattern.toLowerCase())
      )) {
        if (categorized[emoji].length < CONFIG.maxCommitsPerCategory) {
          categorized[emoji].push(commit);
        }
        found = true;
        break;
      }
    }

    if (!found) {
      uncategorized.push(commit);
    }
  });

  // Add some uncategorized commits to "Technical Improvements" if they seem relevant
  if (uncategorized.length > 0) {
    const technicalEmoji = '🔧';
    uncategorized.slice(0, 5).forEach(commit => {
      if (categorized[technicalEmoji].length < CONFIG.maxCommitsPerCategory) {
        categorized[technicalEmoji].push(commit);
      }
    });
  }

  return categorized;
}

/**
 * Format commit message for display
 */
function formatCommitMessage(commit) {
  let message = commit.message;

  // Remove common prefixes
  const prefixes = ['feat:', 'fix:', 'docs:', 'style:', 'refactor:', 'test:', 'chore:', 'perf:'];
  for (const prefix of prefixes) {
    if (message.toLowerCase().startsWith(prefix)) {
      message = message.substring(prefix.length).trim();
      break;
    }
  }

  // Capitalize first letter
  message = message.charAt(0).toUpperCase() + message.slice(1);

  // Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(message)) {
    message += '.';
  }

  return `- ${message} (${commit.hash})`;
}

/**
 * Generate release notes in markdown format
 */
function generateReleaseNotes(version, previousVersion, categorizedCommits) {
  const date = new Date().toISOString().split('T')[0];
  let notes = '';

  // Header
  notes += `### Version ${version}`;
  if (previousVersion) {
    notes += ` (${date})\n\n`;
    notes += `**Changes since v${previousVersion}**\n\n`;
  } else {
    notes += ` (${date})\n\n`;
  }

  // Categories
  let hasContent = false;
  Object.entries(CONFIG.categories).forEach(([emoji, category]) => {
    const commits = categorizedCommits[emoji];
    if (commits && commits.length > 0) {
      notes += `${emoji} **${category.name}**\n`;
      commits.forEach(commit => {
        notes += `${formatCommitMessage(commit)}\n`;
      });
      notes += '\n';
      hasContent = true;
    }
  });

  if (!hasContent) {
    notes += '- No significant changes in this release\n\n';
  }

  return notes;
}

/**
 * Update README.md with new release notes
 */
function updateReadme(releaseNotes) {
  const readmePath = path.join(process.cwd(), 'README.md');

  if (!fs.existsSync(readmePath)) {
    logWarning('README.md not found, creating new one with release notes');
    fs.writeFileSync(readmePath, `# Mermaid & YANG Visualizer\n\n## Release Notes\n\n${releaseNotes}`);
    return;
  }

  let content = fs.readFileSync(readmePath, 'utf8');

  // Look for existing release notes section
  const releaseNotesRegex = /## Release Notes\n/;

  if (releaseNotesRegex.test(content)) {
    // Insert new notes after the "## Release Notes" header
    content = content.replace(
      /## Release Notes\n/,
      `## Release Notes\n\n${releaseNotes}`
    );
  } else {
    // Add release notes section at the end
    content += `\n## Release Notes\n\n${releaseNotes}`;
  }

  fs.writeFileSync(readmePath, content);
  logSuccess('Updated README.md with new release notes');
}

/**
 * Save release notes to a separate file
 */
function saveReleaseNotesToFile(version, releaseNotes) {
  const releaseNotesDir = path.join(process.cwd(), 'docs', 'releases');

  // Create directory if it doesn't exist
  if (!fs.existsSync(releaseNotesDir)) {
    fs.mkdirSync(releaseNotesDir, { recursive: true });
  }

  const fileName = `v${version}.md`;
  const filePath = path.join(releaseNotesDir, fileName);

  const fullContent = `# Release Notes v${version}\n\n${releaseNotes}`;
  fs.writeFileSync(filePath, fullContent);

  logSuccess(`Release notes saved to docs/releases/${fileName}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const since = args[0] || null;

  logInfo('🚀 Generating release notes...');

  // Get current and previous versions
  const currentVersion = getCurrentVersion();
  const previousVersion = getPreviousVersion();

  logInfo(`Current version: ${currentVersion}`);
  if (previousVersion) {
    logInfo(`Previous version: ${previousVersion}`);
  }

  // Get commits
  const commits = getGitCommits(since || previousVersion);

  if (commits.length === 0) {
    logWarning('No commits found for release notes generation');
    return;
  }

  logInfo(`Found ${commits.length} commits to analyze`);

  // Categorize commits
  const categorizedCommits = categorizeCommits(commits);

  // Count categorized commits
  const totalCategorized = Object.values(categorizedCommits).reduce((sum, commits) => sum + commits.length, 0);
  logInfo(`Categorized ${totalCategorized} commits`);

  // Generate release notes
  const releaseNotes = generateReleaseNotes(currentVersion, previousVersion, categorizedCommits);

  // Output release notes to console
  console.log('\n' + '='.repeat(60));
  log('📝 GENERATED RELEASE NOTES', 'bright');
  console.log('='.repeat(60));
  console.log(releaseNotes);
  console.log('='.repeat(60) + '\n');

  // Update README.md
  updateReadme(releaseNotes);

  // Save to separate file
  saveReleaseNotesToFile(currentVersion, releaseNotes);

  logSuccess('Release notes generation completed!');
  logInfo('Next steps:');
  logInfo('1. Review the generated notes above');
  logInfo('2. Edit README.md if needed');
  logInfo(`3. Check docs/releases/v${currentVersion}.md`);
  logInfo('4. Commit the changes: git add README.md docs/releases/');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateReleaseNotes, categorizeCommits, formatCommitMessage };