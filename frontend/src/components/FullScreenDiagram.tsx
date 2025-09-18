import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Share2, Download, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import axios from 'axios'
import MermaidDiagram from './MermaidDiagram'
import { DiagramMetadata, extractMermaidDiagramsWithMetadata } from '../utils/mermaid'
import { useToast } from './NotificationSystem'

const FullScreenDiagram: React.FC = () => {
  const { fileId, diagramIndex } = useParams<{ fileId: string; diagramIndex: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [diagrams, setDiagrams] = useState<DiagramMetadata[]>([])
  const [currentDiagram, setCurrentDiagram] = useState<DiagramMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  const index = parseInt(diagramIndex || '0', 10)

  // Load file content and extract diagrams
  useEffect(() => {
    const loadDiagrams = async () => {
      if (!fileId) {
        setError('No file ID provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await axios.get(`/api/files/${fileId}/content`)
        const content = response.data.content

        // Extract diagrams with metadata
        const extractedDiagrams = extractMermaidDiagramsWithMetadata(content)

        if (extractedDiagrams.length === 0) {
          setError('No diagrams found in this file')
        } else if (index >= extractedDiagrams.length) {
          setError(`Diagram ${index + 1} not found`)
        } else {
          setDiagrams(extractedDiagrams)
          setCurrentDiagram(extractedDiagrams[index])
        }
      } catch (err) {
        console.error('Error loading diagrams:', err)
        setError('Failed to load diagram')
      } finally {
        setIsLoading(false)
      }
    }

    loadDiagrams()
  }, [fileId, index])

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }

    setShowControls(true)

    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    setControlsTimeout(timeout)
  }, [controlsTimeout])

  useEffect(() => {
    resetControlsTimeout()

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [])

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          navigate(-1)
          break
        case 'ArrowLeft':
          if (index > 0) {
            navigate(`/diagram/${fileId}/${index - 1}`)
          }
          break
        case 'ArrowRight':
          if (index < diagrams.length - 1) {
            navigate(`/diagram/${fileId}/${index + 1}`)
          }
          break
        case 'f':
        case 'F':
          if (!event.ctrlKey && !event.metaKey) {
            // Toggle fullscreen API if available
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen()
            } else {
              document.exitFullscreen()
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [navigate, fileId, index, diagrams.length])

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link Copied', 'Diagram link copied to clipboard')
  }, [toast])

  const handleExport = useCallback((format: 'png' | 'svg') => {
    // This will be handled by the MermaidDiagram component's export functionality
    const exportButton = document.querySelector(`[data-export="${format}"]`) as HTMLElement
    if (exportButton) {
      exportButton.click()
    }
  }, [])

  const navigateToDiagram = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < diagrams.length) {
      navigate(`/diagram/${fileId}/${newIndex}`)
    }
  }, [fileId, diagrams.length, navigate])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p>Loading diagram...</p>
        </div>
      </div>
    )
  }

  if (error || !currentDiagram) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">{error || 'Diagram not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Top Controls Bar */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - Title and navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Exit Full Screen (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-white">
              <h2 className="text-lg font-semibold">{currentDiagram.title}</h2>
              <p className="text-sm opacity-75">
                Diagram {index + 1} of {diagrams.length}
              </p>
            </div>
          </div>

          {/* Center - Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToDiagram(index - 1)}
              disabled={index === 0}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Diagram (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-white px-3">
              {index + 1} / {diagrams.length}
            </span>

            <button
              onClick={() => navigateToDiagram(index + 1)}
              disabled={index === diagrams.length - 1}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Diagram (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Share Diagram"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen()
                } else {
                  document.exitFullscreen()
                }
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Toggle Browser Fullscreen (F)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="fixed inset-0 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-[90vw] max-h-[90vh]">
          <MermaidDiagram
            definition={currentDiagram.content}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Bottom Controls - Quick Navigation */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Diagram thumbnails */}
          <div className="flex gap-2 justify-center overflow-x-auto pb-2">
            {diagrams.map((diagram, idx) => (
              <button
                key={idx}
                onClick={() => navigateToDiagram(idx)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  idx === index
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={diagram.title}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div
        className={`absolute bottom-4 right-4 bg-black/60 rounded-lg p-3 text-white text-xs transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="space-y-1">
          <div>ESC - Exit</div>
          <div>← → - Navigate</div>
          <div>F - Fullscreen</div>
        </div>
      </div>
    </div>
  )
}

export default FullScreenDiagram