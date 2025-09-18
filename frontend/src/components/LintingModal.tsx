import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, CheckCircle, AlertCircle, Wand2, FileText, Hash, RefreshCw, Eye } from 'lucide-react'

interface LintIssue {
  line: number
  column: number
  severity: 'error' | 'warning'
  rule: string
  message: string
  detail?: string
  fixInfo?: any
}

interface LintResult {
  valid: boolean
  issues: LintIssue[]
  summary: {
    total: number
    errors: number
    warnings: number
  }
}

interface FixResult {
  fixed: boolean
  content: string
  message: string
}

interface FileItem {
  id: string
  name: string
  type: 'markdown' | 'mermaid' | 'yang'
}

interface LintingModalProps {
  isOpen: boolean
  file: FileItem | null
  onClose: () => void
  onFileUpdate?: (fileId: string, newContent: string) => void
}

const LintingModal: React.FC<LintingModalProps> = ({
  isOpen,
  file,
  onClose,
  onFileUpdate
}) => {
  const [lintResult, setLintResult] = useState<LintResult | null>(null)
  const [isLinting, setIsLinting] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [fileContent, setFileContent] = useState<string>('')
  const [fixedContent, setFixedContent] = useState<string>('')
  const [showDiff, setShowDiff] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && file) {
      loadFileAndLint()
    }
  }, [isOpen, file])

  const loadFileAndLint = async () => {
    if (!file) return

    setIsLinting(true)
    setError(null)

    try {
      // Load file content
      const contentResponse = await axios.get(`/api/files/${file.id}/content`)
      const content = contentResponse.data.content
      setFileContent(content)

      // Perform linting
      const lintEndpoint = file.type === 'markdown' ? '/api/lint/markdown' : '/api/lint/mermaid'
      const lintResponse = await axios.post(lintEndpoint, { content })
      setLintResult(lintResponse.data)

    } catch (err) {
      console.error('Error linting file:', err)
      setError('Failed to lint file')
    } finally {
      setIsLinting(false)
    }
  }

  const handleAutoFix = async () => {
    if (!file || !fileContent) return

    if (file.type !== 'markdown') {
      setError('Auto-fix is currently only available for Markdown files')
      return
    }

    setIsFixing(true)
    setError(null)

    try {
      const response = await axios.post('/api/lint/markdown/fix', { content: fileContent })
      const fixResult: FixResult = response.data

      if (fixResult.fixed) {
        setFixedContent(fixResult.content)
        setShowDiff(true)
      } else {
        setError('No fixes were needed')
      }

    } catch (err) {
      console.error('Error auto-fixing file:', err)
      setError('Failed to auto-fix file')
    } finally {
      setIsFixing(false)
    }
  }

  const applyFixes = async () => {
    if (!file || !fixedContent) return

    try {
      await axios.put(`/api/files/${file.id}/content`, { content: fixedContent })

      if (onFileUpdate) {
        onFileUpdate(file.id, fixedContent)
      }

      // Re-lint the fixed content
      setFileContent(fixedContent)
      const lintResponse = await axios.post(
        file.type === 'markdown' ? '/api/lint/markdown' : '/api/lint/mermaid',
        { content: fixedContent }
      )
      setLintResult(lintResponse.data)
      setShowDiff(false)
      setFixedContent('')

    } catch (err) {
      console.error('Error applying fixes:', err)
      setError('Failed to apply fixes')
    }
  }

  const getSeverityIcon = (severity: string) => {
    return severity === 'error' ? (
      <AlertCircle className="w-4 h-4 text-red-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-500" />
    )
  }

  const getSeverityColor = (severity: string) => {
    return severity === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
  }

  const renderDiffViewer = () => {
    if (!showDiff || !fileContent || !fixedContent) return null

    const originalLines = fileContent.split('\n')
    const fixedLines = fixedContent.split('\n')
    const maxLines = Math.max(originalLines.length, fixedLines.length)

    return (
      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Proposed Changes
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-0 max-h-96 overflow-y-auto">
          <div className="border-r border-gray-200 dark:border-gray-700">
            <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300">
              Original
            </div>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
              {originalLines.map((line, index) => (
                <div key={index} className="leading-5">
                  <span className="text-gray-400 mr-3">{index + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
          <div>
            <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
              Fixed
            </div>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
              {fixedLines.map((line, index) => (
                <div key={index} className="leading-5">
                  <span className="text-gray-400 mr-3">{index + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setShowDiff(false)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={applyFixes}
            className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Apply Fixes
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {file?.type === 'markdown' ? (
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
            ) : (
              <Hash className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lint Results
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {isLinting ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Analyzing file...</span>
            </div>
          ) : lintResult ? (
            <>
              {/* Summary */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Summary</h4>
                  {lintResult.valid && (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">No issues found</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total Issues:</span>
                    <span className="ml-2 font-medium">{lintResult.summary.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Errors:</span>
                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                      {lintResult.summary.errors}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Warnings:</span>
                    <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
                      {lintResult.summary.warnings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Issues List */}
              {lintResult.issues.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Issues</h4>
                  <div className="space-y-2">
                    {lintResult.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                                {issue.rule}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Line {issue.line}, Column {issue.column}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {issue.message}
                            </p>
                            {issue.detail && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {issue.detail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderDiffViewer()}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Close
          </button>
          {lintResult && !lintResult.valid && file?.type === 'markdown' && !showDiff && (
            <button
              onClick={handleAutoFix}
              disabled={isFixing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFixing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Auto Fix
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LintingModal