# Linting Documentation - Mermaid & YANG Visualization Tool

## Overview

The Mermaid & YANG Visualization Tool includes comprehensive linting capabilities for both Markdown and Mermaid diagram content. This feature helps ensure your documentation and diagrams follow best practices and are free from common syntax errors.

## Features

### Markdown Linting
- **Comprehensive Rule Set**: Over 40 markdown linting rules covering headings, lists, whitespace, code blocks, links, and more
- **Multiple Presets**: Choose from strict, relaxed, documentation, and blog presets
- **Auto-Fix Capability**: Automatically fix common issues with one click
- **Real-time Validation**: Instant feedback on markdown quality
- **Detailed Error Reports**: Line-by-line issue reporting with explanations

### Mermaid Linting
- **Syntax Validation**: Comprehensive syntax checking for all supported Mermaid diagram types
- **Diagram Type Support**: Validates flowcharts, sequence diagrams, class diagrams, and more
- **Security Validation**: Ensures diagrams follow security best practices
- **Error Location**: Precise error reporting with line and column information

## How to Use

### Accessing Linting Features

1. **Right-Click Context Menu**: Right-click on any Markdown (.md) or Mermaid (.mmd, .mermaid) file in the file list
2. **Select Linting Option**:
   - **"Lint Markdown"** - Analyze markdown files for issues
   - **"Lint Mermaid"** - Validate Mermaid syntax
   - **"Auto-fix Issues"** - Automatically fix common markdown problems

### Using the Linting Modal

When you select a linting option, a comprehensive modal will open showing:

#### Summary Section
- **Total Issues**: Count of all problems found
- **Errors**: Critical issues that need attention
- **Warnings**: Suggestions for improvement
- **Status Indicator**: Green checkmark if no issues found

#### Issues List
Each issue shows:
- **Rule Name**: The specific linting rule that triggered
- **Location**: Line and column number where the issue occurs
- **Severity**: Error or warning level
- **Description**: Clear explanation of the problem
- **Details**: Additional context when available

#### Auto-Fix Functionality (Markdown Only)
- **Preview Changes**: See exactly what will be changed before applying
- **Diff Viewer**: Side-by-side comparison of original vs. fixed content
- **Apply Fixes**: One-click application of all suggested fixes
- **File Update**: Automatically updates the file with fixed content

## Linting Rules

### Markdown Rules

#### Heading Rules
| Rule | Description | Fixable |
|------|-------------|---------|
| MD001 | Heading levels should increment by one | ❌ |
| MD003 | Use ATX style headings (# Heading) | ❌ |
| MD018 | Add space after # in headings | ✅ |
| MD019 | Remove multiple spaces after # | ✅ |
| MD020 | Remove spaces inside closed headings | ✅ |
| MD021 | Remove multiple spaces inside closed headings | ✅ |
| MD022 | Surround headings with blank lines | ❌ |
| MD023 | Headings must start at line beginning | ❌ |
| MD025 | Only one top-level heading per document | ❌ |
| MD026 | Remove trailing punctuation in headings | ❌ |

#### List Rules
| Rule | Description | Fixable |
|------|-------------|---------|
| MD004 | Use consistent unordered list style | ✅ |
| MD005 | Use consistent list indentation | ❌ |
| MD007 | Use 2-space indentation for lists | ❌ |
| MD029 | Use sequential numbers for ordered lists | ❌ |
| MD030 | Correct spacing after list markers | ❌ |
| MD032 | Surround lists with blank lines | ❌ |

#### Whitespace Rules
| Rule | Description | Fixable |
|------|-------------|---------|
| MD009 | Remove trailing spaces | ✅ |
| MD010 | Use spaces instead of tabs | ❌ |
| MD012 | Remove multiple consecutive blank lines | ✅ |
| MD047 | End files with single newline | ✅ |

#### Code Rules
| Rule | Description | Fixable |
|------|-------------|---------|
| MD031 | Surround fenced code with blank lines | ❌ |
| MD040 | Specify language for code blocks | ❌ |
| MD046 | Use fenced code blocks | ❌ |
| MD048 | Use backticks for code fences | ❌ |

#### Link and Image Rules
| Rule | Description | Fixable |
|------|-------------|---------|
| MD011 | Fix reversed link syntax | ❌ |
| MD034 | Use proper link syntax for URLs | ❌ |
| MD042 | No empty links | ❌ |
| MD045 | Images must have alt text | ❌ |

### Mermaid Validation

#### Supported Diagram Types
- **Flowchart**: `flowchart TD`, `graph LR`
- **Sequence Diagram**: `sequenceDiagram`
- **Class Diagram**: `classDiagram`
- **State Diagram**: `stateDiagram-v2`
- **Entity Relationship**: `erDiagram`
- **User Journey**: `journey`
- **Gantt Chart**: `gantt`
- **Pie Chart**: `pie`
- **Quadrant Chart**: `quadrantChart`
- **Requirement Diagram**: `requirementDiagram`
- **Git Graph**: `gitgraph`
- **C4 Diagram**: `c4`
- **Mindmap**: `mindmap`
- **Timeline**: `timeline`
- **Sankey**: `sankey`
- **XY Chart**: `xyChart`
- **Block Diagram**: `block`
- **Packet**: `packet`
- **Architecture**: `architecture`

#### Validation Features
- **Syntax Checking**: Validates diagram syntax against Mermaid specification
- **Security Level**: Ensures diagrams follow security best practices
- **Error Reporting**: Provides specific error messages with location information
- **Theme Compatibility**: Validates theme-specific syntax

## Rule Presets

### Default Preset
Balanced rule set suitable for most documentation:
- Moderate line length (120 characters)
- Essential formatting rules
- Allows some flexibility for various content types

### Strict Preset
Enforces rigorous documentation standards:
- Short line length (80 characters)
- Requires document structure
- Enforces proper name capitalization
- Mandatory top-level heading

### Relaxed Preset
More permissive rules for casual documentation:
- Long line length (150 characters)
- Optional blank lines around headings and lists
- Allows multiple top-level headings

### Documentation Preset
Optimized for formal documentation:
- Medium line length (100 characters)
- Requires top-level heading
- Allows multiple H1 headings for sections
- Focuses on readability

### Blog Preset
Tailored for blog content:
- No line length limits
- Allows inline HTML
- Flexible formatting rules

## Auto-Fix Capabilities

The auto-fix feature can automatically resolve these common issues:

### ✅ Automatically Fixable
- Remove trailing whitespace (MD009)
- Fix multiple consecutive blank lines (MD012)
- Add missing spaces after heading hashes (MD018)
- Standardize list markers (MD004)
- Ensure single newline at file end (MD047)

### ❌ Requires Manual Fix
- Heading level hierarchy (MD001)
- Document structure issues (MD043)
- Content-related problems (proper names, alt text)
- Complex formatting issues

## API Integration

### Endpoints

#### GET /api/lint/config
Get available linting configuration options:
```json
{
  "presets": ["default", "strict", "relaxed", "documentation", "blog"],
  "defaultPreset": "default",
  "markdownRules": ["MD001", "MD003", ...],
  "mermaidConfig": {
    "supportedTypes": ["flowchart", "sequenceDiagram", ...],
    "securityLevel": "loose",
    "theme": "neutral"
  }
}
```

#### POST /api/lint/markdown
Lint markdown content:
```json
{
  "content": "# Title\n\nContent here",
  "preset": "default"
}
```

#### POST /api/lint/markdown/fix
Auto-fix markdown issues:
```json
{
  "content": "# Title   \n\n\n\nContent",
  "rules": ["MD009", "MD012"]
}
```

#### POST /api/lint/mermaid
Validate Mermaid syntax:
```json
{
  "content": "flowchart TD\n  A[Start] --> B[End]"
}
```

## Best Practices

### For Markdown Files
1. **Use Consistent Heading Hierarchy**: Start with H1 and increment by one level
2. **Maintain Line Length**: Keep lines under 120 characters for readability
3. **Surround Code with Blank Lines**: Improve visual separation
4. **Specify Code Languages**: Enable syntax highlighting
5. **Use Alt Text for Images**: Improve accessibility
6. **Avoid Trailing Spaces**: Keep content clean

### For Mermaid Diagrams
1. **Test Syntax**: Always validate before sharing
2. **Use Descriptive Labels**: Make diagrams self-explanatory
3. **Keep Diagrams Focused**: One concept per diagram
4. **Follow Naming Conventions**: Use consistent node naming
5. **Add Comments**: Document complex diagram logic

## Troubleshooting

### Common Issues

#### "No Mermaid diagrams found"
- Ensure Mermaid code is wrapped in proper code blocks:
  ```
  ```mermaid
  flowchart TD
    A --> B
  ```
  ```

#### "Mermaid syntax error"
- Check for typos in diagram type declaration
- Validate node connections and syntax
- Ensure proper indentation

#### "Auto-fix failed"
- Some issues require manual intervention
- Check the detailed error messages for guidance
- Use the diff viewer to understand proposed changes

### Getting Help

1. **Check Error Details**: Read the full error message and context
2. **Review Rule Documentation**: Understand what each rule enforces
3. **Use Presets**: Try different presets to find the right balance
4. **Manual Review**: Some issues require human judgment

## Configuration

### Customizing Rules

The linting rules can be customized by modifying `/backend/src/config/linting-rules.js`:

```javascript
export const markdownRules = {
  'MD013': { line_length: 80 }, // Shorter lines
  'MD033': true,                // Allow HTML
  'MD041': false               // No mandatory H1
}
```

### Adding New Presets

Create custom presets by extending existing configurations:

```javascript
export const presets = {
  custom: {
    ...markdownRules,
    'MD013': { line_length: 200 },
    'MD025': false
  }
}
```

## Performance Notes

- **Client-Side Processing**: Linting results are cached to improve performance
- **Incremental Validation**: Only lint when explicitly requested
- **Background Processing**: Large files are processed asynchronously
- **Memory Management**: Linting data is cleaned up after modal closes

## Limitations

1. **Mermaid Auto-Fix**: Currently not supported (syntax errors need manual correction)
2. **Real-Time Linting**: Not enabled during typing (performance considerations)
3. **Custom Rules**: Requires backend configuration changes
4. **Large Files**: Very large files (>1MB) may have slower linting performance

---

## Summary

The linting feature provides powerful tools for maintaining high-quality documentation and diagrams. Use the context menu to access linting features, review issues in the comprehensive modal, and apply auto-fixes where possible. Choose appropriate rule presets based on your content type and quality requirements.