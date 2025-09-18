import React from 'react'

interface LoadingSkeletonProps {
  type?: 'text' | 'card' | 'list' | 'tree' | 'custom'
  lines?: number
  height?: string
  width?: string
  className?: string
  animate?: boolean
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'text',
  lines = 3,
  height = '4',
  width = 'full',
  className = '',
  animate = true
}) => {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 rounded ${animate ? 'skeleton' : ''}`
  const heightClass = `h-${height}`
  const widthClass = `w-${width}`

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${heightClass} ${
              index === lines - 1 ? 'w-3/4' : widthClass
            }`}
          />
        ))}
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`${className} p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3`}>
        <div className={`${baseClasses} h-6 w-3/4`} />
        <div className={`${baseClasses} h-4 w-full`} />
        <div className={`${baseClasses} h-4 w-2/3`} />
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-2">
            <div className={`${baseClasses} h-8 w-8 rounded-full flex-shrink-0`} />
            <div className="flex-1 space-y-1">
              <div className={`${baseClasses} h-4 w-3/4`} />
              <div className={`${baseClasses} h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'tree') {
    return (
      <div className={`space-y-1 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => {
          const indent = Math.floor(Math.random() * 3) * 16
          return (
            <div key={index} className="flex items-center space-x-2 p-1" style={{ paddingLeft: `${indent}px` }}>
              <div className={`${baseClasses} h-4 w-4 rounded flex-shrink-0`} />
              <div className={`${baseClasses} h-4 w-32`} />
            </div>
          )
        })}
      </div>
    )
  }

  // Custom skeleton
  return (
    <div className={`${baseClasses} ${heightClass} ${widthClass} ${className}`} />
  )
}

// Specialized skeleton components
export const FileListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="p-2 space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center p-3 space-x-3">
        <div className="skeleton h-4 w-4 rounded flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

export const PropertiesPanelSkeleton: React.FC = () => (
  <div className="p-4 space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
    </div>

    {/* Properties sections */}
    {Array.from({ length: 3 }).map((_, sectionIndex) => (
      <div key={sectionIndex} className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="skeleton h-4 w-4" />
          <div className="skeleton h-5 w-24" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-between py-2">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

export const DiagramSkeleton: React.FC = () => (
  <div className="h-full flex items-center justify-center p-8">
    <div className="w-full max-w-2xl space-y-4">
      <div className="skeleton h-8 w-3/4 mx-auto" />
      <div className="skeleton h-64 w-full rounded-lg" />
      <div className="flex justify-center space-x-4">
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-20" />
      </div>
    </div>
  </div>
)

export const YangTreeSkeleton: React.FC<{ depth?: number }> = ({ depth = 3 }) => (
  <div className="space-y-1">
    {Array.from({ length: 8 }).map((_, index) => {
      const level = Math.floor(Math.random() * depth)
      const indent = level * 16
      return (
        <div key={index} className="flex items-center space-x-2 p-1" style={{ paddingLeft: `${indent + 8}px` }}>
          <div className="skeleton h-3 w-3 rounded flex-shrink-0" />
          <div className="skeleton h-4 w-4 rounded flex-shrink-0" />
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-3 w-12" />
        </div>
      )
    })}
  </div>
)

export default LoadingSkeleton