import React, { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FileText,
  List,
  Settings,
  Zap,
  Bell,
  Database,
  Hash
} from 'lucide-react'

interface YangNode {
  type: string
  name: string
  line?: number
  description?: string
  mandatory?: boolean
  config?: boolean
  properties?: Record<string, any>
  children?: YangNode[]
}

interface YangTreeNodeProps {
  node: YangNode
  level: number
  isExpanded: boolean
  onToggle: () => void
  onSelect: (node: YangNode) => void
  selectedNode?: YangNode | null
  searchQuery?: string
}

const YangTreeNode: React.FC<YangTreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onSelect,
  selectedNode,
  searchQuery = ''
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNode === node

  const getNodeIcon = (nodeType: string, hasChildren: boolean, isExpanded: boolean) => {
    const iconClass = "w-4 h-4 mr-2 flex-shrink-0"

    switch (nodeType) {
      case 'module':
      case 'submodule':
        return hasChildren && isExpanded
          ? <FolderOpen className={`${iconClass} text-blue-600 dark:text-blue-400`} />
          : <Folder className={`${iconClass} text-blue-600 dark:text-blue-400`} />
      case 'container':
        return hasChildren && isExpanded
          ? <FolderOpen className={`${iconClass} text-green-600 dark:text-green-400`} />
          : <Folder className={`${iconClass} text-green-600 dark:text-green-400`} />
      case 'list':
        return <List className={`${iconClass} text-orange-600 dark:text-orange-400`} />
      case 'leaf':
        return <FileText className={`${iconClass} text-gray-600 dark:text-gray-400`} />
      case 'leaf-list':
        return <Hash className={`${iconClass} text-gray-600 dark:text-gray-400`} />
      case 'rpc':
        return <Zap className={`${iconClass} text-purple-600 dark:text-purple-400`} />
      case 'notification':
        return <Bell className={`${iconClass} text-red-600 dark:text-red-400`} />
      case 'choice':
        return <Settings className={`${iconClass} text-indigo-600 dark:text-indigo-400`} />
      case 'grouping':
        return <Database className={`${iconClass} text-teal-600 dark:text-teal-400`} />
      default:
        return <FileText className={`${iconClass} text-gray-500 dark:text-gray-400`} />
    }
  }

  const getStatusBadge = (node: YangNode) => {
    const badges = []

    if (node.mandatory) {
      badges.push(
        <span key="mandatory" className="inline-block px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          M
        </span>
      )
    }

    if (node.config === false) {
      badges.push(
        <span key="config" className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          RO
        </span>
      )
    }

    if (node.properties?.status && node.properties.status !== 'current') {
      badges.push(
        <span key="status" className="inline-block px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
          {node.properties.status.toUpperCase()}
        </span>
      )
    }

    return badges.length > 0 ? <div className="flex gap-1 ml-2">{badges}</div> : null
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const shouldShow = () => {
    if (!searchQuery.trim()) return true
    return node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (node.description && node.description.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  if (!shouldShow()) return null

  return (
    <div className="yang-tree-node">
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="mr-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-4 mr-1"></div>
        )}

        {getNodeIcon(node.type, hasChildren, isExpanded)}

        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {highlightText(node.name, searchQuery)}
        </span>

        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
          {node.type}
        </span>

        {getStatusBadge(node)}

        {node.line && (
          <span className="text-xs text-gray-400 ml-auto">
            :{node.line}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="yang-tree-children">
          {node.children!.map((child, index) => (
            <YangTreeNodeContainer
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedNode={selectedNode}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Container component to manage expansion state
interface YangTreeNodeContainerProps {
  node: YangNode
  level: number
  onSelect: (node: YangNode) => void
  selectedNode?: YangNode | null
  searchQuery?: string
}

const YangTreeNodeContainer: React.FC<YangTreeNodeContainerProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand if search query matches any descendant
  React.useEffect(() => {
    if (props.searchQuery && props.searchQuery.trim()) {
      const hasMatchingDescendant = (node: YangNode, query: string): boolean => {
        const lowerQuery = query.toLowerCase()

        if (node.name.toLowerCase().includes(lowerQuery) ||
            node.type.toLowerCase().includes(lowerQuery) ||
            (node.description && node.description.toLowerCase().includes(lowerQuery))) {
          return true
        }

        if (node.children) {
          return node.children.some(child => hasMatchingDescendant(child, query))
        }

        return false
      }

      if (hasMatchingDescendant(props.node, props.searchQuery)) {
        setIsExpanded(true)
      }
    }
  }, [props.searchQuery, props.node])

  return (
    <YangTreeNode
      {...props}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  )
}

export default YangTreeNodeContainer
export type { YangNode }