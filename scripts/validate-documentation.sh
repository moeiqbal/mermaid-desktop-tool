#!/bin/bash

# Documentation Validation Script
# Quick validation checks for documentation quality and consistency

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

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0

# Function to run a check and update counters
run_check() {
    local check_name="$1"
    local command="$2"
    local error_message="$3"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    print_info "Checking: $check_name"

    if eval "$command" >/dev/null 2>&1; then
        print_success "$check_name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_error "$error_message"
        return 1
    fi
}

# Function to run a warning check
run_warning_check() {
    local check_name="$1"
    local command="$2"
    local warning_message="$3"

    print_info "Checking: $check_name"

    if eval "$command" >/dev/null 2>&1; then
        print_success "$check_name"
    else
        print_warning "$warning_message"
        WARNINGS=$((WARNINGS + 1))
    fi
}

echo "📚 Documentation Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Basic file existence checks
print_info "🔍 Checking required files..."

run_check "README.md exists" \
    "[ -f README.md ]" \
    "README.md file is missing"

run_check "CLAUDE.md exists" \
    "[ -f CLAUDE.md ]" \
    "CLAUDE.md file is missing"

run_warning_check "CHANGELOG exists" \
    "[ -f CHANGELOG.md ] || [ -f CHANGELOG ] || [ -f HISTORY.md ]" \
    "No CHANGELOG file found (consider adding one)"

run_warning_check "LICENSE exists" \
    "[ -f LICENSE ] || [ -f LICENSE.md ] || [ -f LICENSE.txt ]" \
    "No LICENSE file found (consider adding one)"

# README quality checks
if [ -f README.md ]; then
    print_info "📄 Analyzing README.md..."

    # Check README length
    word_count=$(wc -w < README.md)
    if [ "$word_count" -gt 200 ]; then
        print_success "README has adequate content ($word_count words)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "README might be too brief ($word_count words, consider expanding)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # Check for essential sections
    run_check "README has Installation section" \
        "grep -i 'install\\|setup\\|getting.started' README.md" \
        "README missing installation/setup instructions"

    run_check "README has Usage section" \
        "grep -i 'usage\\|how.to\\|quick.start' README.md" \
        "README missing usage instructions"

    run_warning_check "README has Features section" \
        "grep -i 'features\\|what.does' README.md" \
        "Consider adding a Features section to README"

    run_warning_check "README has examples or code blocks" \
        "grep -E '```|`[^`]+`' README.md" \
        "Consider adding code examples to README"
fi

# Check for broken links in markdown files
print_info "🔗 Checking for potential broken links..."

broken_links_found=false
if command -v grep >/dev/null 2>&1; then
    # Find markdown files and check for common broken link patterns
    for file in $(find . -name "*.md" -not -path "./node_modules/*" 2>/dev/null); do
        # Check for empty links []()
        if grep -q "]()" "$file" 2>/dev/null; then
            print_warning "Empty link found in $file"
            broken_links_found=true
            WARNINGS=$((WARNINGS + 1))
        fi

        # Check for localhost links (might be broken in production)
        if grep -q "localhost:" "$file" 2>/dev/null; then
            print_warning "Localhost link found in $file (might not work in production)"
            WARNINGS=$((WARNINGS + 1))
        fi
    done

    if [ "$broken_links_found" = false ]; then
        print_success "No obvious broken links found"
    fi
else
    print_warning "grep not available, skipping link checks"
    WARNINGS=$((WARNINGS + 1))
fi

# Check markdown formatting consistency
print_info "📝 Checking markdown formatting..."

format_issues=0
for file in $(find . -name "*.md" -not -path "./node_modules/*" 2>/dev/null | head -10); do
    # Check for inconsistent header formatting
    if grep -q "^#[^# ]" "$file" 2>/dev/null; then
        print_warning "$file: Headers missing space after #"
        format_issues=$((format_issues + 1))
    fi

    # Check for trailing whitespace
    if grep -q " $" "$file" 2>/dev/null; then
        print_warning "$file: Lines with trailing whitespace found"
        format_issues=$((format_issues + 1))
    fi
done

if [ "$format_issues" -eq 0 ]; then
    print_success "Markdown formatting looks good"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "Found $format_issues formatting issues"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check for outdated content indicators
print_info "📅 Checking for potentially outdated content..."

outdated_patterns=0
for file in $(find . -name "*.md" -not -path "./node_modules/*" 2>/dev/null); do
    # Look for old years in documentation
    if grep -q "202[0-2]" "$file" 2>/dev/null; then
        current_year=$(date +%Y)
        if [ "$current_year" -gt 2023 ]; then
            print_warning "$file: Contains references to 2020-2022, might need updating"
            outdated_patterns=$((outdated_patterns + 1))
        fi
    fi

    # Look for "TODO" or "FIXME" in documentation
    if grep -qi "todo\\|fixme\\|xxx" "$file" 2>/dev/null; then
        print_warning "$file: Contains TODO/FIXME items"
        outdated_patterns=$((outdated_patterns + 1))
    fi
done

if [ "$outdated_patterns" -eq 0 ]; then
    print_success "No obvious outdated content found"
else
    print_warning "Found $outdated_patterns files with potentially outdated content"
    WARNINGS=$((WARNINGS + 1))
fi

# Check API documentation consistency
print_info "🔌 Checking API documentation..."

if [ -d "backend" ] && [ -f README.md ]; then
    # Count API routes in backend
    api_routes=0
    if [ -d "backend/src/routes" ]; then
        api_routes=$(find backend/src/routes -name "*.js" 2>/dev/null | wc -l)
    fi

    # Count documented endpoints in README
    documented_endpoints=0
    if grep -q "## API" README.md 2>/dev/null; then
        documented_endpoints=$(grep -c "^- \`[A-Z]\{3,\} /" README.md 2>/dev/null || echo 0)
    fi

    if [ "$api_routes" -gt 0 ] && [ "$documented_endpoints" -gt 0 ]; then
        if [ "$documented_endpoints" -ge "$api_routes" ]; then
            print_success "API documentation appears comprehensive"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            print_warning "API documentation might be incomplete ($documented_endpoints documented vs $api_routes route files)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_warning "Unable to verify API documentation completeness"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# Check for version consistency
print_info "🔄 Checking version consistency..."

versions_found=()
if [ -f "frontend/package.json" ]; then
    frontend_version=$(grep '"version"' frontend/package.json | sed 's/.*"version": "\([^"]*\)".*/\1/' | head -1)
    versions_found+=("frontend:$frontend_version")
fi

if [ -f "backend/package.json" ]; then
    backend_version=$(grep '"version"' backend/package.json | sed 's/.*"version": "\([^"]*\)".*/\1/' | head -1)
    versions_found+=("backend:$backend_version")
fi

if [ -f "package.json" ]; then
    root_version=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/' | head -1)
    versions_found+=("root:$root_version")
fi

# Check if versions are consistent
unique_versions=$(printf '%s\n' "${versions_found[@]}" | cut -d: -f2 | sort | uniq | wc -l)

if [ "$unique_versions" -le 2 ]; then
    print_success "Version numbers appear consistent"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "Version numbers may be inconsistent: ${versions_found[*]}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$TOTAL_CHECKS" -gt 0 ]; then
    pass_percentage=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))

    print_info "Total Checks: $TOTAL_CHECKS"
    print_success "Passed: $PASSED_CHECKS ($pass_percentage%)"

    if [ "$WARNINGS" -gt 0 ]; then
        print_warning "Warnings: $WARNINGS"
    fi

    failed_checks=$((TOTAL_CHECKS - PASSED_CHECKS))
    if [ "$failed_checks" -gt 0 ]; then
        print_error "Failed: $failed_checks"
    fi

    echo ""

    if [ "$pass_percentage" -ge 80 ]; then
        print_success "🎉 Documentation quality is good!"
        if [ "$WARNINGS" -gt 0 ]; then
            print_info "💡 Consider addressing the warnings above for even better quality"
        fi
    elif [ "$pass_percentage" -ge 60 ]; then
        print_warning "📝 Documentation quality is acceptable but could be improved"
        print_info "💡 Focus on addressing the failed checks above"
    else
        print_error "🔧 Documentation quality needs improvement"
        print_info "💡 Please address the issues identified above"
    fi
else
    print_warning "No checks were performed"
fi

# Suggest next steps
echo ""
print_info "💡 Next steps:"
echo "  1. Run full QA analysis: ./scripts/docs-qa-agent.js"
echo "  2. Update documentation: edit relevant .md files"
echo "  3. Validate links: check external URLs manually"
echo "  4. Run again: ./scripts/validate-documentation.sh"

echo ""

# Exit with appropriate code
if [ "$TOTAL_CHECKS" -gt 0 ] && [ "$PASSED_CHECKS" -lt "$((TOTAL_CHECKS / 2))" ]; then
    exit 1
else
    exit 0
fi