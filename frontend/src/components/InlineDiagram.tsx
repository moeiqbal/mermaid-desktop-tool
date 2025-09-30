import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Download, Maximize2, ExternalLink, Move, RotateCcw } from 'lucide-react'
import { renderMermaidDiagram, setMermaidThemeByName } from '../utils/mermaid'
import { DocumentDiagram } from '../utils/documentParser'
import { getTheme } from '../themes/mermaidThemes'

interface InlineDiagramProps {
  diagram: DocumentDiagram
  onOpenInMermaidViewer?: (diagramId: string) => void
  onOpenFullscreen?: (diagramId: string) => void
  mermaidTheme?: string // Mermaid theme name from mermaidThemes.ts
}

const InlineDiagram: React.FC<InlineDiagramProps> = ({
  diagram,
  onOpenInMermaidViewer,
  onOpenFullscreen,
  mermaidTheme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  const renderDiagram = useCallback(async () => {
    if (!diagram.content.trim()) {
      setError('Empty diagram content')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Apply theme before rendering
      const theme = getTheme(mermaidTheme)
      setMermaidThemeByName(theme.mermaidTheme)

      const result = await renderMermaidDiagram(diagram.content, diagram.id)
      setSvgContent(result.svg)
    } catch (err) {
      console.error('Error rendering diagram:', err)
      setError(err instanceof Error ? err.message : 'Failed to render diagram')
    } finally {
      setIsLoading(false)
    }
  }, [diagram.content, diagram.id, mermaidTheme])

  useEffect(() => {
    renderDiagram()
  }, [renderDiagram])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleDownloadSVG = async () => {
    if (!svgContent) return

    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${diagram.title.replace(/[^a-zA-Z0-9]/g, '_')}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading SVG:', error)
    }
  }

  const handleDownloadPNG = async () => {
    if (!svgContent || !containerRef.current) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        canvas.width = img.width * 2 // Higher resolution
        canvas.height = img.height * 2
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `${diagram.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(downloadUrl)
          }
        }, 'image/png')

        URL.revokeObjectURL(url)
      }

      img.src = url
    } catch (error) {
      console.error('Error downloading PNG:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="diagram-container my-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="diagram-title text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {diagram.title}
        </h3>
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-400">Rendering diagram...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="diagram-container my-6 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
        <h3 className="diagram-title text-xl font-semibold mb-4 text-red-900 dark:text-red-100">
          {diagram.title}
        </h3>
        <div className="text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">Error rendering diagram:</p>
          <code className="block bg-red-100 dark:bg-red-900/30 p-3 rounded text-sm text-red-800 dark:text-red-200">
            {error}
          </code>
        </div>
      </div>
    )
  }

  return (
    <div
      className="diagram-container my-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="diagram-title text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {diagram.title}
      </h3>

      {/* Control overlay */}
      {isHovered && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>

            <button
              onClick={handleDownloadSVG}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Download SVG"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {onOpenFullscreen && (
              <button
                onClick={() => onOpenFullscreen(diagram.id)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Open Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {onOpenInMermaidViewer && (
              <button
                onClick={() => onOpenInMermaidViewer(diagram.id)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Open in Mermaid Viewer"
              >
                <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Pan indicator */}
      {isPanning && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center">
          <Move className="w-3 h-3 mr-1" />
          Pan mode
        </div>
      )}

      {/* Diagram content */}
      <div
        ref={containerRef}
        className="mermaid-diagram bg-white dark:bg-gray-950 rounded-lg p-4 overflow-auto border border-gray-200 dark:border-gray-700 cursor-move"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {svgContent && (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="mermaid-svg-container"
          />
        )}
      </div>
    </div>
  )
}

export default InlineDiagram