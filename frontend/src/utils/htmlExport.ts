import { DiagramMetadata } from './mermaid'

export type CSSStyleOption = 'tailwind' | 'github' | 'custom'

interface ExportOptions {
  fileName: string
  content: string
  diagrams: DiagramMetadata[]
  styleOption: CSSStyleOption
  darkMode?: boolean
}

// CSS styles for different options
const CSS_STYLES = {
  tailwind: `
    /* Tailwind CSS CDN - Production */
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css');

    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
      background: #ffffff;
      color: #1f2937;
    }

    .dark body {
      background: #0f172a;
      color: #f1f5f9;
    }

    .markdown-content {
      max-width: 4xl;
      margin: 0 auto;
    }

    .diagram-container {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .dark .diagram-container {
      background: #1e293b;
      border-color: #334155;
    }

    .diagram-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }

    .dark .diagram-title {
      color: #e5e7eb;
    }

    .mermaid-diagram {
      background: white;
      border-radius: 0.25rem;
      padding: 1rem;
      overflow-x: auto;
    }

    .dark .mermaid-diagram {
      background: #0f172a;
    }
  `,

  github: `
    /* GitHub-like Markdown Styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292f;
      background-color: #ffffff;
      margin: 0;
      padding: 2rem;
    }

    .markdown-content {
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      border: 1px solid #d1d9e0;
      border-radius: 6px;
      background: #ffffff;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      border-bottom: 1px solid #d1d9e0;
      padding-bottom: 0.3em;
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .diagram-container {
      margin: 16px 0;
      padding: 16px;
      background-color: #f6f8fa;
      border: 1px solid #d1d9e0;
      border-radius: 6px;
    }

    .diagram-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #24292f;
    }

    .mermaid-diagram {
      background: white;
      border-radius: 3px;
      padding: 16px;
      overflow-x: auto;
      border: 1px solid #d1d9e0;
    }

    pre, code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 12px;
    }

    blockquote {
      margin: 0;
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d1d9e0;
    }
  `,

  custom: (darkMode: boolean = false) => `
    /* Custom Theme */
    :root {
      --bg-primary: ${darkMode ? '#0f172a' : '#ffffff'};
      --bg-secondary: ${darkMode ? '#1e293b' : '#f8fafc'};
      --text-primary: ${darkMode ? '#f1f5f9' : '#1f2937'};
      --text-secondary: ${darkMode ? '#94a3b8' : '#6b7280'};
      --border-color: ${darkMode ? '#334155' : '#e5e7eb'};
      --accent-color: ${darkMode ? '#3b82f6' : '#2563eb'};
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: var(--text-primary);
      background: var(--bg-primary);
      margin: 0;
      padding: 2rem;
      font-size: 16px;
    }

    .markdown-content {
      max-width: 900px;
      margin: 0 auto;
      background: var(--bg-primary);
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary);
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    h1 { font-size: 2.5rem; border-bottom: 3px solid var(--accent-color); padding-bottom: 0.5rem; }
    h2 { font-size: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.25rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }

    p {
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .diagram-container {
      margin: 2.5rem 0;
      padding: 2rem;
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .diagram-title {
      font-size: 1.375rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
      color: var(--accent-color);
      display: flex;
      align-items: center;
    }

    .diagram-title::before {
      content: "📊";
      margin-right: 0.5rem;
    }

    .mermaid-diagram {
      background: var(--bg-primary);
      border-radius: 8px;
      padding: 1.5rem;
      overflow-x: auto;
      border: 1px solid var(--border-color);
    }

    blockquote {
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      background: var(--bg-secondary);
      border-left: 4px solid var(--accent-color);
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
    }

    code {
      background: var(--bg-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
    }

    pre {
      background: var(--bg-secondary);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
    }

    /* Print styles */
    @media print {
      body { padding: 1rem; }
      .diagram-container { break-inside: avoid; }
      .mermaid-diagram { max-width: 100%; }
    }
  `
}

// Convert markdown to HTML (basic implementation)
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Code blocks (remove mermaid blocks as they'll be handled separately)
    .replace(/```[\s\S]*?```/gim, '')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

  // Wrap in paragraphs
  html = '<p>' + html + '</p>'

  // Clean up multiple paragraph tags
  html = html.replace(/<\/p><p><\/p><p>/gim, '</p><p>')
  html = html.replace(/<p><\/p>/gim, '')

  return html
}

// Generate HTML template
function generateHtmlTemplate(options: ExportOptions): string {
  const { fileName, content, diagrams, styleOption, darkMode = false } = options

  // Get CSS based on style option
  let cssContent = ''
  if (styleOption === 'custom') {
    cssContent = CSS_STYLES.custom(darkMode)
  } else {
    cssContent = CSS_STYLES[styleOption]
  }

  // Convert markdown content to HTML (excluding mermaid blocks)
  const htmlContent = markdownToHtml(content)

  // Generate script for Mermaid initialization
  const mermaidScript = `
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs';

      mermaid.initialize({
        startOnLoad: true,
        theme: '${darkMode ? 'dark' : 'default'}',
        themeVariables: {
          darkMode: ${darkMode},
          primaryColor: '${darkMode ? '#3b82f6' : '#2563eb'}',
          primaryTextColor: '${darkMode ? '#ffffff' : '#1f2937'}',
          primaryBorderColor: '${darkMode ? '#1e40af' : '#3b82f6'}',
          lineColor: '${darkMode ? '#6b7280' : '#374151'}',
          fontSize: '16px',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        },
        sequence: {
          useMaxWidth: true,
          wrap: true
        },
        gantt: {
          useMaxWidth: true
        },
        er: {
          useMaxWidth: true
        }
      });

      // Re-render diagrams after page load
      document.addEventListener('DOMContentLoaded', function() {
        mermaid.run();
      });
    </script>
  `

  // Generate diagram HTML
  const diagramsHtml = diagrams.map((diagram, index) => `
    <div class="diagram-container">
      <h3 class="diagram-title">${diagram.title}</h3>
      <div class="mermaid-diagram">
        <div class="mermaid" id="diagram-${index}">
${diagram.content}
        </div>
      </div>
    </div>
  `).join('\n')

  const darkModeClass = darkMode && styleOption === 'tailwind' ? ' dark' : ''

  return `<!DOCTYPE html>
<html lang="en"${darkModeClass}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Mermaid Desktop Tool">
  <title>${fileName} - Mermaid Diagrams</title>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <div class="markdown-content">
    <header>
      <h1>${fileName}</h1>
      <p><small>Generated on ${new Date().toLocaleDateString()} with <a href="#" target="_blank">Mermaid Desktop Tool</a></small></p>
    </header>

    <main>
      ${htmlContent}
      ${diagramsHtml}
    </main>

    <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color, #e5e7eb); text-align: center; color: var(--text-secondary, #6b7280); font-size: 0.875rem;">
      <p>This document was generated from Markdown with embedded Mermaid diagrams.</p>
      <p>🎨 Style: ${styleOption.charAt(0).toUpperCase() + styleOption.slice(1)} ${darkMode ? '(Dark Mode)' : '(Light Mode)'}</p>
    </footer>
  </div>

  ${mermaidScript}
</body>
</html>`
}

// Main export function
export async function exportToHtml(options: ExportOptions): Promise<void> {
  try {
    const html = generateHtmlTemplate(options)

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${options.fileName.replace(/\.[^/.]+$/, '')}-export.html`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to HTML:', error)
    throw new Error('Failed to export HTML file')
  }
}

// Get available style options
export function getStyleOptions() {
  return [
    {
      id: 'tailwind' as CSSStyleOption,
      name: 'Tailwind CSS',
      description: 'Modern utility-first CSS framework styling'
    },
    {
      id: 'github' as CSSStyleOption,
      name: 'GitHub Style',
      description: 'GitHub-like Markdown rendering'
    },
    {
      id: 'custom' as CSSStyleOption,
      name: 'Custom Theme',
      description: 'Custom designed theme with enhanced typography'
    }
  ]
}