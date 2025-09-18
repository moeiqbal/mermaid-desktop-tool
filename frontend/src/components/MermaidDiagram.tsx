import React, { useEffect, useRef, useState, useCallback } from 'react'
import { renderMermaidDiagram, validateMermaidSyntax } from '../utils/mermaid'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download, AlertCircle } from 'lucide-react'

interface MermaidDiagramProps {
  definition: string
  className?: string
  onError?: (error: string) => void
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  definition,
  className = '',
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const renderDiagram = useCallback(async () => {
    if (!definition.trim()) {
      setError('No diagram definition provided')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Validate syntax first
      const validation = await validateMermaidSyntax(definition)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid Mermaid syntax')
      }

      // Render diagram
      const elementId = Math.random().toString(36).substr(2, 9)
      const { svg } = await renderMermaidDiagram(definition, elementId)

      if (containerRef.current) {
        containerRef.current.innerHTML = svg
        svgRef.current = containerRef.current.querySelector('svg')

        if (svgRef.current) {
          // Reset transform
          setScale(1)
          setPosition({ x: 0, y: 0 })

          // Apply responsive sizing
          svgRef.current.style.width = '100%'
          svgRef.current.style.height = '100%'
          svgRef.current.style.maxWidth = 'none'
          svgRef.current.style.maxHeight = 'none'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [definition, onError])

  useEffect(() => {
    renderDiagram()
  }, [renderDiagram])

  // Handle click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }, [])

  const handleResetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'pdf') => {
    if (!svgRef.current) return

    try {
      const svgElement = svgRef.current
      const svgData = new XMLSerializer().serializeToString(svgElement)

      if (format === 'svg') {
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mermaid-diagram.${format}`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'png') {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          canvas.width = img.width * 2 // 2x for better quality
          canvas.height = img.height * 2
          ctx.scale(2, 2)
          ctx.drawImage(img, 0, 0)

          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = downloadUrl
              a.download = `mermaid-diagram.${format}`
              a.click()
              URL.revokeObjectURL(downloadUrl)
            }
          }, 'image/png')
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Diagram Error
        </h3>
        <p className="text-red-600 dark:text-red-400 text-sm max-w-md">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className={`relative h-full ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" ref={exportMenuRef}>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center"
              title="Export diagram"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[100px]">
                <button
                  onClick={() => {
                    handleExport('png')
                    setShowExportMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  PNG
                </button>
                <button
                  onClick={() => {
                    handleExport('svg')
                    setShowExportMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  SVG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Rendering diagram...</p>
          </div>
        </div>
      )}

      {/* Diagram Container */}
      <div
        className="h-full overflow-hidden cursor-move select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={containerRef}
          className="h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}

export default MermaidDiagram