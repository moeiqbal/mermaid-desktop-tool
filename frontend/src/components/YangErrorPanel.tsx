import React, { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, FileCode, X, Copy, ExternalLink } from 'lucide-react'
import { useToast } from './NotificationSystem'

interface YangError {
  line: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface YangErrorPanelProps {
  errors: YangError[]
  fileName?: string
  className?: string
  onClose?: () => void
}

const YangErrorPanel: React.FC<YangErrorPanelProps> = ({
  errors,
  fileName,
  className = '',
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())
  const toast = useToast()

  const toggleErrorExpansion = (index: number) => {
    const newExpanded = new Set(expandedErrors)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedErrors(newExpanded)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const copyErrorsToClipboard = () => {
    const errorText = errors
      .map(error => `Line ${error.line}: [${error.severity.toUpperCase()}] ${error.message}`)
      .join('\n')

    navigator.clipboard.writeText(errorText)
    toast.success('Copied to Clipboard', 'Error details copied to clipboard')
  }

  const getErrorSummary = () => {
    const errorCount = errors.filter(e => e.severity === 'error').length
    const warningCount = errors.filter(e => e.severity === 'warning').length
    const infoCount = errors.filter(e => e.severity === 'info').length

    const parts = []
    if (errorCount > 0) parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`)
    if (warningCount > 0) parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`)
    if (infoCount > 0) parts.push(`${infoCount} info`)

    return parts.join(', ')
  }

  if (errors.length === 0) {
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <FileCode className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              YANG Parse Errors
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fileName && `${fileName} • `}{getErrorSummary()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyErrorsToClipboard}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Copy errors to clipboard"
          >
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Close error panel"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Error List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {errors.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No parse errors found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {errors.map((error, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(error.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Line {error.line}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {error.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            error.severity === 'error'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : error.severity === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {error.severity}
                          </span>
                        </div>
                      </div>

                      {/* Expandable error details */}
                      {error.message.length > 100 && (
                        <button
                          onClick={() => toggleErrorExpansion(index)}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          {expandedErrors.has(index) ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Show details
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer with helpful information */}
      {isExpanded && errors.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium mb-1">Common YANG Issues:</p>
              <ul className="text-xs space-y-1 text-gray-500 dark:text-gray-400">
                <li>• Check for unmatched braces or brackets</li>
                <li>• Verify module name matches filename</li>
                <li>• Ensure required statements (namespace, prefix) are present</li>
                <li>• Check for invalid characters or syntax</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default YangErrorPanel