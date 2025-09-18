import React from 'react'
import {
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Info,
  Code,
  Calendar,
  Tag,
  Type
} from 'lucide-react'
import type { YangNode } from './YangTreeNode'

interface YangPropertiesPanelProps {
  selectedNode: YangNode | null
  className?: string
}

const YangPropertiesPanel: React.FC<YangPropertiesPanelProps> = ({
  selectedNode,
  className = ''
}) => {
  if (!selectedNode) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 mx-auto flex items-center justify-center">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a YANG node
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Click on any node in the tree to view its properties and details
          </p>
        </div>
      </div>
    )
  }

  const renderPropertyRow = (label: string, value: any, icon?: React.ReactNode) => {
    if (value === undefined || value === null) return null

    return (
      <div className="flex items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center w-1/3 text-sm font-medium text-gray-600 dark:text-gray-300">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </div>
        <div className="flex-1 text-sm text-gray-900 dark:text-white">
          {typeof value === 'boolean' ? (
            <span className={`inline-flex items-center ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {value ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
              {value ? 'True' : 'False'}
            </span>
          ) : (
            <span className="break-words">{String(value)}</span>
          )}
        </div>
      </div>
    )
  }

  const getNodeTypeColor = (type: string) => {
    const colors = {
      'module': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'submodule': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'container': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'list': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'leaf': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'leaf-list': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'rpc': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'notification': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'choice': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'grouping': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedNode.name}
          </h3>
          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded ${getNodeTypeColor(selectedNode.type)}`}>
            {selectedNode.type}
          </span>
        </div>

        {selectedNode.description && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>
        )}
      </div>

      {/* Basic Properties */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Basic Properties
        </h4>
        <div className="space-y-1">
          {renderPropertyRow('Type', selectedNode.type, <Type className="w-4 h-4" />)}
          {renderPropertyRow('Line', selectedNode.line, <Hash className="w-4 h-4" />)}
          {renderPropertyRow('Mandatory', selectedNode.mandatory, selectedNode.mandatory ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />)}
          {renderPropertyRow('Config', selectedNode.config, selectedNode.config ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
          {selectedNode.children && renderPropertyRow('Children', selectedNode.children.length, <FileText className="w-4 h-4" />)}
        </div>
      </div>

      {/* Type Properties */}
      {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Type Properties
          </h4>
          <div className="space-y-1">
            {renderPropertyRow('Data Type', selectedNode.properties.type, <Type className="w-4 h-4" />)}
            {renderPropertyRow('Default', selectedNode.properties.default, <Tag className="w-4 h-4" />)}
            {renderPropertyRow('Units', selectedNode.properties.units, <Hash className="w-4 h-4" />)}
            {renderPropertyRow('Status', selectedNode.properties.status, <Info className="w-4 h-4" />)}
            {renderPropertyRow('Range', selectedNode.properties.range, <Hash className="w-4 h-4" />)}
            {renderPropertyRow('Length', selectedNode.properties.length, <Hash className="w-4 h-4" />)}
            {renderPropertyRow('Pattern', selectedNode.properties.pattern, <Code className="w-4 h-4" />)}
          </div>
        </div>
      )}

      {/* Constraints & Validation */}
      {(selectedNode.properties?.range || selectedNode.properties?.length || selectedNode.properties?.pattern) && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Constraints
          </h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg space-y-2">
            {selectedNode.properties?.range && (
              <div className="text-sm">
                <span className="font-medium text-yellow-900 dark:text-yellow-100">Range:</span>
                <code className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-xs">
                  {selectedNode.properties.range}
                </code>
              </div>
            )}
            {selectedNode.properties?.length && (
              <div className="text-sm">
                <span className="font-medium text-yellow-900 dark:text-yellow-100">Length:</span>
                <code className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-xs">
                  {selectedNode.properties.length}
                </code>
              </div>
            )}
            {selectedNode.properties?.pattern && (
              <div className="text-sm">
                <span className="font-medium text-yellow-900 dark:text-yellow-100">Pattern:</span>
                <code className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-xs font-mono">
                  {selectedNode.properties.pattern}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {selectedNode.children && selectedNode.children.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Children Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {(() => {
              const typeCounts = selectedNode.children!.reduce((acc, child) => {
                acc[child.type] = (acc[child.type] || 0) + 1
                return acc
              }, {} as Record<string, number>)

              return Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type}s</div>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Debug Information
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
            {JSON.stringify(selectedNode, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default YangPropertiesPanel