import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HtmlExportModal from '../components/HtmlExportModal'
import type { DiagramMetadata } from '../utils/mermaid'

// Mock the HTML export utility
vi.mock('../utils/htmlExport', () => {
  const mockExportToHtml = vi.fn()
  return {
    exportToHtml: mockExportToHtml,
    getStyleOptions: () => [
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
    ]
  }
})

// Mock the notification system
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn()
}

vi.mock('../components/NotificationSystem', () => ({
  useToast: () => mockToast
}))

// Import the mocked module to access the mock
import * as htmlExportModule from '../utils/htmlExport'
const mockExportToHtml = vi.mocked(htmlExportModule.exportToHtml)

describe('HtmlExportModal', () => {
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

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    fileName: 'test-document.md',
    content: '# Test Document\n\nSome content here.',
    diagrams: mockDiagrams
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<HtmlExportModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Export to HTML')).not.toBeInTheDocument()
  })

  it('should render modal with correct title and file info', () => {
    render(<HtmlExportModal {...defaultProps} />)

    expect(screen.getByText('Export to HTML')).toBeInTheDocument()
    expect(screen.getByText('test-document.md • 2 diagrams')).toBeInTheDocument()
  })

  it('should display all CSS style options', () => {
    render(<HtmlExportModal {...defaultProps} />)

    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('Modern utility-first CSS framework styling')).toBeInTheDocument()

    expect(screen.getByText('GitHub Style')).toBeInTheDocument()
    expect(screen.getByText('GitHub-like Markdown rendering')).toBeInTheDocument()

    expect(screen.getByText('Custom Theme')).toBeInTheDocument()
    expect(screen.getByText('Custom designed theme with enhanced typography')).toBeInTheDocument()
  })

  it('should have Tailwind CSS selected by default', () => {
    render(<HtmlExportModal {...defaultProps} />)

    const tailwindRadio = screen.getByRole('radio', { name: /Tailwind CSS/ })
    expect(tailwindRadio).toBeChecked()
  })

  it('should allow selecting different CSS styles', () => {
    render(<HtmlExportModal {...defaultProps} />)

    const githubRadio = screen.getByRole('radio', { name: /GitHub Style/ })
    fireEvent.click(githubRadio)

    expect(githubRadio).toBeChecked()
    expect(screen.getByRole('radio', { name: /Tailwind CSS/ })).not.toBeChecked()
  })

  it('should toggle dark mode option', () => {
    render(<HtmlExportModal {...defaultProps} />)

    const darkModeCheckbox = screen.getByRole('checkbox', { name: /Dark Mode/ })
    expect(darkModeCheckbox).not.toBeChecked()

    fireEvent.click(darkModeCheckbox)
    expect(darkModeCheckbox).toBeChecked()
  })

  it('should display export preview information', () => {
    render(<HtmlExportModal {...defaultProps} />)

    expect(screen.getByText('What will be exported:')).toBeInTheDocument()
    expect(screen.getByText('• Markdown content as formatted HTML')).toBeInTheDocument()
    expect(screen.getByText('• 2 interactive Mermaid diagrams')).toBeInTheDocument()
    expect(screen.getByText('• Responsive design that works offline')).toBeInTheDocument()
    expect(screen.getByText('• Print-friendly styling')).toBeInTheDocument()
  })

  it('should show warning about CDN requirement', () => {
    render(<HtmlExportModal {...defaultProps} />)

    expect(screen.getByText(/An internet connection is required for diagrams to display properly/)).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', () => {
    const mockOnClose = vi.fn()
    render(<HtmlExportModal {...defaultProps} onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when cancel button is clicked', () => {
    const mockOnClose = vi.fn()
    render(<HtmlExportModal {...defaultProps} onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when backdrop is clicked', () => {
    const mockOnClose = vi.fn()
    render(<HtmlExportModal {...defaultProps} onClose={mockOnClose} />)

    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('should export HTML when export button is clicked', async () => {
    mockExportToHtml.mockResolvedValue(undefined)

    render(<HtmlExportModal {...defaultProps} />)

    // Select GitHub style
    fireEvent.click(screen.getByRole('radio', { name: /GitHub Style/ }))

    // Enable dark mode
    fireEvent.click(screen.getByRole('checkbox', { name: /Dark Mode/ }))

    // Click export
    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    await waitFor(() => {
      expect(mockExportToHtml).toHaveBeenCalledWith({
        fileName: 'test-document.md',
        content: '# Test Document\n\nSome content here.',
        diagrams: mockDiagrams,
        styleOption: 'github',
        darkMode: true
      })
    })
  })

  it('should show loading state during export', async () => {
    mockExportToHtml.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<HtmlExportModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    expect(screen.getByText('Exporting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Exporting/ })).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText('Exporting...')).not.toBeInTheDocument()
    })
  })

  it('should show success message after successful export', async () => {
    mockExportToHtml.mockResolvedValue(undefined)

    const mockOnClose = vi.fn()
    render(<HtmlExportModal {...defaultProps} onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        'HTML Export Complete',
        'Successfully exported 2 diagram(s) to HTML file.'
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show error message when export fails', async () => {
    mockExportToHtml.mockRejectedValue(new Error('Export failed'))

    render(<HtmlExportModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Export Failed',
        'Unable to export HTML file. Please try again.'
      )
    })
  })

  it('should show error when no diagrams are present', async () => {
    render(<HtmlExportModal {...defaultProps} diagrams={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'No Diagrams Found',
        'This file does not contain any Mermaid diagrams to export.'
      )
    })

    expect(mockExportToHtml).not.toHaveBeenCalled()
  })

  it('should disable export button when no diagrams', () => {
    render(<HtmlExportModal {...defaultProps} diagrams={[]} />)

    expect(screen.getByRole('button', { name: /Export HTML/ })).toBeDisabled()
  })

  it('should update diagram count in preview', () => {
    const singleDiagram = [mockDiagrams[0]]
    render(<HtmlExportModal {...defaultProps} diagrams={singleDiagram} />)

    expect(screen.getByText('test-document.md • 1 diagram')).toBeInTheDocument()
    expect(screen.getByText('• 1 interactive Mermaid diagram')).toBeInTheDocument()
  })

  it('should handle empty filename gracefully', () => {
    render(<HtmlExportModal {...defaultProps} fileName="" />)

    expect(screen.getByText('• 2 diagrams')).toBeInTheDocument()
  })

  it('should preserve form state during interactions', () => {
    render(<HtmlExportModal {...defaultProps} />)

    // Select custom theme
    fireEvent.click(screen.getByRole('radio', { name: /Custom Theme/ }))

    // Enable dark mode
    fireEvent.click(screen.getByRole('checkbox', { name: /Dark Mode/ }))

    // Verify selections persist
    expect(screen.getByRole('radio', { name: /Custom Theme/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Dark Mode/ })).toBeChecked()
  })

  it('should disable buttons during export', async () => {
    mockExportToHtml.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<HtmlExportModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /Export HTML/ }))

    expect(screen.getByRole('button', { name: /Cancel/ })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/ })).not.toBeDisabled()
    })
  })

  it('should handle keyboard navigation', () => {
    render(<HtmlExportModal {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    const exportButton = screen.getByRole('button', { name: /Export HTML/ })

    // Test that buttons are focusable
    cancelButton.focus()
    expect(document.activeElement).toBe(cancelButton)

    exportButton.focus()
    expect(document.activeElement).toBe(exportButton)
  })
})