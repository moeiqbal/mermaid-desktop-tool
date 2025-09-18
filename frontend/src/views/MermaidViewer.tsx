import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Upload, FileText, Search, Trash2, AlertCircle, RefreshCw, FileCode, Hash, CheckCircle, Wand2, Grid, Globe } from 'lucide-react'
import MermaidDiagram from '../components/MermaidDiagram'
import MultiDiagramViewer from '../components/MultiDiagramViewer'
import ContextMenu from '../components/ContextMenu'
import LintingModal from '../components/LintingModal'
import HtmlExportModal from '../components/HtmlExportModal'
import { FileListSkeleton } from '../components/LoadingSkeleton'
import { useToast } from '../components/NotificationSystem'
import { extractMermaidDiagramsWithMetadata, initMermaid, DiagramMetadata } from '../utils/mermaid'

// Performance optimization: debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface FileItem {
  id: string
  name: string
  path: string
  size: number
  modified: string
  type: 'markdown' | 'mermaid' | 'yang'
  extension: string
}

// Memoized file item component for better performance
const FileListItem = memo<{
  file: FileItem
  isSelected: boolean
  onSelect: (file: FileItem) => void
  onDelete: (file: FileItem, e: React.MouseEvent) => void
  onRightClick: (e: React.MouseEvent, file: FileItem) => void
  formatFileSize: (bytes: number) => string
  getFileIcon: (file: FileItem) => React.ReactNode
}>(function FileListItem({ file, isSelected, onSelect, onDelete, onRightClick, formatFileSize, getFileIcon }) {
  return (
  <div
    className={`flex items-center p-3 rounded-lg cursor-pointer group transition-colors hover-lift ${
      isSelected
        ? 'bg-blue-100 dark:bg-blue-900/30'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
    onClick={() => onSelect(file)}
    onContextMenu={(e) => onRightClick(e, file)}
  >
    <div className="flex-shrink-0 mr-3">
      {getFileIcon(file)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
        {file.name}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatFileSize(file.size)} • {file.type}
      </p>
    </div>
    <button
      onClick={(e) => onDelete(file, e)}
      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
  </div>
  )
})

const MermaidViewer: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [mermaidDefinition, setMermaidDefinition] = useState<string>('')
  const [mermaidDiagrams, setMermaidDiagrams] = useState<DiagramMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    file: FileItem | null
  }>({ isOpen: false, position: { x: 0, y: 0 }, file: null })
  const [lintingModal, setLintingModal] = useState<{
    isOpen: boolean
    file: FileItem | null
  }>({ isOpen: false, file: null })
  const [htmlExportModal, setHtmlExportModal] = useState<{
    isOpen: boolean
    file: FileItem | null
  }>({ isOpen: false, file: null })

  const navigate = useNavigate()
  const toast = useToast()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Initialize Mermaid
  useEffect(() => {
    initMermaid()
  }, [])

  // Load files on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/files')
      const allFiles = response.data.filter((file: FileItem) =>
        file.type === 'markdown' || file.type === 'mermaid'
      )
      setFiles(allFiles)
      setError(null) // Clear any previous errors
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

      loadFiles() // Refresh file list
    } catch (err) {
      setError('Failed to upload files')
      console.error('Upload error:', err)
    } finally {
      setUploadProgress(false)
    }
  }, [loadFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.mmd', '.mermaid']
    },
    multiple: true
  })

  const loadFileContent = useCallback(async (file: FileItem) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/files/${file.id}/content`)
      const content = response.data.content
      setFileContent(content)

      // Extract Mermaid definition(s)
      if (file.type === 'mermaid') {
        setMermaidDefinition(content)
        // For .mermaid files, create a single diagram metadata
        setMermaidDiagrams([{
          content,
          index: 0,
          title: file.name,
          startLine: 0,
          endLine: content.split('\n').length - 1,
          rawBlock: content
        }])
      } else if (file.type === 'markdown') {
        // Extract all diagrams with metadata
        const diagrams = extractMermaidDiagramsWithMetadata(content)
        setMermaidDiagrams(diagrams)

        if (diagrams.length > 0) {
          setMermaidDefinition(diagrams[0].content) // Show first Mermaid block for single view
        } else {
          setMermaidDefinition('')
          setError('No Mermaid diagrams found in this Markdown file')
        }
      }
    } catch (err) {
      setError('Failed to load file content')
      console.error('Error loading file content:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
      if (selectedFile?.id === file.id) {
        setSelectedFile(null)
        setFileContent('')
        setMermaidDefinition('')
      }
    } catch (err) {
      setError('Failed to delete file')
      console.error('Error deleting file:', err)
    }
  }

  const handleRightClick = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault()
    e.stopPropagation()

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      file
    })
  }

  const handleLintFile = (file: FileItem) => {
    setLintingModal({ isOpen: true, file })
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, file: null })
  }

  const handleHtmlExport = (file: FileItem) => {
    setHtmlExportModal({ isOpen: true, file })
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, file: null })
  }

  const handleFileUpdate = (fileId: string, newContent: string) => {
    // Update the content if this file is currently selected
    if (selectedFile?.id === fileId) {
      setFileContent(newContent)
      if (selectedFile.type === 'mermaid') {
        setMermaidDefinition(newContent)
        setMermaidDiagrams([{
          content: newContent,
          index: 0,
          title: selectedFile.name,
          startLine: 0,
          endLine: newContent.split('\n').length - 1,
          rawBlock: newContent
        }])
      } else if (selectedFile.type === 'markdown') {
        const diagrams = extractMermaidDiagramsWithMetadata(newContent)
        setMermaidDiagrams(diagrams)
        if (diagrams.length > 0) {
          setMermaidDefinition(diagrams[0].content)
        } else {
          setMermaidDefinition('')
        }
      }
    }
  }

  const handleOpenFullScreen = useCallback((fileId: string, diagramIndex: number) => {
    navigate(`/diagram/${fileId}/${diagramIndex}`)
  }, [navigate])

  const getContextMenuItems = (file: FileItem) => {
    const items = []

    if (file.type === 'markdown' || file.type === 'mermaid') {
      items.push({
        id: 'lint',
        label: `Lint ${file.type === 'markdown' ? 'Markdown' : 'Mermaid'}`,
        icon: CheckCircle,
        onClick: () => handleLintFile(file)
      })
    }

    if (file.type === 'markdown') {
      items.push({
        id: 'autofix',
        label: 'Auto-fix Issues',
        icon: Wand2,
        onClick: () => handleLintFile(file)
      })

      items.push({
        id: 'html-export',
        label: 'Export to HTML',
        icon: Globe,
        onClick: () => handleHtmlExport(file)
      })
    }

    return items
  }

  // Memoized filtered files to avoid unnecessary re-filtering
  const filteredFiles = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return files
    return files.filter(file =>
      file.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  }, [files, debouncedSearchQuery])

  // Memoized utility functions
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const getFileIcon = useCallback((file: FileItem) => {
    switch (file.type) {
      case 'markdown':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'mermaid':
        return <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
      default:
        return <FileCode className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
  }, [])

  return (
    <div className="flex h-full">
      {/* File Panel */}
      <div className="w-80 panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Files
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
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .md, .mmd, .mermaid files
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
          {isLoading ? (
            <FileListSkeleton count={5} />
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center fade-in">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {debouncedSearchQuery ? 'No files match your search' : 'No files uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="p-2 fade-in">
              {filteredFiles.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onSelect={handleFileSelect}
                  onDelete={handleDeleteFile}
                  onRightClick={handleRightClick}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                />
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

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Diagram Viewer'}
              </h3>
              {selectedFile && mermaidDiagrams.length > 1 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1">
                  <Grid className="w-3 h-3" />
                  {mermaidDiagrams.length} diagrams
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedFile && selectedFile.type === 'markdown' && mermaidDiagrams.length > 0 && (
                <button
                  onClick={() => handleHtmlExport(selectedFile)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
                  title="Export to HTML with interactive diagrams"
                >
                  <Globe className="w-4 h-4" />
                  Export HTML
                </button>
              )}
              {selectedFile && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedFile.type} • {formatFileSize(selectedFile.size)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {selectedFile && mermaidDiagrams.length > 1 ? (
            // Multiple diagrams - use MultiDiagramViewer
            <MultiDiagramViewer
              diagrams={mermaidDiagrams}
              fileId={selectedFile.id}
              fileName={selectedFile.name}
              onOpenFullScreen={handleOpenFullScreen}
            />
          ) : selectedFile && mermaidDefinition ? (
            // Single diagram - use MermaidDiagram
            <MermaidDiagram definition={mermaidDefinition} />
          ) : (
            // No content
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 mx-auto flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedFile ? 'No Mermaid content found' : 'Select a file to view'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedFile
                    ? 'This file doesn\'t contain valid Mermaid diagrams'
                    : 'Upload Markdown or Mermaid files to get started'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenu.file ? getContextMenuItems(contextMenu.file) : []}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, file: null })}
      />

      {/* Linting Modal */}
      <LintingModal
        isOpen={lintingModal.isOpen}
        file={lintingModal.file}
        onClose={() => setLintingModal({ isOpen: false, file: null })}
        onFileUpdate={handleFileUpdate}
      />

      {/* HTML Export Modal */}
      {htmlExportModal.file && (
        <HtmlExportModal
          isOpen={htmlExportModal.isOpen}
          onClose={() => setHtmlExportModal({ isOpen: false, file: null })}
          fileName={htmlExportModal.file.name}
          content={fileContent}
          diagrams={mermaidDiagrams}
        />
      )}
    </div>
  )
}

export default MermaidViewer