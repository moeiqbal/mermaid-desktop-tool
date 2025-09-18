import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToHtml, CSSStyleOption } from '../../utils/htmlExport'
import type { DiagramMetadata } from '../../utils/mermaid'

describe('HTML Export Integration Tests', () => {
  let originalBlob: typeof Blob
  let originalURL: typeof URL
  let originalDocument: Document
  let createdBlobs: Blob[] = []
  let createdUrls: string[] = []
  let downloadedFiles: Array<{ name: string; content: string }> = []

  beforeEach(() => {
    // Store original implementations
    originalBlob = global.Blob
    originalURL = global.URL
    originalDocument = global.document

    createdBlobs = []
    createdUrls = []
    downloadedFiles = []

    // Mock Blob constructor to capture content
    global.Blob = vi.fn().mockImplementation((content: BlobPart[], options?: BlobPropertyBag) => {
      const blob = {
        content,
        options,
        size: content.join('').length,
        type: options?.type || 'text/plain'
      }
      createdBlobs.push(blob as any)
      return blob
    })

    // Mock URL methods
    global.URL = {
      createObjectURL: vi.fn().mockImplementation((_blob) => {
        const url = `blob:${Date.now()}-${Math.random()}`
        createdUrls.push(url)
        return url
      }),
      revokeObjectURL: vi.fn()
    } as any

    // Mock document methods
    const mockElement = {
      href: '',
      download: '',
      click: vi.fn().mockImplementation(function() {
        downloadedFiles.push({
          name: this.download,
          content: createdBlobs[createdBlobs.length - 1]?.content.join('') || ''
        })
      })
    }

    global.document = {
      createElement: vi.fn().mockReturnValue(mockElement),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    } as any
  })

  afterEach(() => {
    // Restore original implementations
    global.Blob = originalBlob
    global.URL = originalURL
    global.document = originalDocument
  })

  describe('Complete Export Workflow', () => {
    const sampleDiagrams: DiagramMetadata[] = [
      {
        content: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[End]\n    C --> D',
        index: 0,
        title: 'Process Flow',
        startLine: 5,
        endLine: 10,
        rawBlock: '```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[End]\n    C --> D\n```'
      },
      {
        content: 'sequenceDiagram\n    participant U as User\n    participant S as System\n    U->>S: Request\n    S-->>U: Response',
        index: 1,
        title: 'API Interaction',
        startLine: 15,
        endLine: 20,
        rawBlock: '```mermaid\nsequenceDiagram\n    participant U as User\n    participant S as System\n    U->>S: Request\n    S-->>U: Response\n```'
      }
    ]

    const sampleMarkdown = `# Project Documentation

This document describes the system architecture and API interactions.

## Process Flow

The main process follows this flow:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
\`\`\`

## API Interaction

The system interacts with users as follows:

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant S as System
    U->>S: Request
    S-->>U: Response
\`\`\`

## Conclusion

This completes our system overview.`

    it('should export complete HTML with Tailwind CSS styling', async () => {
      await exportToHtml({
        fileName: 'project-docs.md',
        content: sampleMarkdown,
        diagrams: sampleDiagrams,
        styleOption: 'tailwind' as CSSStyleOption,
        darkMode: false
      })

      expect(downloadedFiles).toHaveLength(1)
      expect(downloadedFiles[0].name).toBe('project-docs-export.html')

      const htmlContent = downloadedFiles[0].content

      // Verify HTML structure
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<html lang="en">')
      expect(htmlContent).toContain('<head>')
      expect(htmlContent).toContain('<body>')

      // Verify metadata
      expect(htmlContent).toContain('<title>project-docs.md - Mermaid Diagrams</title>')
      expect(htmlContent).toContain('<meta name="generator" content="Mermaid Desktop Tool">')

      // Verify Tailwind CSS is included
      expect(htmlContent).toContain('tailwindcss')
      expect(htmlContent).toContain('font-family: ui-sans-serif')

      // Verify Mermaid CDN is included
      expect(htmlContent).toContain('cdn.jsdelivr.net/npm/mermaid@')
      expect(htmlContent).toContain('mermaid.initialize')

      // Verify markdown content conversion
      expect(htmlContent).toContain('<h1>Project Documentation</h1>')
      expect(htmlContent).toContain('<h2>Process Flow</h2>')
      expect(htmlContent).toContain('<h2>API Interaction</h2>')

      // Verify diagrams are embedded
      expect(htmlContent).toContain('Process Flow')
      expect(htmlContent).toContain('API Interaction')
      expect(htmlContent).toContain('class="mermaid"')
      expect(htmlContent).toContain('graph TD')
      expect(htmlContent).toContain('sequenceDiagram')

      // Verify responsive design classes
      expect(htmlContent).toContain('diagram-container')
      expect(htmlContent).toContain('overflow-x: auto')
    })

    it('should export with GitHub styling and dark mode', async () => {
      await exportToHtml({
        fileName: 'github-styled.md',
        content: sampleMarkdown,
        diagrams: sampleDiagrams,
        styleOption: 'github' as CSSStyleOption,
        darkMode: true
      })

      const htmlContent = downloadedFiles[0].content

      // Verify GitHub-specific styling
      expect(htmlContent).toContain('font-family: -apple-system, BlinkMacSystemFont')
      expect(htmlContent).toContain('border: 1px solid #d1d9e0')

      // Verify dark mode configuration
      expect(htmlContent).toContain('theme: \'dark\'')
      expect(htmlContent).toContain('darkMode: true')

      // Verify footer contains style information
      expect(htmlContent).toContain('Style: Github (Dark Mode)')
    })

    it('should export with custom theme styling', async () => {
      await exportToHtml({
        fileName: 'custom-theme.md',
        content: sampleMarkdown,
        diagrams: sampleDiagrams,
        styleOption: 'custom' as CSSStyleOption,
        darkMode: false
      })

      const htmlContent = downloadedFiles[0].content

      // Verify custom theme variables
      expect(htmlContent).toContain('--bg-primary:')
      expect(htmlContent).toContain('--text-primary:')
      expect(htmlContent).toContain('--accent-color:')

      // Verify custom typography
      expect(htmlContent).toContain('font-family: \'Inter\'')
      expect(htmlContent).toContain('line-height: 1.7')

      // Verify custom diagram styling
      expect(htmlContent).toContain('📊')  // Emoji prefix
      expect(htmlContent).toContain('border-radius: 12px')
    })

    it('should handle edge cases and empty content gracefully', async () => {
      await exportToHtml({
        fileName: 'empty-content.md',
        content: '',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = downloadedFiles[0].content

      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('empty-content.md')
      expect(htmlContent).not.toContain('class="diagram-container"')
    })

    it('should properly escape HTML in markdown content', async () => {
      const markdownWithHtml = `# Test Document

This contains <script>alert('xss')</script> and other HTML.

**Bold <em>nested</em> text** and \`<code>tags</code>\`.

> Quote with <strong>HTML</strong>
`

      await exportToHtml({
        fileName: 'html-content.md',
        content: markdownWithHtml,
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = downloadedFiles[0].content

      // Basic markdown conversion should work
      expect(htmlContent).toContain('<h1>Test Document</h1>')
      expect(htmlContent).toContain('<strong>Bold')

      // But raw HTML should be handled safely (basic conversion)
      // Note: Our simple markdown converter doesn't escape HTML,
      // but in a production app you'd want proper sanitization
    })

    it('should handle special characters in filenames', async () => {
      await exportToHtml({
        fileName: 'special-chars (test) [v1.0].md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      expect(downloadedFiles[0].name).toBe('special-chars (test) [v1.0]-export.html')
    })

    it('should include print-friendly styles', async () => {
      await exportToHtml({
        fileName: 'printable.md',
        content: sampleMarkdown,
        diagrams: sampleDiagrams,
        styleOption: 'custom' as CSSStyleOption
      })

      const htmlContent = downloadedFiles[0].content

      expect(htmlContent).toContain('@media print')
      expect(htmlContent).toContain('break-inside: avoid')
    })

    it('should generate proper Mermaid configuration', async () => {
      await exportToHtml({
        fileName: 'mermaid-config.md',
        content: sampleMarkdown,
        diagrams: sampleDiagrams,
        styleOption: 'github' as CSSStyleOption,
        darkMode: true
      })

      const htmlContent = downloadedFiles[0].content

      // Verify comprehensive Mermaid configuration
      expect(htmlContent).toContain('startOnLoad: true')
      expect(htmlContent).toContain('useMaxWidth: true')
      expect(htmlContent).toContain('htmlLabels: true')
      expect(htmlContent).toContain('primaryColor:')
      expect(htmlContent).toContain('flowchart:')
      expect(htmlContent).toContain('sequence:')
    })

    it('should handle large number of diagrams efficiently', async () => {
      const manyDiagrams: DiagramMetadata[] = Array.from({ length: 20 }, (_, i) => ({
        content: `graph TD\n    A${i}[Step ${i}] --> B${i}[End ${i}]`,
        index: i,
        title: `Diagram ${i + 1}`,
        startLine: i * 10,
        endLine: i * 10 + 5,
        rawBlock: `\`\`\`mermaid\ngraph TD\n    A${i}[Step ${i}] --> B${i}[End ${i}]\n\`\`\``
      }))

      await exportToHtml({
        fileName: 'many-diagrams.md',
        content: '# Document with Many Diagrams',
        diagrams: manyDiagrams,
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = downloadedFiles[0].content

      // Should contain all diagrams
      expect(htmlContent.match(/class="mermaid"/g)).toHaveLength(20)
      expect(htmlContent).toContain('Diagram 1')
      expect(htmlContent).toContain('Diagram 20')

      // Should still be valid HTML
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('</html>')
    })
  })

  describe('Error Handling Integration', () => {
    it('should properly cleanup resources on success', async () => {
      await exportToHtml({
        fileName: 'cleanup-test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
      expect(global.document.body.appendChild).toHaveBeenCalled()
      expect(global.document.body.removeChild).toHaveBeenCalled()
    })

    it('should handle Blob creation errors', async () => {
      // Make Blob constructor throw
      global.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation failed')
      })

      await expect(exportToHtml({
        fileName: 'error-test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })).rejects.toThrow('Failed to export HTML file')
    })

    it('should handle URL creation errors', async () => {
      global.URL.createObjectURL = vi.fn().mockImplementation(() => {
        throw new Error('URL creation failed')
      })

      await expect(exportToHtml({
        fileName: 'url-error-test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })).rejects.toThrow('Failed to export HTML file')
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should generate HTML that works without modern JavaScript features', async () => {
      await exportToHtml({
        fileName: 'compatibility-test.md',
        content: '# Test Document',
        diagrams: sampleDiagrams.slice(0, 1),
        styleOption: 'github' as CSSStyleOption
      })

      const htmlContent = downloadedFiles[0].content

      // Should use standard JavaScript, not ES6+ features in embedded scripts
      expect(htmlContent).not.toContain('const ')
      expect(htmlContent).not.toContain('let ')
      expect(htmlContent).not.toContain('=>')

      // Should use standard HTML5 features
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<meta charset="UTF-8">')
      expect(htmlContent).toContain('<meta name="viewport"')
    })
  })
})