import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BrowserCompatibilityCheck from '../components/BrowserCompatibilityCheck'

// Mock navigator.userAgent for testing
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  })
}

describe('BrowserCompatibilityCheck', () => {
  let consoleSpy: any

  beforeEach(() => {
    // Reset navigator.userAgent before each test
    vi.clearAllMocks()
    // Mock console.log to capture debug output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should render children when not Safari', () => {
    // Mock Chrome user agent
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.queryByText('Browser Not Supported')).not.toBeInTheDocument()
  })

  it('should render children when using Firefox', () => {
    // Mock Firefox user agent
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.queryByText('Browser Not Supported')).not.toBeInTheDocument()
  })

  it('should render children when using Edge', () => {
    // Mock Edge user agent
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.queryByText('Browser Not Supported')).not.toBeInTheDocument()
  })

  it('should show compatibility message for Safari desktop', () => {
    // Mock Safari desktop user agent
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.1.1 Safari/537.36')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.queryByTestId('app-content')).not.toBeInTheDocument()
    expect(screen.getByText('Browser Not Supported')).toBeInTheDocument()
    expect(screen.getByText(/This application requires features that are not compatible with Safari/)).toBeInTheDocument()
  })

  it('should show compatibility message for Safari on iOS', () => {
    // Mock Safari iOS user agent
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.queryByTestId('app-content')).not.toBeInTheDocument()
    expect(screen.getByText('Browser Not Supported')).toBeInTheDocument()
  })

  it('should show compatibility message for Safari on iPad', () => {
    // Mock Safari iPad user agent
    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.queryByTestId('app-content')).not.toBeInTheDocument()
    expect(screen.getByText('Browser Not Supported')).toBeInTheDocument()
  })

  it('should display recommended browsers with correct links', () => {
    // Mock Safari user agent to trigger compatibility message
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.1.1 Safari/537.36')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    // Check for browser recommendations
    expect(screen.getByText('Google Chrome')).toBeInTheDocument()
    expect(screen.getByText('Mozilla Firefox')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Edge')).toBeInTheDocument()

    // Check for download links
    const chromeLink = screen.getByRole('link', { name: /Google Chrome/ })
    const firefoxLink = screen.getByRole('link', { name: /Mozilla Firefox/ })
    const edgeLink = screen.getByRole('link', { name: /Microsoft Edge/ })

    expect(chromeLink).toHaveAttribute('href', 'https://www.google.com/chrome/')
    expect(firefoxLink).toHaveAttribute('href', 'https://www.mozilla.org/firefox/')
    expect(edgeLink).toHaveAttribute('href', 'https://www.microsoft.com/edge')

    // Check that links open in new tab
    expect(chromeLink).toHaveAttribute('target', '_blank')
    expect(firefoxLink).toHaveAttribute('target', '_blank')
    expect(edgeLink).toHaveAttribute('target', '_blank')
  })

  it('should display apologetic message about Safari support', () => {
    // Mock Safari user agent
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.1.1 Safari/537.36')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByText(/Safari support is on our roadmap/)).toBeInTheDocument()
    expect(screen.getByText(/we're working to resolve compatibility issues/)).toBeInTheDocument()
  })

  it('should not block Chrome with Safari in user agent string', () => {
    // Mock Chrome user agent that contains "Safari" (which is common)
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.queryByText('Browser Not Supported')).not.toBeInTheDocument()
  })

  it('should log debug information for browser detection', () => {
    const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.1.1 Safari/537.36'
    mockUserAgent(safariUA)

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(consoleSpy).toHaveBeenCalledWith('🔍 Browser detection:', expect.objectContaining({
      userAgent: safariUA,
      isSafariRegex: expect.any(Boolean),
      isMobileSafari: expect.any(Boolean)
    }))
  })

  it('should handle undefined navigator gracefully', () => {
    // Mock undefined navigator (server-side rendering scenario)
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      configurable: true
    })

    render(
      <BrowserCompatibilityCheck>
        <div data-testid="app-content">App Content</div>
      </BrowserCompatibilityCheck>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.queryByText('Browser Not Supported')).not.toBeInTheDocument()
  })
})