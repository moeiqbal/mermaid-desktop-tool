import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
  isRetrying: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      isRetrying: false
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ isRetrying: true })

    // Simulate retry delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false
      })
    }, 1000)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-premium p-6 text-center fade-in">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We encountered an unexpected error. This has been logged and we're working on a fix.
              </p>
            </div>

            {/* Error details (development mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Error Details
                </summary>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono overflow-auto max-h-32">
                  <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full btn-primary flex items-center justify-center"
              >
                {this.state.isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </button>

              <button
                onClick={this.handleReload}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Reload Application
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If this problem persists, please refresh your browser or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary