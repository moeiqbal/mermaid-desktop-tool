import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Hash, BookOpen, BarChart3 } from 'lucide-react'
import { TOCItem } from '../utils/documentParser'

interface DocumentViewSidebarProps {
  tableOfContents: TOCItem[]
  onNavigate: (item: TOCItem) => void
  currentSection?: string
}

const DocumentViewSidebar: React.FC<DocumentViewSidebarProps> = ({
  tableOfContents,
  onNavigate,
  currentSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Group TOC items by level for better organization (currently unused but may be useful for future features)
  // const groupedTOC = tableOfContents.reduce((acc, item) => {
  //   if (!acc[item.level]) {
  //     acc[item.level] = []
  //   }
  //   acc[item.level].push(item)
  //   return acc
  // }, {} as Record<number, TOCItem[]>)

  const getItemIcon = (item: TOCItem) => {
    if (item.type === 'diagram') {
      return <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
    }

    switch (item.level) {
      case 1:
        return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 2:
        return <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      default:
        return <Hash className="w-3 h-3 text-gray-500 dark:text-gray-400" />
    }
  }

  const getItemStyle = (item: TOCItem) => {
    const isActive = currentSection === item.id
    const baseClasses = "flex items-center p-2 rounded-lg cursor-pointer transition-colors group"

    if (isActive) {
      return `${baseClasses} bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300`
    }

    return `${baseClasses} hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400`
  }

  const renderTOCItem = (item: TOCItem) => {
    const paddingLeft = Math.max(0, (item.level - 1)) * 12

    return (
      <div
        key={item.id}
        className={getItemStyle(item)}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        onClick={() => onNavigate(item)}
      >
        <div className="flex-shrink-0 mr-2">
          {getItemIcon(item)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {item.title}
          </p>
          <p className="text-xs opacity-60">
            {item.type === 'diagram' ? 'Diagram' : `H${item.level}`} • Line {item.line + 1}
          </p>
        </div>
      </div>
    )
  }

  if (tableOfContents.length === 0) {
    return (
      <div className="w-80 panel flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Table of Contents
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No headings or diagrams found
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-80'} panel flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Table of Contents
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {tableOfContents.map(renderTOCItem)}
          </div>

          {/* Summary stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Headings</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tableOfContents.filter(item => item.type === 'heading').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Diagrams</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tableOfContents.filter(item => item.type === 'diagram').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewSidebar