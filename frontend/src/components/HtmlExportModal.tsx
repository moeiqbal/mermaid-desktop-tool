import React, { useState } from 'react'
import { X, Download, Palette, Sun, Moon, FileText } from 'lucide-react'
import { exportToHtml, getStyleOptions, CSSStyleOption } from '../utils/htmlExport'
import { DiagramMetadata } from '../utils/mermaid'
import { useToast } from './NotificationSystem'

interface HtmlExportModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  content: string
  diagrams: DiagramMetadata[]
}

const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  fileName,
  content,
  diagrams
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CSSStyleOption>('tailwind')
  const [darkMode, setDarkMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const toast = useToast()

  const styleOptions = getStyleOptions()

  const handleExport = async () => {
    if (diagrams.length === 0) {
      toast.error('No Diagrams Found', 'This file does not contain any Mermaid diagrams to export.')
      return
    }

    setIsExporting(true)

    try {
      await exportToHtml({
        fileName,
        content,
        diagrams,
        styleOption: selectedStyle,
        darkMode
      })

      toast.success('HTML Export Complete', `Successfully exported ${diagrams.length} diagram(s) to HTML file.`)
      onClose()
    } catch (error) {
      console.error('HTML export failed:', error)
      toast.error('Export Failed', 'Unable to export HTML file. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Export to HTML
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fileName} • {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                <Palette className="w-4 h-4 inline mr-2" />
                CSS Style Theme
              </label>
              <div className="space-y-2">
                {styleOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="radio"
                      name="styleOption"
                      value={option.id}
                      checked={selectedStyle === option.id}
                      onChange={(e) => setSelectedStyle(e.target.value as CSSStyleOption)}
                      className="mt-0.5 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center">
                  {darkMode ? (
                    <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                  ) : (
                    <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export with dark theme styling
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What will be exported:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Markdown content as formatted HTML</li>
                <li>• {diagrams.length} interactive Mermaid diagram{diagrams.length !== 1 ? 's' : ''}</li>
                <li>• Responsive design that works offline</li>
                <li>• Print-friendly styling</li>
              </ul>
            </div>

            {/* Export Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> The exported HTML file will use CDN resources for Mermaid rendering.
                An internet connection is required for diagrams to display properly.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || diagrams.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export HTML
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HtmlExportModal