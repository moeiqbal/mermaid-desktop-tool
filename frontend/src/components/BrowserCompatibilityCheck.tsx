import React, { ReactNode } from 'react'
import { AlertTriangle, Chrome, ExternalLink } from 'lucide-react'

interface BrowserCompatibilityCheckProps {
  children: ReactNode
}

/**
 * BrowserCompatibilityCheck component that detects Safari browsers and displays
 * a user-friendly compatibility message instead of allowing access to the broken application.
 *
 * This component prevents the 79% test failure rate in Safari by blocking access
 * and directing users to supported browsers.
 */
const BrowserCompatibilityCheck: React.FC<BrowserCompatibilityCheckProps> = ({ children }) => {
  // Detect Safari browser (including mobile Safari)
  const isSafari = (): boolean => {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent.toLowerCase()

    // Detect Safari but exclude Chrome-based browsers
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
           // Additional check for mobile Safari on iOS
           (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/chrome/.test(userAgent))
  }

  // If Safari is detected, show compatibility message
  if (isSafari()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-dark-900 rounded-lg shadow-premium dark:shadow-premium-dark border border-gray-200 dark:border-dark-700 p-8 text-center fade-in">
          {/* Warning Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Browser Not Supported
            </h1>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              This application requires features that are not compatible with Safari.
              Please use one of the recommended browsers below for the best experience.
            </p>
          </div>

          {/* Recommended Browsers */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recommended Browsers
            </h3>

            <div className="space-y-3">
              {/* Chrome */}
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200 hover-lift group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Chrome className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Google Chrome</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Recommended</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </a>

              {/* Firefox */}
              <a
                href="https://www.mozilla.org/firefox/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200 hover-lift group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 7.05c-.39-.39-1.02-.39-1.41 0L12 10.59 8.46 7.05c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12l-3.54 3.54c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l3.54 3.54c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l3.54-3.54c.39-.39.39-1.02 0-1.41z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Mozilla Firefox</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Fast & secure</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </a>

              {/* Microsoft Edge */}
              <a
                href="https://www.microsoft.com/edge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200 hover-lift group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.25 0 4.87 1.92 3.08 4.94c-.46.78-.08 1.78.84 1.78h6.58c1.15 0 2.08.93 2.08 2.08s-.93 2.08-2.08 2.08H3.92c-.92 0-1.3-1-.84-1.78C1.92 6.13 0 8.25 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12S18.63 0 12 0z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Microsoft Edge</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Built-in Windows</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Footer Message */}
          <div className="pt-6 border-t border-gray-200 dark:border-dark-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We apologize for the inconvenience. Safari support is on our roadmap and we&apos;re working to resolve compatibility issues in future updates.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If not Safari, render the application normally
  return <>{children}</>
}

export default BrowserCompatibilityCheck