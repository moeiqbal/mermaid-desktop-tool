#!/usr/bin/env node

/**
 * Package Version Synchronization Script
 * Ensures all package.json files have consistent version numbers
 */

import fs from 'fs';
import path from 'path';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
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
 * Find all package.json files in the project
 */
function findPackageJsonFiles() {
  const packageFiles = [];
  const possiblePaths = [
    'package.json',
    'frontend/package.json',
    'backend/package.json',
    'client/package.json',
    'server/package.json'
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      packageFiles.push({
        path: filePath,
        name: filePath.includes('/') ? path.dirname(filePath) : 'root'
      });
    }
  }

  return packageFiles;
}

/**
 * Read and parse package.json file
 */
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logError(`Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Write package.json file with proper formatting
 */
function writePackageJson(filePath, packageData) {
  try {
    const content = JSON.stringify(packageData, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    logError(`Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Parse semantic version
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-.*)?$/);
  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || '',
    raw: version
  };
}

/**
 * Compare two semantic versions
 */
function compareVersions(v1, v2) {
  const version1 = parseVersion(v1);
  const version2 = parseVersion(v2);

  if (!version1 || !version2) {
    return 0; // Can't compare invalid versions
  }

  if (version1.major !== version2.major) {
    return version1.major - version2.major;
  }

  if (version1.minor !== version2.minor) {
    return version1.minor - version2.minor;
  }

  if (version1.patch !== version2.patch) {
    return version1.patch - version2.patch;
  }

  // Handle prerelease comparison
  if (version1.prerelease && !version2.prerelease) return -1;
  if (!version1.prerelease && version2.prerelease) return 1;

  return version1.prerelease.localeCompare(version2.prerelease);
}

/**
 * Find the highest version among all package.json files
 */
function findHighestVersion(packages) {
  let highestVersion = '0.0.0';
  let sourcePackage = null;

  for (const pkg of packages) {
    if (pkg.data && pkg.data.version) {
      if (compareVersions(pkg.data.version, highestVersion) > 0) {
        highestVersion = pkg.data.version;
        sourcePackage = pkg.name;
      }
    }
  }

  return { version: highestVersion, source: sourcePackage };
}

/**
 * Main synchronization function
 */
function syncVersions(targetVersion = null, dryRun = false) {
  logInfo('🔄 Package Version Synchronization');
  logInfo('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find all package.json files
  const packageFiles = findPackageJsonFiles();

  if (packageFiles.length === 0) {
    logError('No package.json files found');
    return false;
  }

  logInfo(`Found ${packageFiles.length} package.json files:`);
  for (const file of packageFiles) {
    logInfo(`  • ${file.path} (${file.name})`);
  }

  // Read all package.json files
  const packages = packageFiles.map(file => ({
    ...file,
    data: readPackageJson(file.path)
  }));

  // Filter out packages that couldn't be read
  const validPackages = packages.filter(pkg => pkg.data !== null);

  if (validPackages.length === 0) {
    logError('No valid package.json files found');
    return false;
  }

  // Determine target version
  let syncVersion;
  let versionSource;

  if (targetVersion) {
    // Use provided version
    const parsed = parseVersion(targetVersion);
    if (!parsed) {
      logError(`Invalid version format: ${targetVersion}`);
      return false;
    }
    syncVersion = targetVersion;
    versionSource = 'provided';
    logInfo(`Using provided target version: ${syncVersion}`);
  } else {
    // Find highest existing version
    const highest = findHighestVersion(validPackages);
    syncVersion = highest.version;
    versionSource = highest.source;
    logInfo(`Using highest existing version: ${syncVersion} (from ${versionSource})`);
  }

  // Check current versions
  logInfo('\n📋 Current versions:');
  const versionsToUpdate = [];
  let inconsistencyFound = false;

  for (const pkg of validPackages) {
    const currentVersion = pkg.data.version || '0.0.0';
    const needsUpdate = currentVersion !== syncVersion;

    if (needsUpdate) {
      versionsToUpdate.push(pkg);
      inconsistencyFound = true;
      logWarning(`  ${pkg.name.padEnd(12)} ${currentVersion} → ${syncVersion}`);
    } else {
      logSuccess(`  ${pkg.name.padEnd(12)} ${currentVersion} ✓`);
    }
  }

  if (!inconsistencyFound) {
    logSuccess('\n🎉 All versions are already synchronized!');
    return true;
  }

  if (dryRun) {
    logInfo('\n🔍 Dry run mode - no changes will be made');
    logInfo(`Would update ${versionsToUpdate.length} package(s) to version ${syncVersion}`);
    return true;
  }

  // Update versions
  logInfo(`\n🔧 Updating ${versionsToUpdate.length} package(s) to version ${syncVersion}...`);

  let updatesSuccessful = 0;
  for (const pkg of versionsToUpdate) {
    logInfo(`Updating ${pkg.name}...`);

    // Update the version
    pkg.data.version = syncVersion;

    // Write the updated package.json
    if (writePackageJson(pkg.path, pkg.data)) {
      logSuccess(`  ✓ ${pkg.path} updated`);
      updatesSuccessful++;
    } else {
      logError(`  ✗ Failed to update ${pkg.path}`);
    }
  }

  // Summary
  logInfo('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (updatesSuccessful === versionsToUpdate.length) {
    logSuccess(`🎉 Successfully synchronized ${updatesSuccessful} package(s) to version ${syncVersion}`);

    // Update version history if it exists
    updateVersionHistory(syncVersion);

    return true;
  } else {
    logError(`❌ Only ${updatesSuccessful} of ${versionsToUpdate.length} packages were updated successfully`);
    return false;
  }
}

/**
 * Update version history file
 */
function updateVersionHistory(version) {
  const historyPath = 'version-history.json';

  try {
    let history = { versions: [] };

    if (fs.existsSync(historyPath)) {
      const content = fs.readFileSync(historyPath, 'utf8');
      history = JSON.parse(content);
    }

    // Check if this version is already in history
    const existingEntry = history.versions.find(v => v.version === version);

    if (!existingEntry) {
      const newEntry = {
        version,
        type: 'sync',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        note: 'Package version synchronization'
      };

      history.versions.unshift(newEntry);

      // Keep only last 50 versions
      if (history.versions.length > 50) {
        history.versions = history.versions.slice(0, 50);
      }

      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + '\n');
      logInfo(`📝 Updated version history: ${historyPath}`);
    }
  } catch (error) {
    logWarning(`Could not update version history: ${error.message}`);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Package Version Synchronization Tool

USAGE:
  node sync-package-versions.js [options] [version]

OPTIONS:
  --dry-run, -d    Show what would be changed without making changes
  --help, -h       Show this help message

ARGUMENTS:
  version          Target version to sync to (e.g., "2.1.0")
                   If not provided, uses the highest existing version

EXAMPLES:
  # Sync all packages to highest existing version
  node sync-package-versions.js

  # Sync all packages to specific version
  node sync-package-versions.js 2.1.0

  # Preview changes without making them
  node sync-package-versions.js --dry-run

  # Sync to specific version (dry run)
  node sync-package-versions.js --dry-run 2.2.0
`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let targetVersion = null;
  let dryRun = false;
  let showHelpFlag = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelpFlag = true;
    } else if (arg === '--dry-run' || arg === '-d') {
      dryRun = true;
    } else if (!targetVersion && /^\d+\.\d+\.\d+/.test(arg)) {
      targetVersion = arg;
    }
  }

  if (showHelpFlag) {
    showHelp();
    return;
  }

  const success = syncVersions(targetVersion, dryRun);
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { syncVersions, findPackageJsonFiles, compareVersions };