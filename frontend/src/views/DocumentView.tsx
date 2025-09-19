import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { Upload, FileText, Search, RefreshCw, Palette, Sun, Moon, AlertCircle, FileCode, Trash2 } from 'lucide-react'
import InlineDiagram from '../components/InlineDiagram'
import { useToast } from '../components/NotificationSystem'
import { parseDocumentContent, DocumentContent, getDocumentCSS } from '../utils/documentParser'
import { CSSStyleOption, getStyleOptions } from '../utils/htmlExport'
import { initMermaid } from '../utils/mermaid'

interface FileItem {
  id: string
  name: string
  path: string
  size: number
  modified: string
  type: 'markdown' | 'mermaid' | 'yang'
  extension: string
}

const DocumentView: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [documentContent, setDocumentContent] = useState<DocumentContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<CSSStyleOption>('tailwind')
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('document-view-dark-mode')
    return savedTheme ? JSON.parse(savedTheme) : false
  })
  const contentRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Initialize Mermaid
  useEffect(() => {
    initMermaid()
  }, [])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('document-view-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  // Load files on mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/files')
      const markdownFiles = response.data.filter((file: FileItem) =>
        file.type === 'markdown'
      )
      setFiles(markdownFiles)
      setError(null)
    } catch (err) {
      const errorMessage = 'Failed to load files'
      setError(errorMessage)
      toast.error('File Loading Failed', 'Unable to load files from server. Please try again.')
      console.error('Error loading files:', err)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadProgress(true)
    try {
      const formData = new FormData()
      acceptedFiles.forEach(file => {
        formData.append('files', file)
      })

      await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      loadFiles()
      toast.success('Upload Complete', 'Files uploaded successfully.')
    } catch (err) {
      setError('Failed to upload files')
      toast.error('Upload Failed', 'Unable to upload files. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploadProgress(false)
    }
  }, [loadFiles, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md']
    },
    multiple: true
  })

  const loadFileContent = useCallback(async (file: FileItem) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/files/${file.id}/content`)
      const content = response.data.content

      const parsedContent = parseDocumentContent(content)
      setDocumentContent(parsedContent)
      setError(null)
    } catch (err) {
      setError('Failed to load file content')
      toast.error('File Load Failed', 'Unable to load file content.')
      console.error('Error loading file content:', err)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file)
    setError(null)
    loadFileContent(file)
  }

  const handleDeleteFile = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/files/${file.id}`)
      setFiles(prev => prev.filter(f => f.id !== file.id))

      // If the deleted file was currently selected, clear the selection
      if (selectedFile?.id === file.id) {
        setSelectedFile(null)
        setDocumentContent(null)
      }

      toast.success('File Deleted', 'File has been successfully deleted.')
    } catch (err) {
      setError('Failed to delete file')
      toast.error('Delete Failed', 'Unable to delete the file. Please try again.')
      console.error('Error deleting file:', err)
    }
  }

  const handleOpenInMermaidViewer = (_diagramId: string) => {
    // This would implement cross-tab synchronization
    toast.info('Coming Soon', 'Cross-tab synchronization with Mermaid Viewer will be implemented soon.')
  }

  const handleOpenFullscreen = (_diagramId: string) => {
    // This would open the diagram in fullscreen mode
    toast.info('Coming Soon', 'Fullscreen diagram view will be implemented soon.')
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-full">
      {/* File Panel */}
      <div className="w-80 panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Markdown Files
          </h2>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-4 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            {uploadProgress ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop Markdown files here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .md files only
                </p>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && !selectedFile ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery ? 'No files match your search' : 'No Markdown files found'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedFile?.id === file.id
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFile(file, e)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Delete ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Document Preview'}
              </h3>
              {documentContent && documentContent.diagrams.length > 0 && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                  {documentContent.diagrams.length} diagrams
                </span>
              )}
            </div>

            {/* Theme Controls in Header */}
            {selectedFile && (
              <div className="flex items-center gap-4">
                {/* Theme Selector */}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <label className="text-sm text-gray-600 dark:text-gray-400">Theme:</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value as CSSStyleOption)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getStyleOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Dark mode:</label>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && selectedFile ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading document...</span>
              </div>
            </div>
          ) : !selectedFile ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Markdown file
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a file from the sidebar to view its content with inline diagrams
                </p>
              </div>
            </div>
          ) : documentContent ? (
            <div className="p-8">
              <style dangerouslySetInnerHTML={{ __html: getDocumentCSS(selectedTheme, darkMode) }} />

              <div className="document-content" ref={contentRef}>
                {documentContent.sections.map((section, index) => {
                  // Check if there are diagrams that should appear after this section
                  const followingDiagrams = documentContent.diagrams.filter(diagram =>
                    diagram.startLine > section.endLine &&
                    (index === documentContent.sections.length - 1 ||
                     diagram.startLine < documentContent.sections[index + 1]?.startLine)
                  )

                  return (
                    <React.Fragment key={section.id}>
                      <div
                        id={section.id}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />

                      {followingDiagrams.map(diagram => (
                        <InlineDiagram
                          key={diagram.id}
                          diagram={diagram}
                          onOpenInMermaidViewer={handleOpenInMermaidViewer}
                          onOpenFullscreen={handleOpenFullscreen}
                          theme={darkMode ? 'dark' : 'light'}
                        />
                      ))}
                    </React.Fragment>
                  )
                })}

                {/* Render any remaining diagrams at the end */}
                {documentContent.diagrams
                  .filter(diagram =>
                    documentContent.sections.length === 0 ||
                    diagram.startLine > documentContent.sections[documentContent.sections.length - 1]?.endLine
                  )
                  .map(diagram => (
                    <InlineDiagram
                      key={diagram.id}
                      diagram={diagram}
                      onOpenInMermaidViewer={handleOpenInMermaidViewer}
                      onOpenFullscreen={handleOpenFullscreen}
                      theme={darkMode ? 'dark' : 'light'}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Failed to parse document
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Unable to parse the selected Markdown file
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentView