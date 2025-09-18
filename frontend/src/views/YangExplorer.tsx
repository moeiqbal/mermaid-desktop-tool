import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import {
  Upload,
  Search,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Download,
  FolderTree,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import YangTreeNode, { type YangNode } from '../components/YangTreeNode'
import YangPropertiesPanel from '../components/YangPropertiesPanel'

interface YangFile {
  id: string
  name: string
  path: string
  size: number
  modified: string
  type: 'yang'
  extension: string
}

interface YangParseResult {
  valid: boolean
  tree: Record<string, YangNode>
  modules: YangNode[]
  errors: Array<{
    line: number
    message: string
    severity: string
  }>
  metadata: {
    filename: string
    imports: string[]
    includes: string[]
    revisions: string[]
    namespace?: string
    prefix?: string
  }
  parser?: string
}

const YangExplorer: React.FC = () => {
  const [files, setFiles] = useState<YangFile[]>([])
  const [selectedFile, setSelectedFile] = useState<YangFile | null>(null)
  const [parseResult, setParseResult] = useState<YangParseResult | null>(null)
  const [selectedNode, setSelectedNode] = useState<YangNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [treeSearchQuery, setTreeSearchQuery] = useState('')
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)

  // Load YANG files on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/files')
      const yangFiles = response.data.filter((file: YangFile) => file.type === 'yang')
      setFiles(yangFiles)
    } catch (err) {
      setError('Failed to load YANG files')
      console.error('Error loading files:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
      setError(null)
    } catch (err) {
      setError('Failed to upload YANG files')
      console.error('Upload error:', err)
    } finally {
      setUploadProgress(false)
    }
  }, [loadFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.yang', '.yin']
    },
    multiple: true
  })

  const handleFileSelect = async (file: YangFile) => {
    setSelectedFile(file)
    setSelectedNode(null)
    setError(null)
    setIsLoading(true)

    try {
      // Get file content first
      const contentResponse = await axios.get(`/api/files/${file.id}/content`)
      const content = contentResponse.data.content

      // Parse YANG content
      const parseResponse = await axios.post('/api/yang/parse', {
        content,
        filename: file.name
      })

      setParseResult(parseResponse.data)

      if (!parseResponse.data.valid && parseResponse.data.errors.length > 0) {
        setError(`Parse errors found: ${parseResponse.data.errors[0].message}`)
      }
    } catch (err) {
      setError('Failed to parse YANG file')
      console.error('Error parsing YANG file:', err)
      setParseResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (file: YangFile, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/files/${file.id}`)
      setFiles(prev => prev.filter(f => f.id !== file.id))
      if (selectedFile?.id === file.id) {
        setSelectedFile(null)
        setParseResult(null)
        setSelectedNode(null)
      }
    } catch (err) {
      setError('Failed to delete file')
      console.error('Error deleting file:', err)
    }
  }

  const handleExportJSON = () => {
    if (!parseResult) return

    const dataStr = JSON.stringify(parseResult, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `${selectedFile?.name || 'yang-model'}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleExportTree = () => {
    if (!parseResult) return

    const treeStr = JSON.stringify(parseResult.tree, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(treeStr)

    const exportFileDefaultName = `${selectedFile?.name || 'yang-tree'}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* YANG Files Panel */}
      <div className="w-80 panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            YANG Models
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
                  Drop YANG files here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .yang, .yin files
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
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery ? 'No files match your search' : 'No YANG files uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer group transition-colors ${
                    selectedFile?.id === file.id
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex-shrink-0 mr-3">
                    <FileCode className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • YANG
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFile(file, e)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="flex-1 flex">
        {/* Tree Visualization */}
        <div className={`flex flex-col bg-gray-50 dark:bg-gray-950 transition-all duration-300 ${
          showPropertiesPanel ? 'flex-1' : 'w-full'
        }`}>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'YANG Model Viewer'}
              </h3>
              <div className="flex items-center space-x-2">
                {parseResult && (
                  <>
                    <button
                      onClick={handleExportJSON}
                      className="btn-secondary flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </button>
                    <button
                      onClick={handleExportTree}
                      className="btn-secondary flex items-center"
                    >
                      <FolderTree className="w-4 h-4 mr-2" />
                      Export Tree
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={showPropertiesPanel ? 'Hide Properties Panel' : 'Show Properties Panel'}
                >
                  {showPropertiesPanel ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {parseResult && (
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${parseResult.valid ? 'bg-green-500' : 'bg-red-500'}`} />
                    {parseResult.valid ? 'Valid' : 'Invalid'}
                  </span>
                  <span>Modules: {parseResult.modules.length}</span>
                  {parseResult.errors.length > 0 && (
                    <span>Errors: {parseResult.errors.length}</span>
                  )}
                  {parseResult.parser && (
                    <span>Parser: {parseResult.parser}</span>
                  )}
                </div>

                {/* Tree Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in tree..."
                    value={treeSearchQuery}
                    onChange={(e) => setTreeSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent w-48"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedFile && parseResult ? (
              parseResult.modules.length > 0 ? (
                <div className="yang-tree">
                  {parseResult.modules.map((module, index) => (
                    <YangTreeNode
                      key={`${module.name}-${index}`}
                      node={module}
                      level={0}
                      onSelect={setSelectedNode}
                      selectedNode={selectedNode}
                      searchQuery={treeSearchQuery}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Parse Error
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Unable to parse the YANG file. Check the syntax and try again.
                  </p>
                  {parseResult.errors.length > 0 && (
                    <div className="mt-4 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Errors:</h4>
                      <ul className="space-y-1">
                        {parseResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300">
                            Line {error.line}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 mx-auto flex items-center justify-center">
                    <FolderTree className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedFile ? 'Loading YANG model...' : 'Select a YANG file to explore'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedFile
                      ? 'Parsing and building tree visualization'
                      : 'Upload and select YANG files to visualize their structure'
                    }
                  </p>
                  {isLoading && (
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mt-4 text-gray-400" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {showPropertiesPanel && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <YangPropertiesPanel
              selectedNode={selectedNode}
              className="h-full overflow-y-auto"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default YangExplorer