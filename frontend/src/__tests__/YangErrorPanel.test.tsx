import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import YangErrorPanel from '../components/YangErrorPanel'

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

// Mock clipboard API
Object.assign(global.navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
})

describe('YangErrorPanel', () => {
  const mockErrors = [
    {
      line: 10,
      message: 'Missing semicolon at end of statement',
      severity: 'error' as const
    },
    {
      line: 25,
      message: 'Deprecated syntax, consider updating',
      severity: 'warning' as const
    },
    {
      line: 5,
      message: 'Additional information about parsing',
      severity: 'info' as const
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when no errors provided', () => {
    const { container } = render(<YangErrorPanel errors={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render error panel with correct summary', () => {
    render(<YangErrorPanel errors={mockErrors} fileName="test.yang" />)

    expect(screen.getByText('YANG Parse Errors')).toBeInTheDocument()
    expect(screen.getByText('test.yang • 1 error, 1 warning, 1 info')).toBeInTheDocument()
  })

  it('should display all errors with correct information', () => {
    render(<YangErrorPanel errors={mockErrors} />)

    expect(screen.getByText('Line 10')).toBeInTheDocument()
    expect(screen.getByText('Missing semicolon at end of statement')).toBeInTheDocument()

    expect(screen.getByText('Line 25')).toBeInTheDocument()
    expect(screen.getByText('Deprecated syntax, consider updating')).toBeInTheDocument()

    expect(screen.getByText('Line 5')).toBeInTheDocument()
    expect(screen.getByText('Additional information about parsing')).toBeInTheDocument()
  })

  it('should show severity badges with correct colors', () => {
    render(<YangErrorPanel errors={mockErrors} />)

    const errorBadge = screen.getByText('error')
    const warningBadge = screen.getByText('warning')
    const infoBadge = screen.getByText('info')

    expect(errorBadge).toHaveClass('bg-red-100', 'text-red-700')
    expect(warningBadge).toHaveClass('bg-yellow-100', 'text-yellow-700')
    expect(infoBadge).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('should expand and collapse when clicking header button', async () => {
    render(<YangErrorPanel errors={mockErrors} />)

    const collapseButton = screen.getByTitle('Collapse')

    // Initially expanded
    expect(screen.getByText('Line 10')).toBeInTheDocument()

    // Collapse
    fireEvent.click(collapseButton)
    expect(screen.queryByText('Line 10')).not.toBeInTheDocument()

    // Expand again
    const expandButton = screen.getByTitle('Expand')
    fireEvent.click(expandButton)
    expect(screen.getByText('Line 10')).toBeInTheDocument()
  })

  it('should copy errors to clipboard when copy button is clicked', async () => {
    render(<YangErrorPanel errors={mockErrors} fileName="test.yang" />)

    const copyButton = screen.getByTitle('Copy errors to clipboard')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Line 10: [ERROR] Missing semicolon at end of statement\n' +
        'Line 25: [WARNING] Deprecated syntax, consider updating\n' +
        'Line 5: [INFO] Additional information about parsing'
      )
      expect(mockToast.success).toHaveBeenCalledWith(
        'Copied to Clipboard',
        'Error details copied to clipboard'
      )
    })
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn()
    render(<YangErrorPanel errors={mockErrors} onClose={mockOnClose} />)

    const closeButton = screen.getByTitle('Close error panel')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should not render close button when onClose is not provided', () => {
    render(<YangErrorPanel errors={mockErrors} />)

    expect(screen.queryByTitle('Close error panel')).not.toBeInTheDocument()
  })

  it('should display helpful tips in footer', () => {
    render(<YangErrorPanel errors={mockErrors} />)

    expect(screen.getByText('Common YANG Issues:')).toBeInTheDocument()
    expect(screen.getByText('• Check for unmatched braces or brackets')).toBeInTheDocument()
    expect(screen.getByText('• Verify module name matches filename')).toBeInTheDocument()
    expect(screen.getByText('• Ensure required statements (namespace, prefix) are present')).toBeInTheDocument()
    expect(screen.getByText('• Check for invalid characters or syntax')).toBeInTheDocument()
  })

  it('should format error summary correctly for single error', () => {
    const singleError = [
      {
        line: 1,
        message: 'Single error message',
        severity: 'error' as const
      }
    ]

    render(<YangErrorPanel errors={singleError} fileName="test.yang" />)
    expect(screen.getByText('test.yang • 1 error')).toBeInTheDocument()
  })

  it('should format error summary correctly for multiple errors of same type', () => {
    const multipleErrors = [
      {
        line: 1,
        message: 'First error',
        severity: 'error' as const
      },
      {
        line: 2,
        message: 'Second error',
        severity: 'error' as const
      }
    ]

    render(<YangErrorPanel errors={multipleErrors} />)
    expect(screen.getByText('2 errors')).toBeInTheDocument()
  })

  it('should handle long error messages', () => {
    const longMessageError = [
      {
        line: 1,
        message: 'This is a very long error message that should potentially be truncated or handled appropriately in the UI to ensure good user experience and readability',
        severity: 'error' as const
      }
    ]

    render(<YangErrorPanel errors={longMessageError} />)

    const errorMessage = screen.getByText(/This is a very long error message/)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should handle edge case with line number 0', () => {
    const zeroLineError = [
      {
        line: 0,
        message: 'Error at line 0',
        severity: 'error' as const
      }
    ]

    render(<YangErrorPanel errors={zeroLineError} />)
    expect(screen.getByText('Line 0')).toBeInTheDocument()
  })

  it('should apply custom className when provided', () => {
    const { container } = render(
      <YangErrorPanel errors={mockErrors} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle empty filename gracefully', () => {
    render(<YangErrorPanel errors={mockErrors} fileName="" />)
    expect(screen.getByText('1 error, 1 warning, 1 info')).toBeInTheDocument()
  })

  it('should maintain expanded state correctly', () => {
    render(<YangErrorPanel errors={mockErrors} />)

    // Initially expanded
    expect(screen.getByText('Line 10')).toBeInTheDocument()

    // Collapse
    fireEvent.click(screen.getByTitle('Collapse'))
    expect(screen.queryByText('Line 10')).not.toBeInTheDocument()

    // Should still be collapsed after re-render
    expect(screen.queryByText('Line 10')).not.toBeInTheDocument()
  })

  it('should handle mixed severity levels correctly', () => {
    const mixedErrors = [
      { line: 1, message: 'Error 1', severity: 'error' as const },
      { line: 2, message: 'Warning 1', severity: 'warning' as const },
      { line: 3, message: 'Error 2', severity: 'error' as const },
      { line: 4, message: 'Info 1', severity: 'info' as const },
      { line: 5, message: 'Warning 2', severity: 'warning' as const }
    ]

    render(<YangErrorPanel errors={mixedErrors} />)
    expect(screen.getByText('2 errors, 2 warnings, 1 info')).toBeInTheDocument()
  })

  it('should handle keyboard navigation for accessibility', () => {
    render(<YangErrorPanel errors={mockErrors} onClose={vi.fn()} />)

    const collapseButton = screen.getByTitle('Collapse')
    const copyButton = screen.getByTitle('Copy errors to clipboard')
    const closeButton = screen.getByTitle('Close error panel')

    // Test that buttons are focusable
    collapseButton.focus()
    expect(document.activeElement).toBe(collapseButton)

    copyButton.focus()
    expect(document.activeElement).toBe(copyButton)

    closeButton.focus()
    expect(document.activeElement).toBe(closeButton)
  })
})