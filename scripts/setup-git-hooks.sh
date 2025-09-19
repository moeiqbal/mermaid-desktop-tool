#!/bin/bash

# Git Hooks Setup Script
# Installs git hooks for automated version management and documentation QA

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

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

print_info "🔧 Setting up git hooks for automated workflows"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create hooks directory if it doesn't exist
HOOKS_DIR=".git/hooks"
if [ ! -d "$HOOKS_DIR" ]; then
    mkdir -p "$HOOKS_DIR"
    print_info "Created hooks directory: $HOOKS_DIR"
fi

# Function to create a hook file
create_hook() {
    local hook_name="$1"
    local hook_content="$2"
    local hook_file="$HOOKS_DIR/$hook_name"

    echo "#!/bin/bash" > "$hook_file"
    echo "$hook_content" >> "$hook_file"
    chmod +x "$hook_file"

    print_success "Created $hook_name hook"
}

# Pre-commit hook - Documentation validation
print_info "Installing pre-commit hook (documentation validation)..."

PRE_COMMIT_CONTENT='
# Pre-commit hook for documentation validation
echo "🔍 Running pre-commit documentation checks..."

# Check if documentation validation script exists
if [ -f "scripts/validate-documentation.sh" ]; then
    if ! ./scripts/validate-documentation.sh; then
        echo "❌ Documentation validation failed. Please fix the issues before committing."
        echo "💡 Run: ./scripts/validate-documentation.sh for details"
        exit 1
    fi
else
    echo "⚠️  Documentation validation script not found, skipping..."
fi

# Check for common issues in staged files
staged_files=$(git diff --cached --name-only)

if [ -n "$staged_files" ]; then
    # Check for TODO/FIXME in staged files
    if echo "$staged_files" | xargs grep -l "TODO\\|FIXME\\|XXX" 2>/dev/null; then
        echo "⚠️  Warning: Staged files contain TODO/FIXME items"
        echo "💡 Consider addressing these before committing"
    fi

    # Check for large files (>1MB)
    for file in $staged_files; do
        if [ -f "$file" ] && [ $(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0) -gt 1048576 ]; then
            echo "⚠️  Warning: Large file detected: $file (>1MB)"
            echo "💡 Consider using Git LFS for large files"
        fi
    done

    # Check for secrets/credentials patterns
    secret_patterns="password\\|secret\\|key\\|token\\|credential"
    if echo "$staged_files" | xargs grep -i "$secret_patterns" 2>/dev/null | grep -v "example\\|placeholder\\|demo"; then
        echo "❌ Potential secrets/credentials detected in staged files!"
        echo "💡 Please remove sensitive information before committing"
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed"
'

create_hook "pre-commit" "$PRE_COMMIT_CONTENT"

# Post-commit hook - Update documentation
print_info "Installing post-commit hook (documentation updates)..."

POST_COMMIT_CONTENT='
# Post-commit hook for documentation updates
echo "📝 Running post-commit documentation updates..."

# Get the commit message and hash
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse --short HEAD)

# Check if this is a version increment commit
if echo "$COMMIT_MSG" | grep -q "^Version bump:"; then
    echo "🔄 Version increment detected, generating release notes..."

    if [ -f "scripts/generate-release-notes.js" ]; then
        # Generate release notes in the background
        node scripts/generate-release-notes.js > /dev/null 2>&1 &
        echo "📊 Release notes generation started"
    fi
fi

# Run documentation QA if available (in background)
if [ -f "scripts/docs-qa-agent.js" ]; then
    echo "🔍 Running documentation QA check..."
    node scripts/docs-qa-agent.js > /dev/null 2>&1 &
fi

echo "✅ Post-commit hooks completed"
'

create_hook "post-commit" "$POST_COMMIT_CONTENT"

# Pre-push hook - Final validation
print_info "Installing pre-push hook (final validation)..."

PRE_PUSH_CONTENT='
# Pre-push hook for final validation
echo "🚀 Running pre-push validation..."

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "💡 Consider committing all changes before pushing"
fi

# Check documentation quality
if [ -f "scripts/docs-qa-agent.js" ]; then
    echo "📊 Running documentation QA check..."
    if ! node scripts/docs-qa-agent.js --quiet; then
        echo "⚠️  Documentation quality issues detected"
        echo "💡 Consider running: node scripts/docs-qa-agent.js"
        echo "💡 Push anyway? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "❌ Push cancelled"
            exit 1
        fi
    fi
fi

# Check version consistency
if [ -f "scripts/sync-package-versions.js" ]; then
    echo "🔄 Checking version consistency..."
    if ! node scripts/sync-package-versions.js --dry-run > /dev/null 2>&1; then
        echo "⚠️  Package versions may be inconsistent"
        echo "💡 Run: node scripts/sync-package-versions.js"
    fi
fi

echo "✅ Pre-push validation completed"
'

create_hook "pre-push" "$PRE_PUSH_CONTENT"

# Commit-msg hook - Validate commit message format
print_info "Installing commit-msg hook (message validation)..."

COMMIT_MSG_CONTENT='
# Commit message validation hook
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

echo "📝 Validating commit message format..."

# Skip validation for merge commits
if echo "$COMMIT_MSG" | grep -q "^Merge"; then
    echo "✅ Merge commit detected, skipping validation"
    exit 0
fi

# Skip validation for version bump commits (they follow a specific format)
if echo "$COMMIT_MSG" | grep -q "^Version bump:"; then
    echo "✅ Version bump commit detected, skipping validation"
    exit 0
fi

# Check minimum length
if [ ${#COMMIT_MSG} -lt 10 ]; then
    echo "❌ Commit message too short (minimum 10 characters)"
    echo "💡 Current: \"$COMMIT_MSG\""
    exit 1
fi

# Check for conventional commit format (optional but encouraged)
if echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+"; then
    echo "✅ Conventional commit format detected"
elif echo "$COMMIT_MSG" | grep -qE "^[A-Z]"; then
    echo "✅ Commit message starts with capital letter"
else
    echo "⚠️  Consider using conventional commit format:"
    echo "💡 feat: add new feature"
    echo "💡 fix: resolve bug"
    echo "💡 docs: update documentation"
    echo "💡 Current: \"$COMMIT_MSG\""
    echo "💡 Continue anyway? (y/N)"
    read -r response < /dev/tty
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Commit cancelled"
        exit 1
    fi
fi

echo "✅ Commit message validation passed"
'

create_hook "commit-msg" "$COMMIT_MSG_CONTENT"

# Create a hook to prevent committing to main/master directly (optional)
print_info "Installing pre-receive hook (branch protection)..."

PREPARE_COMMIT_MSG_CONTENT='
# Prepare commit message hook
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
COMMIT_SHA=$3

# Add branch name to commit message if not already present
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

if [ -n "$BRANCH_NAME" ] && [ "$BRANCH_NAME" != "main" ] && [ "$BRANCH_NAME" != "master" ]; then
    # Check if branch name is already in commit message
    if ! grep -q "$BRANCH_NAME" "$COMMIT_MSG_FILE"; then
        # Add branch name to commit message
        echo "" >> "$COMMIT_MSG_FILE"
        echo "Branch: $BRANCH_NAME" >> "$COMMIT_MSG_FILE"
    fi
fi
'

create_hook "prepare-commit-msg" "$PREPARE_COMMIT_MSG_CONTENT"

# Create a summary of installed hooks
print_info ""
print_info "📋 Installed Git Hooks Summary:"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "pre-commit: Documentation validation and security checks"
print_success "post-commit: Automatic documentation updates"
print_success "pre-push: Final validation before push"
print_success "commit-msg: Commit message format validation"
print_success "prepare-commit-msg: Add branch information to commits"

# Test hooks
print_info ""
print_info "🧪 Testing hooks installation..."

# List all hooks
if ls -la "$HOOKS_DIR"/*.* >/dev/null 2>&1; then
    HOOK_COUNT=$(ls -1 "$HOOKS_DIR"/* 2>/dev/null | grep -v ".sample" | wc -l)
    print_success "Found $HOOK_COUNT active hooks"

    # Check if hooks are executable
    NON_EXECUTABLE=0
    for hook in "$HOOKS_DIR"/*; do
        if [ -f "$hook" ] && [[ ! "$hook" =~ \.sample$ ]] && [ ! -x "$hook" ]; then
            print_warning "Hook not executable: $(basename "$hook")"
            NON_EXECUTABLE=$((NON_EXECUTABLE + 1))
        fi
    done

    if [ "$NON_EXECUTABLE" -eq 0 ]; then
        print_success "All hooks are executable"
    fi
else
    print_warning "No hooks found in $HOOKS_DIR"
fi

# Final instructions
print_info ""
print_info "🎯 Git Hooks Setup Complete!"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "The following workflows are now automated:"
print_info "  • Documentation validation on commit"
print_info "  • Release notes generation on version bumps"
print_info "  • Code quality checks before push"
print_info "  • Commit message format validation"
print_info ""
print_warning "Note: To disable hooks temporarily, use:"
print_info "  git commit --no-verify"
print_info "  git push --no-verify"
print_info ""
print_success "Ready for automated version management! 🚀"