import React, { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';

interface MermaidEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * MermaidEditor Component
 * A code editor with syntax highlighting for Mermaid diagrams
 * Features:
 * - Line numbers
 * - Syntax highlighting
 * - Real-time editing
 * - Configurable theme
 */
const MermaidEditor: React.FC<MermaidEditorProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Enter Mermaid diagram code...',
  readOnly = false
}) => {
  // Handle editor changes
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  // Editor extensions
  const extensions = useMemo(() => [
    javascript(),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        fontSize: '14px',
        height: '100%'
      },
      '.cm-scroller': {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineHeight: '1.6'
      },
      '.cm-gutters': {
        backgroundColor: '#f8f9fa',
        color: '#6c757d',
        border: 'none'
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#e9ecef'
      },
      '.cm-activeLine': {
        backgroundColor: '#f8f9fa'
      },
      '.cm-content': {
        caretColor: '#0d6efd',
        padding: '8px 0'
      },
      '.cm-cursor': {
        borderLeftColor: '#0d6efd',
        borderLeftWidth: '2px'
      },
      '.cm-selectionBackground': {
        backgroundColor: '#b3d7ff !important'
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: '#b3d7ff !important'
      }
    })
  ], []);

  return (
    <div className={`mermaid-editor ${className}`} data-testid="mermaid-editor">
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={extensions}
        placeholder={placeholder}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true
        }}
        style={{
          height: '100%',
          width: '100%',
          fontSize: '14px'
        }}
      />
    </div>
  );
};

export default MermaidEditor;