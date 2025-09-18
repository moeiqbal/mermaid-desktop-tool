import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToHtml, getStyleOptions, CSSStyleOption } from '../utils/htmlExport'
import type { DiagramMetadata } from '../utils/mermaid'

// Mock DOM APIs
Object.assign(global, {
  URL: {
    createObjectURL: vi.fn(() => 'mocked-url'),
    revokeObjectURL: vi.fn()
  },
  Blob: vi.fn((content, options) => ({ content, options }))
})

// Mock document methods
const mockDocument = {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn()
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
})

describe('HTML Export Utils', () => {
  const mockDiagrams: DiagramMetadata[] = [
    {
      content: 'graph TD\n  A --> B',
      index: 0,
      title: 'Test Diagram 1',
      startLine: 5,
      endLine: 8,
      rawBlock: '```mermaid\ngraph TD\n  A --> B\n```'
    },
    {
      content: 'sequenceDiagram\n  Alice->>Bob: Hello',
      index: 1,
      title: 'Test Diagram 2',
      startLine: 15,
      endLine: 18,
      rawBlock: '```mermaid\nsequenceDiagram\n  Alice->>Bob: Hello\n```'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStyleOptions', () => {
    it('should return all available style options', () => {
      const options = getStyleOptions()

      expect(options).toHaveLength(3)
      expect(options).toEqual([
        {
          id: 'tailwind',
          name: 'Tailwind CSS',
          description: 'Modern utility-first CSS framework styling'
        },
        {
          id: 'github',
          name: 'GitHub Style',
          description: 'GitHub-like Markdown rendering'
        },
        {
          id: 'custom',
          name: 'Custom Theme',
          description: 'Custom designed theme with enhanced typography'
        }
      ])
    })

    it('should have correct CSS style option IDs', () => {
      const options = getStyleOptions()
      const ids = options.map(opt => opt.id)

      expect(ids).toContain('tailwind')
      expect(ids).toContain('github')
      expect(ids).toContain('custom')
    })
  })

  describe('exportToHtml', () => {
    it('should create and download HTML file with correct name', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }

      mockDocument.createElement.mockReturnValue(mockLink)

      await exportToHtml({
        fileName: 'test-document.md',
        content: '# Test Document\n\nSome content here.',
        diagrams: mockDiagrams,
        styleOption: 'tailwind' as CSSStyleOption,
        darkMode: false
      })

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test-document-export.html')
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockLink)
    })

    it('should handle filename without extension', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }

      mockDocument.createElement.mockReturnValue(mockLink)

      await exportToHtml({
        fileName: 'test-document',
        content: '# Test',
        diagrams: [],
        styleOption: 'github' as CSSStyleOption
      })

      expect(mockLink.download).toBe('test-document-export.html')
    })

    it('should create blob with correct HTML content', async () => {
      await exportToHtml({
        fileName: 'test.md',
        content: '# Test Document',
        diagrams: mockDiagrams,
        styleOption: 'custom' as CSSStyleOption,
        darkMode: true
      })

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('<!DOCTYPE html>')],
        { type: 'text/html;charset=utf-8' }
      )
    })

    it('should include all diagrams in generated HTML', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: mockDiagrams,
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('Test Diagram 1')
      expect(htmlContent).toContain('Test Diagram 2')
      expect(htmlContent).toContain('graph TD')
      expect(htmlContent).toContain('A --> B')
      expect(htmlContent).toContain('sequenceDiagram')
    })

    it('should apply dark mode styling when enabled', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'custom' as CSSStyleOption,
        darkMode: true
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('darkMode: true')
      expect(htmlContent).toContain('theme: \'dark\'')
    })

    it('should apply light mode styling when disabled', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption,
        darkMode: false
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('darkMode: false')
      expect(htmlContent).toContain('theme: \'default\'')
    })

    it('should include mermaid CDN script', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: mockDiagrams,
        styleOption: 'github' as CSSStyleOption
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('cdn.jsdelivr.net/npm/mermaid@')
      expect(htmlContent).toContain('mermaid.initialize')
    })

    it('should convert markdown content to HTML', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Main Title\n\n## Subtitle\n\n**Bold text** and *italic text*',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('<h1>Main Title</h1>')
      expect(htmlContent).toContain('<h2>Subtitle</h2>')
      expect(htmlContent).toContain('<strong>Bold text</strong>')
      expect(htmlContent).toContain('<em>italic text</em>')
    })

    it('should handle empty diagrams array', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test Document\n\nNo diagrams here.',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('Test Document')
      expect(htmlContent).toContain('No diagrams here.')
      expect(htmlContent).not.toContain('class="diagram-container"')
    })

    it('should include metadata in generated HTML', async () => {
      const mockBlob = vi.fn()
      global.Blob = mockBlob

      await exportToHtml({
        fileName: 'test-file.md',
        content: '# Test',
        diagrams: mockDiagrams,
        styleOption: 'custom' as CSSStyleOption,
        darkMode: true
      })

      const htmlContent = mockBlob.mock.calls[0][0][0]

      expect(htmlContent).toContain('<title>test-file.md - Mermaid Diagrams</title>')
      expect(htmlContent).toContain('Generated on')
      expect(htmlContent).toContain('Style: Custom (Dark Mode)')
    })

    it('should handle errors gracefully', async () => {
      // Mock Blob to throw an error
      global.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation failed')
      })

      await expect(exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })).rejects.toThrow('Failed to export HTML file')
    })

    it('should cleanup URLs after download', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }

      mockDocument.createElement.mockReturnValue(mockLink)
      // Ensure Blob constructor works for this test
      global.Blob = vi.fn().mockReturnValue({ type: 'text/html' })

      await exportToHtml({
        fileName: 'test.md',
        content: '# Test',
        diagrams: [],
        styleOption: 'tailwind' as CSSStyleOption
      })

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mocked-url')
    })
  })
})