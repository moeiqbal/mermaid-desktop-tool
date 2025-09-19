# Version Management Guide

This document outlines the version management system implemented for the Mermaid & YANG Visualizer project, including automated version incrementing, git tagging, and release coordination.

## Overview

Our version management system follows **Semantic Versioning** (SemVer) and provides automated tools for:
- Version increment automation
- Package.json synchronization across frontend/backend
- Git tag creation and management
- Version history tracking
- Release notes generation

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

### Version Components

- **MAJOR** (X.y.z): Breaking changes that require user intervention
- **MINOR** (x.Y.z): New features that are backwards compatible
- **PATCH** (x.y.Z): Bug fixes and small improvements

### Examples

```
2.1.0 → 2.1.1  (patch: bug fix)
2.1.1 → 2.2.0  (minor: new feature)
2.2.0 → 3.0.0  (major: breaking change)
```

## Automated Version Management

### Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `increment-version.sh` | Increment version and create git tags | `./scripts/increment-version.sh minor` |
| `sync-package-versions.js` | Synchronize package.json versions | `node scripts/sync-package-versions.js` |
| `generate-release-notes.js` | Auto-generate release notes | `node scripts/generate-release-notes.js` |

### 1. Version Increment Process

The main version increment script handles:
- Version calculation based on increment type
- Package.json updates (frontend & backend)
- Git commit creation
- Git tag creation with metadata
- Version history tracking

#### Usage

```bash
# Increment patch version (bug fixes)
./scripts/increment-version.sh patch "Fix export functionality"

# Increment minor version (new features)
./scripts/increment-version.sh minor "Add Document View tab"

# Increment major version (breaking changes)
./scripts/increment-version.sh major "Migrate to React 18"
```

#### Script Workflow

1. **Validation**: Checks current working directory and git status
2. **Version Analysis**: Reads current versions from package.json files
3. **Calculation**: Determines new version based on increment type
4. **User Confirmation**: Prompts for approval before making changes
5. **Updates**: Modifies package.json files simultaneously
6. **History Tracking**: Updates version-history.json
7. **Git Operations**: Creates commit and tag with metadata
8. **Summary**: Displays changes and suggests next steps

### 2. Package Version Synchronization

Ensures all package.json files have consistent version numbers:

```bash
# Check version consistency (dry run)
node scripts/sync-package-versions.js --dry-run

# Synchronize to highest existing version
node scripts/sync-package-versions.js

# Synchronize to specific version
node scripts/sync-package-versions.js 2.1.0
```

#### Synchronization Logic

1. Scans for package.json files in:
   - Root directory
   - `frontend/` directory
   - `backend/` directory
2. Compares versions using semantic version comparison
3. Uses highest version as synchronization target
4. Updates all package.json files simultaneously
5. Records changes in version history

### 3. Version History Tracking

All version changes are tracked in `version-history.json`:

```json
{
  "versions": [
    {
      "version": "2.1.0",
      "type": "minor",
      "date": "2024-09-18",
      "timestamp": "2024-09-18T14:30:00.000Z",
      "previousVersion": "2.0.1",
      "note": "Add Document View tab with theme support"
    },
    {
      "version": "2.0.1",
      "type": "patch",
      "date": "2024-09-15",
      "timestamp": "2024-09-15T09:15:00.000Z",
      "previousVersion": "2.0.0",
      "note": "Fix Docker ARM64 build issues"
    }
  ]
}
```

## Git Tag Management

### Tag Naming Convention

- Format: `v{MAJOR}.{MINOR}.{PATCH}`
- Examples: `v2.1.0`, `v2.0.1`, `v1.0.0`

### Tag Metadata

Each tag includes comprehensive metadata:

```bash
git tag -a "v2.1.0" -m "Version 2.1.0

Type: minor
Previous: v2.0.1
Date: 2024-09-18

Changes: Add Document View tab with theme support"
```

### Tag Operations

```bash
# List all version tags
git tag -l "v*"

# Show tag information
git show v2.1.0

# Push tags to remote
git push --tags

# Delete tag (if needed)
git tag -d v2.1.0
git push origin --delete v2.1.0
```

## Version Increment Guidelines

### When to Increment PATCH (x.y.Z)

- Bug fixes that don't affect the API
- Performance improvements
- Documentation updates
- Security patches
- Internal code refactoring

**Examples:**
```bash
./scripts/increment-version.sh patch "Fix Safari export compatibility"
./scripts/increment-version.sh patch "Improve diagram rendering performance"
./scripts/increment-version.sh patch "Update README with troubleshooting"
```

### When to Increment MINOR (x.Y.z)

- New features that are backwards compatible
- New API endpoints
- Enhanced functionality
- New configuration options

**Examples:**
```bash
./scripts/increment-version.sh minor "Add Document View tab"
./scripts/increment-version.sh minor "Implement HTML export feature"
./scripts/increment-version.sh minor "Add multi-theme support"
```

### When to Increment MAJOR (X.y.z)

- Breaking API changes
- Removed functionality
- Changed behavior that affects existing users
- Major architectural changes

**Examples:**
```bash
./scripts/increment-version.sh major "Migrate from Vue.js to React"
./scripts/increment-version.sh major "Remove legacy API endpoints"
./scripts/increment-version.sh major "Change Docker port from 3000 to 8080"
```

## Integration with Development Workflow

### Pre-commit Hooks

Git hooks automatically validate version consistency:

```bash
# Installed via setup-git-hooks.sh
# Checks version synchronization before commits
# Validates package.json consistency
```

### Automated Processes

1. **On Version Increment**:
   - Package.json files updated
   - Git commit created
   - Git tag created with metadata
   - Version history updated

2. **On Commit** (via git hooks):
   - Version consistency validated
   - Documentation checks performed

3. **On Push** (via git hooks):
   - Final version validation
   - Release notes generation triggered

## Release Coordination

### Version-to-Release Mapping

- **Patch releases**: Can be released immediately after testing
- **Minor releases**: Require feature documentation update
- **Major releases**: Require migration guides and communication

### Release Branch Strategy

```bash
# For major/minor releases, create release branches
git checkout -b release/v2.1.0

# Make final adjustments
./scripts/increment-version.sh minor "Release v2.1.0"

# Generate release notes
node scripts/generate-release-notes.js

# Merge to main after testing
git checkout main
git merge release/v2.1.0
```

## Troubleshooting

### Common Issues

#### 1. Version Mismatch Between Packages

```bash
# Symptoms: Different versions in frontend/backend package.json
# Solution: Synchronize versions
node scripts/sync-package-versions.js
```

#### 2. Missing Git Tags

```bash
# Symptoms: Version incremented but no git tag
# Solution: Manually create tag
git tag -a "v2.1.0" -m "Version 2.1.0"
```

#### 3. Version History Corruption

```bash
# Symptoms: Invalid version-history.json
# Solution: Regenerate from git tags
./scripts/regenerate-version-history.sh  # (if implemented)
```

### Validation Commands

```bash
# Check current versions
grep -r "version" frontend/package.json backend/package.json

# Validate git tags
git tag -l "v*" | sort -V

# Check version history
cat version-history.json | jq '.versions[] | .version'
```

## Best Practices

### 1. Consistent Versioning

- Always use the increment scripts
- Never manually edit version numbers
- Keep package.json files synchronized
- Update version history for all changes

### 2. Meaningful Commit Messages

```bash
# Good commit messages for version bumps
./scripts/increment-version.sh minor "Add Document View with inline diagrams"
./scripts/increment-version.sh patch "Fix export button event handling"

# Avoid generic messages
./scripts/increment-version.sh minor "Updates"  # Too vague
```

### 3. Testing Before Version Increment

- Run full test suite
- Validate in development environment
- Check all functionality works as expected
- Update documentation before versioning

### 4. Communication

- **Patch releases**: No special communication needed
- **Minor releases**: Update team and users about new features
- **Major releases**: Provide migration guides and breaking change notices

## Automation Setup

### Initial Setup

```bash
# 1. Install git hooks for automated workflows
./scripts/setup-git-hooks.sh

# 2. Verify current version state
node scripts/sync-package-versions.js --dry-run

# 3. Initialize version history (if needed)
echo '{"versions": []}' > version-history.json
```

### Regular Maintenance

- **Weekly**: Review version consistency
- **Monthly**: Clean up old tags if needed
- **Per Release**: Validate automation is working correctly

## Future Enhancements

### Planned Features

- [ ] Automated changelog generation from git commits
- [ ] Integration with GitHub Releases API
- [ ] Version bump previews in pull requests
- [ ] Automated rollback capabilities
- [ ] Integration with CI/CD pipelines

### Configuration Options

Future versions may include configurable options:

```json
{
  "versionManagement": {
    "autoGenerateReleaseNotes": true,
    "requireConfirmation": true,
    "tagFormat": "v{version}",
    "branchStrategy": "main-only",
    "notificationWebhooks": []
  }
}
```

---

**Last Updated**: 2024-09-18
**Version**: 1.0.0
**Maintained by**: Project maintainers

For questions or issues with version management, please refer to this guide or contact the development team.