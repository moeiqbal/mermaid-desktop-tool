#!/bin/bash

# Version Increment Automation Script
# Usage: ./scripts/increment-version.sh [patch|minor|major] [optional: commit message]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate arguments
if [ $# -eq 0 ]; then
    print_error "Usage: $0 [patch|minor|major] [optional: commit message]"
    print_info "  patch: Bug fixes (x.x.X)"
    print_info "  minor: New features (x.X.x)"
    print_info "  major: Breaking changes (X.x.x)"
    exit 1
fi

VERSION_TYPE=$1
COMMIT_MSG=${2:-"Version bump: $VERSION_TYPE increment"}

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid version type. Use: patch, minor, or major"
    exit 1
fi

# Function to increment version
increment_version() {
    local current_version=$1
    local version_type=$2

    # Parse current version
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    major=${VERSION_PARTS[0]}
    minor=${VERSION_PARTS[1]}
    patch=${VERSION_PARTS[2]}

    # Increment based on type
    case $version_type in
        "patch")
            ((patch++))
            ;;
        "minor")
            ((minor++))
            patch=0
            ;;
        "major")
            ((major++))
            minor=0
            patch=0
            ;;
    esac

    echo "$major.$minor.$patch"
}

# Function to update package.json version
update_package_json() {
    local file_path=$1
    local new_version=$2

    if [ -f "$file_path" ]; then
        # Use node to update package.json properly
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('$file_path', 'utf8'));
            pkg.version = '$new_version';
            fs.writeFileSync('$file_path', JSON.stringify(pkg, null, 2) + '\n');
        "
        print_success "Updated $file_path to version $new_version"
    else
        print_warning "File not found: $file_path"
    fi
}

# Get current versions
print_info "Analyzing current versions..."

FRONTEND_PACKAGE="frontend/package.json"
BACKEND_PACKAGE="backend/package.json"

if [ ! -f "$FRONTEND_PACKAGE" ] || [ ! -f "$BACKEND_PACKAGE" ]; then
    print_error "Required package.json files not found"
    exit 1
fi

# Get current frontend version
FRONTEND_VERSION=$(node -e "console.log(require('./$FRONTEND_PACKAGE').version)")
BACKEND_VERSION=$(node -e "console.log(require('./$BACKEND_PACKAGE').version)")

print_info "Current frontend version: $FRONTEND_VERSION"
print_info "Current backend version: $BACKEND_VERSION"

# Determine the higher version to use as base
if [[ "$FRONTEND_VERSION" == "0.0.0" ]]; then
    CURRENT_VERSION=$BACKEND_VERSION
    print_info "Using backend version as base (frontend is at 0.0.0)"
else
    # Compare versions and use the higher one
    HIGHER_VERSION=$(printf '%s\n%s\n' "$FRONTEND_VERSION" "$BACKEND_VERSION" | sort -V | tail -n1)
    CURRENT_VERSION=$HIGHER_VERSION
    print_info "Using version $CURRENT_VERSION as base"
fi

# Calculate new version
NEW_VERSION=$(increment_version "$CURRENT_VERSION" "$VERSION_TYPE")

print_info "Incrementing version from $CURRENT_VERSION to $NEW_VERSION ($VERSION_TYPE)"

# Confirm with user
read -p "Proceed with version increment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Version increment cancelled"
    exit 1
fi

# Update package.json files
print_info "Updating package.json files..."
update_package_json "$FRONTEND_PACKAGE" "$NEW_VERSION"
update_package_json "$BACKEND_PACKAGE" "$NEW_VERSION"

# Create version history entry
HISTORY_FILE="version-history.json"
if [ ! -f "$HISTORY_FILE" ]; then
    echo '{"versions": []}' > "$HISTORY_FILE"
fi

# Add new version to history
node -e "
    const fs = require('fs');
    const history = JSON.parse(fs.readFileSync('$HISTORY_FILE', 'utf8'));
    const newEntry = {
        version: '$NEW_VERSION',
        type: '$VERSION_TYPE',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        previousVersion: '$CURRENT_VERSION'
    };
    history.versions.unshift(newEntry);
    fs.writeFileSync('$HISTORY_FILE', JSON.stringify(history, null, 2) + '\n');
"

print_success "Added version $NEW_VERSION to history"

# Stage changes for git
git add "$FRONTEND_PACKAGE" "$BACKEND_PACKAGE" "$HISTORY_FILE"

# Create git commit
print_info "Creating git commit..."
git commit -m "$COMMIT_MSG

- Updated frontend from $FRONTEND_VERSION to $NEW_VERSION
- Updated backend from $BACKEND_VERSION to $NEW_VERSION
- Type: $VERSION_TYPE increment
- Date: $(date -I)"

# Create git tag
TAG_NAME="v$NEW_VERSION"
git tag -a "$TAG_NAME" -m "Version $NEW_VERSION

Type: $VERSION_TYPE
Previous: v$CURRENT_VERSION
Date: $(date -I)

Changes: $COMMIT_MSG"

print_success "Created git commit and tag: $TAG_NAME"

# Display summary
echo ""
print_success "Version increment completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "Previous version: $CURRENT_VERSION"
print_info "New version:      $NEW_VERSION"
print_info "Increment type:   $VERSION_TYPE"
print_info "Git tag:          $TAG_NAME"
print_info "Files updated:    frontend/package.json, backend/package.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Suggest next steps
echo ""
print_warning "Next steps:"
echo "  1. Review the changes: git show $TAG_NAME"
echo "  2. Push to remote: git push && git push --tags"
echo "  3. Generate release notes: ./scripts/generate-release-notes.js"
echo "  4. Update documentation: ./scripts/docs-qa-agent.js"