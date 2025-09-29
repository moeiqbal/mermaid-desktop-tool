/**
 * Mock data and test fixtures for Mermaid Desktop Tool QA tests
 */

/**
 * Valid Mermaid diagram examples
 */
export const VALID_MERMAID_DIAGRAMS = {
  flowchart: `graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
    C --> D`,

  sequenceDiagram: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
    Alice-)Bob: See you later!`,

  classDiagram: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }`,

  stateDiagram: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,

  erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
      string name
      string custNumber
      string sector
    }
    ORDER ||--|{ LINE-ITEM : contains
    ORDER {
      int orderNumber
      string deliveryAddress
    }`,

  gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1, 20d
    section Another
    Task in sec      :2014-01-12, 12d
    another task     :24d`,

  pie: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,

  gitGraph: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,
}

/**
 * Invalid Mermaid diagrams for error testing
 */
export const INVALID_MERMAID_DIAGRAMS = {
  syntaxError: `graph TD
    A[Start] --> B[Invalid syntax here
    C --> D`,

  unknownDiagramType: `unknownDiagram
    This is not a valid diagram type`,

  missingArrow: `graph TD
    A B C`,

  unclosedBracket: `graph TD
    A[Unclosed bracket --> B[Complete]`,
}

/**
 * Markdown file content with Mermaid diagrams
 */
export const MARKDOWN_WITH_MERMAID = `# Sample Document with Mermaid Diagrams

This is a test document containing multiple Mermaid diagrams.

## Flowchart Example

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\`

## Sequence Diagram Example

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hi Alice!
\`\`\`

## Class Diagram Example

\`\`\`mermaid
classDiagram
    class Animal {
      +String name
      +int age
    }
\`\`\`
`

/**
 * Valid YANG model example
 */
export const VALID_YANG_MODEL = `module example-system {
  namespace "http://example.com/example-system";
  prefix "sys";

  revision 2024-01-01 {
    description "Initial revision";
  }

  container system {
    description "System configuration and state";

    leaf hostname {
      type string;
      description "The system hostname";
    }

    leaf-list dns-server {
      type string;
      description "List of DNS servers";
    }

    container clock {
      leaf timezone {
        type string;
        default "UTC";
      }
    }
  }

  container interfaces {
    list interface {
      key "name";

      leaf name {
        type string;
      }

      leaf enabled {
        type boolean;
        default true;
      }

      leaf description {
        type string;
      }
    }
  }
}`

/**
 * Invalid YANG model for error testing
 */
export const INVALID_YANG_MODEL = `module invalid-yang {
  namespace "missing quotes;
  prefix "inv";

  container broken {
    leaf missing-type {
      description "This leaf is missing a type statement";
    }
  }
`

/**
 * HTML export CSS themes
 */
export const HTML_EXPORT_THEMES = {
  tailwind: {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Modern utility-first CSS framework'
  },
  github: {
    id: 'github',
    name: 'GitHub Style',
    description: 'GitHub-inspired markdown styling'
  },
  custom: {
    id: 'custom',
    name: 'Custom CSS',
    description: 'Minimal custom styling'
  }
}

/**
 * Test file paths for uploads
 */
export const TEST_FILES = {
  validMermaid: 'test-fixtures/valid-diagram.md',
  invalidMermaid: 'test-fixtures/invalid-diagram.md',
  validYang: 'test-fixtures/valid-model.yang',
  invalidYang: 'test-fixtures/invalid-model.yang',
  multipleDiagrams: 'test-fixtures/multi-diagram.md',
  emptyFile: 'test-fixtures/empty.md',
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  health: '/api/health',
  upload: '/api/files/upload',
  lint: '/api/lint',
  yangParse: '/api/yang/parse',
  yangVisualize: '/api/yang/visualize'
}

/**
 * Expected notification messages
 */
export const NOTIFICATIONS = {
  fileUploadSuccess: 'File uploaded successfully',
  fileUploadError: 'Failed to upload file',
  diagramRenderSuccess: 'Diagram rendered successfully',
  diagramRenderError: 'Failed to render diagram',
  htmlExportSuccess: 'HTML Export Complete',
  htmlExportError: 'Export Failed',
  yangParseSuccess: 'YANG model parsed successfully',
  yangParseError: 'Failed to parse YANG model'
}

/**
 * Selector constants for common UI elements
 */
export const SELECTORS = {
  // Header
  header: 'header',
  logo: 'h1',
  darkModeToggle: '[data-testid="dark-mode-toggle"], button[aria-label*="dark"], button[title*="dark"]',

  // Navigation
  mermaidViewerButton: 'button:has-text("Mermaid Viewer")',
  yangExplorerButton: 'button:has-text("YANG Explorer")',

  // File upload
  dropzone: '[data-testid="dropzone"], .dropzone',
  fileInput: 'input[type="file"]',

  // Diagrams
  diagramContainer: '[data-testid="diagram-container"], .diagram-container',
  mermaidDiagram: 'svg',
  fullscreenButton: 'button[title="Toggle Fullscreen"], button:has-text("Fullscreen")',

  // Export
  exportButton: 'button:has-text("Export")',
  htmlExportButton: 'button:has-text("HTML")',
  exportModal: '[data-testid="export-modal"]',

  // Notifications
  notification: '.notification, [role="alert"]',
  notificationClose: '.notification button[aria-label="Close"]',

  // YANG Explorer
  yangTree: '[data-testid="yang-tree"]',
  yangProperties: '[data-testid="yang-properties"]',

  // Modal
  modal: '[role="dialog"], .modal',
  modalBackdrop: '.fixed.inset-0.bg-black',
  modalClose: 'button[aria-label="Close"]',
}

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
  animationDelay: 300,
  notificationAutoClose: 5000,
  apiTimeout: 10000,
  renderTimeout: 5000,
  shortWait: 500,
  mediumWait: 1000,
  longWait: 2000,
}

/**
 * Browser compatibility matrix
 */
export const BROWSER_SUPPORT = {
  chrome: { supported: true, version: '90+' },
  firefox: { supported: true, version: '88+' },
  safari: { supported: false, reason: 'Safari compatibility page shown' },
  edge: { supported: true, version: '90+' },
}

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 },
}

/**
 * Theme constants
 */
export const THEMES = {
  light: {
    name: 'light',
    className: '',
    backgroundColor: 'rgb(255, 255, 255)',
    textColor: 'rgb(17, 24, 39)'
  },
  dark: {
    name: 'dark',
    className: 'dark',
    backgroundColor: 'rgb(3, 7, 18)',
    textColor: 'rgb(243, 244, 246)'
  }
}

/**
 * Keyboard shortcuts
 */
export const SHORTCUTS = {
  toggleDarkMode: { key: 'd', modifiers: ['ctrl'] },
  toggleFullscreen: { key: 'f', modifiers: [] },
  exportHTML: { key: 'e', modifiers: ['ctrl'] },
}

/**
 * Create a temporary test file
 */
export function createTestFileContent(diagrams: number = 1): string {
  let content = `# Test Document\n\nThis is a test document with ${diagrams} diagram(s).\n\n`

  const diagramTypes = Object.keys(VALID_MERMAID_DIAGRAMS)

  for (let i = 0; i < diagrams; i++) {
    const diagramType = diagramTypes[i % diagramTypes.length]
    const diagram = VALID_MERMAID_DIAGRAMS[diagramType as keyof typeof VALID_MERMAID_DIAGRAMS]

    content += `## Diagram ${i + 1}\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\n`
  }

  return content
}

/**
 * Create blob from content
 */
export function createTestFile(filename: string, content: string): File {
  const blob = new Blob([content], { type: 'text/plain' })
  return new File([blob], filename, { type: 'text/plain' })
}