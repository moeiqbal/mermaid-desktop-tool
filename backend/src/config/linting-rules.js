// Default Markdown linting rules configuration
export const markdownRules = {
  // Heading rules
  'MD001': true,     // Heading levels should only increment by one level at a time
  'MD003': {         // Heading style
    style: 'atx'     // Use # style headings instead of underline style
  },
  'MD018': true,     // No space after hash on atx style heading
  'MD019': true,     // Multiple spaces after hash on atx style heading
  'MD020': true,     // No space inside hashes on closed atx style heading
  'MD021': true,     // Multiple spaces inside hashes on closed atx style heading
  'MD022': true,     // Headings should be surrounded by blank lines
  'MD023': true,     // Headings must start at the beginning of the line
  'MD025': true,     // Multiple top level headings in the same document
  'MD026': true,     // Trailing punctuation in heading

  // List rules
  'MD004': {         // Unordered list style
    style: 'dash'    // Use - for unordered lists
  },
  'MD005': true,     // Inconsistent indentation for list items
  'MD007': {         // Unordered list indentation
    indent: 2        // Use 2 spaces for list indentation
  },
  'MD029': {         // Ordered list item prefix
    style: 'ordered' // Use sequential numbers for ordered lists
  },
  'MD030': true,     // Spaces after list markers
  'MD032': true,     // Lists should be surrounded by blank lines

  // Whitespace rules
  'MD009': true,     // Trailing spaces
  'MD010': true,     // Hard tabs (use spaces instead)
  'MD012': true,     // Multiple consecutive blank lines
  'MD047': true,     // Files should end with a single newline character

  // Code rules
  'MD031': true,     // Fenced code blocks should be surrounded by blank lines
  'MD040': true,     // Fenced code blocks should have a language specified
  'MD046': {         // Code block style
    style: 'fenced'  // Use ``` style code blocks
  },
  'MD048': {         // Code fence style
    style: 'backtick' // Use ` for code fences
  },

  // Link and image rules
  'MD011': true,     // Reversed link syntax
  'MD034': true,     // Bare URL used
  'MD042': true,     // No empty links
  'MD045': true,     // Images should have alternate text (alt text)

  // HTML rules
  'MD033': false,    // Allow inline HTML (needed for some Mermaid diagrams)

  // Line length
  'MD013': {         // Line length
    line_length: 120 // Maximum line length
  },

  // Emphasis and strong
  'MD036': true,     // Emphasis used instead of a heading
  'MD037': true,     // Spaces inside emphasis markers
  'MD038': true,     // Spaces inside code span elements
  'MD039': true,     // Spaces inside link text
  'MD049': {         // Emphasis style
    style: 'underscore' // Use _emphasis_ style
  },
  'MD050': {         // Strong style
    style: 'asterisk'   // Use **strong** style
  },

  // Blockquote rules
  'MD027': true,     // Multiple spaces after blockquote symbol
  'MD028': true,     // Blank line inside blockquote

  // Disabled rules (too restrictive for general use)
  'MD041': false,    // First line in file should be a top level heading
  'MD043': false,    // Required heading structure (disabled as it's too restrictive)
  'MD044': false     // Proper names should have the correct capitalization
}

// Mermaid validation configuration
export const mermaidConfig = {
  // Basic syntax validation
  validateSyntax: true,

  // Diagram type validation
  supportedTypes: [
    'flowchart',
    'graph',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'gantt',
    'pie',
    'quadrantChart',
    'requirementDiagram',
    'gitgraph',
    'c4',
    'mindmap',
    'timeline',
    'sankey',
    'xyChart',
    'block',
    'packet',
    'architecture'
  ],

  // Security settings
  securityLevel: 'loose',

  // Theme settings
  theme: 'neutral'
}

// Severity levels
export const severityLevels = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Rule categories for documentation
export const ruleCategories = {
  HEADINGS: 'Headings',
  LISTS: 'Lists',
  WHITESPACE: 'Whitespace',
  CODE: 'Code Blocks',
  LINKS: 'Links and Images',
  EMPHASIS: 'Emphasis and Strong',
  HTML: 'HTML',
  BLOCKQUOTES: 'Blockquotes',
  STRUCTURE: 'Document Structure'
}

// Rule descriptions for UI
export const ruleDescriptions = {
  'MD001': 'Heading levels should only increment by one level at a time',
  'MD003': 'Use ATX style headings (# Heading) instead of Setext style',
  'MD004': 'Unordered list style should be consistent',
  'MD005': 'List items should have consistent indentation',
  'MD007': 'Unordered list indentation should be 2 spaces',
  'MD009': 'Remove trailing spaces at the end of lines',
  'MD010': 'Use spaces instead of hard tabs',
  'MD011': 'Fix reversed link syntax [text](url)',
  'MD012': 'Remove multiple consecutive blank lines',
  'MD013': 'Lines should not exceed maximum length',
  'MD018': 'Add space after # in ATX headings',
  'MD019': 'Remove multiple spaces after # in ATX headings',
  'MD020': 'Remove spaces inside hashes on closed ATX headings',
  'MD021': 'Remove multiple spaces inside hashes on closed ATX headings',
  'MD022': 'Headings should be surrounded by blank lines',
  'MD023': 'Headings must start at the beginning of the line',
  'MD025': 'Only one top-level heading per document',
  'MD026': 'Remove trailing punctuation in headings',
  'MD027': 'Remove multiple spaces after blockquote symbol',
  'MD028': 'Remove blank lines inside blockquotes',
  'MD029': 'Ordered list item prefixes should be sequential',
  'MD030': 'Correct spacing after list markers',
  'MD031': 'Fenced code blocks should be surrounded by blank lines',
  'MD032': 'Lists should be surrounded by blank lines',
  'MD033': 'Inline HTML usage',
  'MD034': 'Use proper link syntax instead of bare URLs',
  'MD036': 'Use proper heading syntax instead of emphasis',
  'MD037': 'Remove spaces inside emphasis markers',
  'MD038': 'Remove spaces inside code span elements',
  'MD039': 'Remove spaces inside link text',
  'MD040': 'Specify language for fenced code blocks',
  'MD041': 'First line should be a top-level heading',
  'MD042': 'No empty links allowed',
  'MD043': 'Document should follow required heading structure',
  'MD044': 'Proper names should have correct capitalization',
  'MD045': 'Images should have alternate text',
  'MD046': 'Use fenced code blocks instead of indented',
  'MD047': 'File should end with a single newline',
  'MD048': 'Use backticks for code fences',
  'MD049': 'Use underscores for emphasis',
  'MD050': 'Use asterisks for strong emphasis'
}

// Custom rule presets
export const presets = {
  strict: {
    ...markdownRules,
    'MD041': true,
    'MD043': true,
    'MD044': true,
    'MD013': { line_length: 80 }
  },

  relaxed: {
    ...markdownRules,
    'MD013': { line_length: 150 },
    'MD022': false,
    'MD032': false,
    'MD025': false
  },

  documentation: {
    ...markdownRules,
    'MD041': true,
    'MD025': false,
    'MD013': { line_length: 100 }
  },

  blog: {
    ...markdownRules,
    'MD013': false,
    'MD033': true
  }
}

export default {
  markdownRules,
  mermaidConfig,
  severityLevels,
  ruleCategories,
  ruleDescriptions,
  presets
}