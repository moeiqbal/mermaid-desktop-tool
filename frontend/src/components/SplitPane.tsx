import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface SplitPaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  defaultSplit?: number; // Percentage for left pane (0-100)
  minSize?: number; // Minimum size in pixels
  className?: string;
  onSplitChange?: (split: number) => void;
}

/**
 * SplitPane Component
 * A resizable split pane component with draggable divider
 * Features:
 * - Horizontal split (left/right)
 * - Draggable divider
 * - Configurable minimum sizes
 * - Responsive to window resize
 */
const SplitPane: React.FC<SplitPaneProps> = ({
  leftPane,
  rightPane,
  defaultSplit = 50,
  minSize = 200,
  className = '',
  onSplitChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved split from localStorage
  useEffect(() => {
    try {
      const savedSplit = localStorage.getItem('mermaid-editor-split');
      if (savedSplit) {
        const parsedSplit = parseFloat(savedSplit);
        if (parsedSplit >= 10 && parsedSplit <= 90) {
          setSplit(parsedSplit);
        }
      }
    } catch (error) {
      console.warn('Failed to load split preference:', error);
    }
  }, []);

  // Save split to localStorage
  const saveSplit = useCallback((newSplit: number) => {
    try {
      localStorage.setItem('mermaid-editor-split', newSplit.toString());
      onSplitChange?.(newSplit);
    } catch (error) {
      console.warn('Failed to save split preference:', error);
    }
  }, [onSplitChange]);

  // Handle mouse down on divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;

      // Calculate new split percentage
      let newSplit = (offsetX / containerWidth) * 100;

      // Apply minimum size constraints
      const minSizePercent = (minSize / containerWidth) * 100;
      newSplit = Math.max(minSizePercent, Math.min(100 - minSizePercent, newSplit));

      setSplit(newSplit);
      saveSplit(newSplit);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize, saveSplit]);

  return (
    <div
      ref={containerRef}
      className={`split-pane ${className}`}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
      data-testid="split-pane"
    >
      {/* Left Pane */}
      <div
        className="split-pane-left"
        style={{
          width: `${split}%`,
          height: '100%',
          overflow: 'auto',
          minWidth: `${minSize}px`
        }}
        data-testid="split-pane-left"
      >
        {leftPane}
      </div>

      {/* Divider */}
      <div
        className="split-pane-divider"
        onMouseDown={handleMouseDown}
        style={{
          width: '6px',
          height: '100%',
          background: isDragging ? '#3b82f6' : '#e5e7eb',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: isDragging ? 'none' : 'background 0.2s',
          flexShrink: 0,
          position: 'relative'
        }}
        data-testid="split-pane-divider"
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: isDragging ? '#ffffff' : '#9ca3af',
            pointerEvents: 'none'
          }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Right Pane */}
      <div
        className="split-pane-right"
        style={{
          width: `${100 - split}%`,
          height: '100%',
          overflow: 'auto',
          minWidth: `${minSize}px`
        }}
        data-testid="split-pane-right"
      >
        {rightPane}
      </div>
    </div>
  );
};

export default SplitPane;