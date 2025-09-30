import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Upload,
  Search,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Download,
  Save,
  Edit3
} from 'lucide-react';
import MermaidEditor from '../components/MermaidEditor';
import MermaidDiagram from '../components/MermaidDiagram';
import SplitPane from '../components/SplitPane';
import { useToast } from '../components/NotificationSystem';

interface MermaidFile {
  id: string;
  name: string;
  path: string;
  size: number;
  modified: string;
  type: 'mermaid' | 'markdown';
  extension: string;
}

const MermaidEditorView: React.FC = () => {
  const [files, setFiles] = useState<MermaidFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MermaidFile | null>(null);
  const [mermaidCode, setMermaidCode] = useState('');
  const [debouncedCode, setDebouncedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toast = useToast();

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Debounce code updates (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(mermaidCode);
    }, 300);

    return () => clearTimeout(timer);
  }, [mermaidCode]);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/files');
      const mermaidFiles = response.data.filter(
        (file: MermaidFile) =>
          file.type === 'mermaid' ||
          file.type === 'markdown' ||
          file.extension === '.mmd' ||
          file.extension === '.mermaid' ||
          file.extension === '.md'
      );
      setFiles(mermaidFiles);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadProgress(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      loadFiles();
      toast.success('Upload Complete', 'Files uploaded successfully');
      setError(null);
    } catch (err) {
      setError('Failed to upload files');
      toast.error('Upload Failed', 'Failed to upload files');
      console.error('Upload error:', err);
    } finally {
      setUploadProgress(false);
    }
  }, [loadFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.mmd', '.mermaid'],
      'text/markdown': ['.md', '.markdown']
    },
    multiple: true
  });

  const handleFileSelect = async (file: MermaidFile) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to discard them and switch files?'
      );
      if (!confirmSwitch) return;
    }

    setSelectedFile(file);
    setError(null);
    setIsLoading(true);
    setHasUnsavedChanges(false);

    try {
      const response = await axios.get(`/api/files/${file.id}/content`);
      const content = response.data.content;

      // Extract mermaid code from markdown if needed
      if (file.type === 'markdown' || file.extension === '.md') {
        const mermaidBlocks = extractMermaidFromMarkdown(content);
        if (mermaidBlocks.length > 0) {
          setMermaidCode(mermaidBlocks[0]);
        } else {
          setMermaidCode(content);
          setError('No Mermaid code blocks found in markdown. Showing raw content.');
        }
      } else {
        setMermaidCode(content);
      }
    } catch (err) {
      setError('Failed to load file content');
      console.error('Error loading file:', err);
      setMermaidCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const extractMermaidFromMarkdown = (markdown: string): string[] => {
    const mermaidBlocks: string[] = [];
    const regex = /```mermaid\s*\n([\s\S]*?)\n```/g;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      mermaidBlocks.push(match[1].trim());
    }

    return mermaidBlocks;
  };

  const handleEditorChange = useCallback((value: string) => {
    setMermaidCode(value);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!selectedFile || !mermaidCode) {
      toast.error('Save Failed', 'No file selected or content is empty');
      return;
    }

    try {
      await axios.post('/api/yang/mermaid', {
        content: mermaidCode,
        filename: selectedFile.name
      });

      setHasUnsavedChanges(false);
      toast.success('Saved', 'File saved successfully');
    } catch (err) {
      console.error('Error saving file:', err);
      toast.error('Save Failed', 'Failed to save file');
    }
  };

  const handleDeleteFile = async (file: MermaidFile, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(`Are you sure you want to delete ${file.name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/files/${file.id}`);
      setFiles(prev => prev.filter(f => f.id !== file.id));

      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
        setMermaidCode('');
        setHasUnsavedChanges(false);
      }

      toast.success('Deleted', 'File deleted successfully');
    } catch (err) {
      setError('Failed to delete file');
      toast.error('Delete Failed', 'Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const handleExportSVG = () => {
    if (!debouncedCode) {
      toast.error('Export Failed', 'No diagram to export');
      return;
    }
    // The MermaidDiagram component has export functionality built-in
    toast.info('Export', 'Use the download button in the diagram preview');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Files Panel */}
      <div className="w-80 panel flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mermaid Files
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
                  Drop Mermaid or Markdown files here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .mmd, .mermaid, .md files
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
                {searchQuery ? 'No files match your search' : 'No Mermaid files uploaded yet'}
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
                    <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {file.extension}
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

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedFile ? selectedFile.name : 'Mermaid Editor'}
              {hasUnsavedChanges && (
                <span className="ml-2 text-sm text-orange-500">• Unsaved changes</span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {selectedFile && (
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center"
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-yellow-700 dark:text-yellow-400">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-yellow-400 hover:text-yellow-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {selectedFile ? (
            <SplitPane
              leftPane={
                <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Code Editor
                    </h4>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MermaidEditor
                      value={mermaidCode}
                      onChange={handleEditorChange}
                      placeholder="Enter your Mermaid diagram code here..."
                    />
                  </div>
                </div>
              }
              rightPane={
                <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Live Preview
                    </h4>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {debouncedCode ? (
                      <MermaidDiagram
                        definition={debouncedCode}
                        className="h-full"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center p-4">
                        <div className="text-center">
                          <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Start typing Mermaid code to see live preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }
              defaultSplit={50}
              minSize={300}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 mx-auto flex items-center justify-center">
                  <FileCode className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No File Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload and select a Mermaid or Markdown file to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MermaidEditorView;