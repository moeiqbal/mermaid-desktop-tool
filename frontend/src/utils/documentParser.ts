// Document parsing utility for the Document View
export interface DocumentContent {
  rawContent: string
  sections: DocumentSection[]
  diagrams: DocumentDiagram[]
  tableOfContents: TOCItem[]
}

export interface DocumentSection {
  id: string
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'blockquote' | 'table'
  level?: number // For headings
  content: string
  rawContent: string
  startLine: number
  endLine: number
}

export interface DocumentDiagram {
  id: string
  title: string
  content: string
  index: number
  startLine: number
  endLine: number
  rawBlock: string
}

export interface TOCItem {
  id: string
  title: string
  level: number
  line: number
  type: 'heading' | 'diagram'
}

// Parse document content into structured format
export function parseDocumentContent(markdown: string): DocumentContent {
  const lines = markdown.split('\n')
  const sections: DocumentSection[] = []
  const diagrams: DocumentDiagram[] = []
  const tableOfContents: TOCItem[] = []

  let currentSection: string[] = []
  let currentSectionType: DocumentSection['type'] = 'paragraph'
  let sectionStartLine = 0
  let inCodeBlock = false
  let codeBlockType = ''
  let diagramIndex = 0

  const flushCurrentSection = (endLine: number) => {
    if (currentSection.length > 0) {
      const content = currentSection.join('\n').trim()
      if (content) {
        const sectionId = `section-${sections.length}`
        const section: DocumentSection = {
          id: sectionId,
          type: currentSectionType,
          content: renderSectionContent(content, currentSectionType),
          rawContent: content,
          startLine: sectionStartLine,
          endLine: endLine - 1
        }

        // Add level for headings
        if (currentSectionType === 'heading') {
          const headingMatch = content.match(/^(#+)\s+(.+)$/)
          if (headingMatch) {
            section.level = headingMatch[1].length
            const title = headingMatch[2]
            tableOfContents.push({
              id: sectionId,
              title,
              level: section.level,
              line: sectionStartLine,
              type: 'heading'
            })
          }
        }

        sections.push(section)
      }
      currentSection = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting code block
        flushCurrentSection(i)
        inCodeBlock = true
        const match = line.match(/```(\w+)?/)
        codeBlockType = match?.[1] || ''

        if (codeBlockType === 'mermaid' || codeBlockType === 'mmd') {
          // This is a mermaid diagram
          currentSection = []
          currentSectionType = 'code'
          sectionStartLine = i
        } else {
          // Regular code block
          currentSection = [line]
          currentSectionType = 'code'
          sectionStartLine = i
        }
      } else {
        // Ending code block
        if (codeBlockType === 'mermaid' || codeBlockType === 'mmd') {
          // Extract mermaid content
          const diagramContent = currentSection.join('\n').trim()
          if (diagramContent) {
            // Look for title in previous heading
            let title = `Diagram ${diagramIndex + 1}`
            for (let j = sectionStartLine - 1; j >= Math.max(0, sectionStartLine - 5); j--) {
              const prevLine = lines[j].trim()
              if (!prevLine) continue

              const headingMatch = prevLine.match(/^#+\s+(.+)$/)
              if (headingMatch) {
                title = headingMatch[1]
                break
              }

              if (prevLine && !prevLine.startsWith('#')) break
            }

            const diagram: DocumentDiagram = {
              id: `diagram-${diagramIndex}`,
              title,
              content: diagramContent,
              index: diagramIndex,
              startLine: sectionStartLine,
              endLine: i,
              rawBlock: lines.slice(sectionStartLine, i + 1).join('\n')
            }

            diagrams.push(diagram)
            tableOfContents.push({
              id: diagram.id,
              title: diagram.title,
              level: 4, // Treat diagrams as level 4 for TOC
              line: sectionStartLine,
              type: 'diagram'
            })
            diagramIndex++
          }
        } else {
          // End regular code block
          currentSection.push(line)
          flushCurrentSection(i + 1)
        }

        inCodeBlock = false
        codeBlockType = ''
        sectionStartLine = i + 1
      }
      continue
    }

    if (inCodeBlock) {
      currentSection.push(line)
      continue
    }

    // Detect section types
    if (line.trim().startsWith('#')) {
      // Heading
      flushCurrentSection(i)
      currentSection = [line]
      currentSectionType = 'heading'
      sectionStartLine = i
    } else if (line.trim().startsWith('>')) {
      // Blockquote
      if (currentSectionType !== 'blockquote') {
        flushCurrentSection(i)
        currentSectionType = 'blockquote'
        sectionStartLine = i
      }
      currentSection.push(line)
    } else if (line.trim().match(/^[-*+]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      // List
      if (currentSectionType !== 'list') {
        flushCurrentSection(i)
        currentSectionType = 'list'
        sectionStartLine = i
      }
      currentSection.push(line)
    } else if (line.trim() === '') {
      // Empty line - continue current section
      if (currentSection.length > 0) {
        currentSection.push(line)
      }
    } else {
      // Regular paragraph
      if (currentSectionType !== 'paragraph') {
        flushCurrentSection(i)
        currentSectionType = 'paragraph'
        sectionStartLine = i
      }
      currentSection.push(line)
    }
  }

  // Flush final section
  flushCurrentSection(lines.length)

  return {
    rawContent: markdown,
    sections,
    diagrams,
    tableOfContents
  }
}

// Render section content based on type
function renderSectionContent(content: string, type: DocumentSection['type']): string {
  switch (type) {
    case 'heading':
      return renderHeading(content)
    case 'paragraph':
      return renderParagraph(content)
    case 'code':
      return renderCode(content)
    case 'list':
      return renderList(content)
    case 'blockquote':
      return renderBlockquote(content)
    default:
      return renderParagraph(content)
  }
}

function renderHeading(content: string): string {
  const match = content.match(/^(#+)\s+(.+)$/)
  if (match) {
    const level = match[1].length
    const text = renderInlineElements(match[2])
    return `<h${level}>${text}</h${level}>`
  }
  return content
}

function renderParagraph(content: string): string {
  const paragraphs = content.split('\n\n').filter(p => p.trim())
  return paragraphs.map(p => `<p>${renderInlineElements(p.replace(/\n/g, ' '))}</p>`).join('')
}

function renderCode(content: string): string {
  // Handle code blocks that aren't mermaid
  return `<pre><code>${escapeHtml(content)}</code></pre>`
}

function renderList(content: string): string {
  const lines = content.split('\n').filter(line => line.trim())
  const isOrdered = lines[0].trim().match(/^\d+\./)
  const tag = isOrdered ? 'ol' : 'ul'

  const items = lines.map(line => {
    const match = line.match(/^[\s]*[-*+\d.]+\s+(.+)$/)
    return match ? `<li>${renderInlineElements(match[1])}</li>` : ''
  }).filter(Boolean)

  return `<${tag}>${items.join('')}</${tag}>`
}

function renderBlockquote(content: string): string {
  const lines = content.split('\n').map(line => {
    return line.replace(/^>\s?/, '')
  })
  return `<blockquote>${renderInlineElements(lines.join(' '))}</blockquote>`
}

function renderInlineElements(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Get theme-aware CSS for document rendering
export function getDocumentCSS(theme: 'tailwind' | 'github' | 'custom', darkMode: boolean = false): string {
  const themes = {
    tailwind: `
      .document-content {
        max-width: 100%;
        width: 100%;
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow-x: hidden !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-all !important;
        hyphens: auto !important;
      }

      .document-content * {
        max-width: 100% !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
      }

      .document-content h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 2rem 0 1rem 0;
        color: ${darkMode ? '#f1f5f9' : '#1f2937'};
        border-bottom: 3px solid ${darkMode ? '#3b82f6' : '#2563eb'};
        padding-bottom: 0.5rem;
      }

      .document-content h2 {
        font-size: 2rem;
        font-weight: 600;
        margin: 1.5rem 0 1rem 0;
        color: ${darkMode ? '#f1f5f9' : '#1f2937'};
        border-bottom: 2px solid ${darkMode ? '#334155' : '#e5e7eb'};
        padding-bottom: 0.25rem;
      }

      .document-content h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1.25rem 0 0.75rem 0;
        color: ${darkMode ? '#f1f5f9' : '#1f2937'};
      }

      .document-content h4,
      .document-content h5,
      .document-content h6 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem 0;
        color: ${darkMode ? '#f1f5f9' : '#1f2937'};
      }

      .document-content p {
        margin: 1rem 0;
        line-height: 1.7;
        color: ${darkMode ? '#e2e8f0' : '#374151'};
        max-width: 100%;
        overflow-wrap: break-word;
        word-break: break-word;
      }

      .document-content ul,
      .document-content ol {
        margin: 1rem 0;
        padding-left: 2rem;
        color: ${darkMode ? '#e2e8f0' : '#374151'};
      }

      .document-content li {
        margin: 0.5rem 0;
        line-height: 1.6;
      }

      .document-content blockquote {
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        background: ${darkMode ? '#1e293b' : '#f8fafc'};
        border-left: 4px solid ${darkMode ? '#3b82f6' : '#2563eb'};
        border-radius: 0 8px 8px 0;
        color: ${darkMode ? '#94a3b8' : '#6b7280'};
      }

      .document-content code {
        background: ${darkMode ? '#1e293b' : '#f1f5f9'};
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: Monaco, Menlo, monospace;
        font-size: 0.875rem;
        color: ${darkMode ? '#e2e8f0' : '#1f2937'};
      }

      .document-content pre {
        background: ${darkMode ? '#1e293b' : '#f1f5f9'};
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid ${darkMode ? '#334155' : '#e5e7eb'};
        margin: 1.5rem 0;
        max-width: 100%;
      }

      .document-content pre code {
        word-break: normal;
        white-space: pre;
        overflow-wrap: normal;
      }

      .document-content a {
        color: ${darkMode ? '#60a5fa' : '#2563eb'};
        text-decoration: underline;
      }

      .document-content a:hover {
        color: ${darkMode ? '#3b82f6' : '#1d4ed8'};
      }
    `,

    github: `
      .document-content {
        max-width: 100%;
        width: 100%;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #24292f;
        overflow-x: hidden !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-all !important;
        hyphens: auto !important;
      }

      .document-content * {
        max-width: 100% !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
      }

      .document-content h1,
      .document-content h2,
      .document-content h3,
      .document-content h4,
      .document-content h5,
      .document-content h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        border-bottom: 1px solid #d1d9e0;
        padding-bottom: 0.3em;
      }

      .document-content h1 { font-size: 2em; }
      .document-content h2 { font-size: 1.5em; }
      .document-content h3 { font-size: 1.25em; }

      .document-content p {
        margin-top: 0;
        margin-bottom: 16px;
        max-width: 100%;
        overflow-wrap: break-word;
        word-break: break-word;
      }

      .document-content blockquote {
        margin: 0;
        padding: 0 1em;
        color: #656d76;
        border-left: 0.25em solid #d1d9e0;
      }

      .document-content ul,
      .document-content ol {
        margin-top: 0;
        margin-bottom: 16px;
        padding-left: 2em;
      }

      .document-content pre,
      .document-content code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 12px;
      }

      .document-content pre {
        background-color: #f6f8fa;
        border-radius: 6px;
        padding: 16px;
        overflow: auto;
        border: 1px solid #d1d9e0;
        max-width: 100%;
      }

      .document-content pre code {
        word-break: normal;
        white-space: pre;
        overflow-wrap: normal;
      }

      .document-content code {
        background-color: rgba(175,184,193,0.2);
        padding: 0.2em 0.4em;
        border-radius: 6px;
      }
    `,

    custom: `
      .document-content {
        max-width: 100%;
        width: 100%;
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        color: ${darkMode ? '#f1f5f9' : '#1f2937'};
        overflow-x: hidden !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-all !important;
        hyphens: auto !important;
      }

      .document-content * {
        max-width: 100% !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
      }

      .document-content h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 2rem 0 1rem 0;
        line-height: 1.3;
        border-bottom: 3px solid ${darkMode ? '#3b82f6' : '#2563eb'};
        padding-bottom: 0.5rem;
      }

      .document-content h2 {
        font-size: 2rem;
        font-weight: 600;
        margin: 1.5rem 0 1rem 0;
        line-height: 1.3;
        border-bottom: 2px solid ${darkMode ? '#334155' : '#e5e7eb'};
        padding-bottom: 0.25rem;
      }

      .document-content h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1.25rem 0 0.75rem 0;
        line-height: 1.3;
      }

      .document-content h4,
      .document-content h5,
      .document-content h6 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem 0;
        line-height: 1.3;
      }

      .document-content p {
        margin-bottom: 1.5rem;
        color: ${darkMode ? '#e2e8f0' : '#374151'};
        max-width: 100%;
        overflow-wrap: break-word;
        word-break: break-word;
      }

      .document-content blockquote {
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        background: ${darkMode ? '#1e293b' : '#f8fafc'};
        border-left: 4px solid ${darkMode ? '#3b82f6' : '#2563eb'};
        border-radius: 0 8px 8px 0;
        color: ${darkMode ? '#94a3b8' : '#6b7280'};
      }

      .document-content code {
        background: ${darkMode ? '#1e293b' : '#f1f5f9'};
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
      }

      .document-content pre {
        background: ${darkMode ? '#1e293b' : '#f1f5f9'};
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid ${darkMode ? '#334155' : '#e5e7eb'};
        margin: 1.5rem 0;
        max-width: 100%;
      }

      .document-content pre code {
        word-break: normal;
        white-space: pre;
        overflow-wrap: normal;
      }

      .document-content ul,
      .document-content ol {
        margin: 1rem 0;
        padding-left: 2rem;
        color: ${darkMode ? '#e2e8f0' : '#374151'};
      }

      .document-content li {
        margin: 0.5rem 0;
        line-height: 1.6;
      }

      .document-content a {
        color: ${darkMode ? '#60a5fa' : '#2563eb'};
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
      }

      .document-content a:hover {
        border-bottom-color: ${darkMode ? '#60a5fa' : '#2563eb'};
      }
    `
  }

  return themes[theme]
}