import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Eye, Maximize2, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import MermaidDiagram from './MermaidDiagram'
import { DiagramMetadata } from '../utils/mermaid'
import { useToast } from './NotificationSystem'

interface MultiDiagramViewerProps {
  diagrams: DiagramMetadata[]
  fileId: string
  fileName: string
  onOpenFullScreen?: (fileId: string, diagramIndex: number) => void
}

interface DiagramItemProps {
  diagram: DiagramMetadata
  fileId: string
  isVisible: boolean
  onOpenFullScreen?: (fileId: string, diagramIndex: number) => void
}

const DiagramItem = memo<DiagramItemProps>(({ diagram, fileId, isVisible, onOpenFullScreen }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id={`diagram-${diagram.index}`}
      className="mb-8 scroll-mt-20"
    >
      {/* Diagram Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {diagram.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diagram {diagram.index + 1}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenFullScreen?.(fileId, diagram.index)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const newTab = window.open(`/diagram/${fileId}/${diagram.index}`, '_blank')
              newTab?.focus()
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in New Tab"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diagram Content */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 overflow-hidden">
        {isInView || isVisible ? (
          <div className="h-[500px]">
            <MermaidDiagram
              definition={diagram.content}
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <Grid className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Scroll to load diagram
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

const MultiDiagramViewer: React.FC<MultiDiagramViewerProps> = ({
  diagrams,
  fileId,
  fileName,
  onOpenFullScreen
}) => {
  const [currentDiagram, setCurrentDiagram] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [visibleDiagrams, setVisibleDiagrams] = useState<Set<number>>(new Set([0]))
  const toast = useToast()

  const scrollToDiagram = useCallback((index: number) => {
    const element = document.getElementById(`diagram-${index}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentDiagram(index)
      setVisibleDiagrams(prev => new Set([...prev, index]))
    }
  }, [])

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        if (currentDiagram > 0) {
          scrollToDiagram(currentDiagram - 1)
        }
        break
      case 'ArrowRight':
        if (currentDiagram < diagrams.length - 1) {
          scrollToDiagram(currentDiagram + 1)
        }
        break
      case 'f':
      case 'F':
        if (!event.ctrlKey && !event.metaKey && onOpenFullScreen) {
          onOpenFullScreen(fileId, currentDiagram)
        }
        break
    }
  }, [currentDiagram, diagrams.length, scrollToDiagram, fileId, onOpenFullScreen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const handleCopyLink = useCallback((index: number) => {
    const url = `${window.location.origin}/diagram/${fileId}/${index}`
    navigator.clipboard.writeText(url)
    toast.success('Link Copied', 'Diagram link copied to clipboard')
  }, [fileId, toast])

  if (diagrams.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Grid className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Diagrams Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This file doesn't contain any Mermaid diagrams
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Diagram Navigator Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Diagram Navigator
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="p-2">
          {diagrams.map((diagram, index) => (
            <button
              key={index}
              onClick={() => scrollToDiagram(index)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                currentDiagram === index
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {diagram.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Diagram {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileName}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentDiagram + 1} / {diagrams.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToDiagram(Math.max(0, currentDiagram - 1))}
                disabled={currentDiagram === 0}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Diagram (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToDiagram(Math.min(diagrams.length - 1, currentDiagram + 1))}
                disabled={currentDiagram === diagrams.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Diagram (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="ml-4 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagram Content */}
        <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {diagrams.map((diagram, index) => (
            <DiagramItem
              key={index}
              diagram={diagram}
              fileId={fileId}
              isVisible={visibleDiagrams.has(index)}
              onOpenFullScreen={onOpenFullScreen}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MultiDiagramViewer