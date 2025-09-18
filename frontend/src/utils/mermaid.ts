import mermaid from 'mermaid'

// Initialize Mermaid with configuration
export const initMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      darkMode: true,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontSize: '16px'
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis'
    },
    sequence: {
      useMaxWidth: false,
      wrap: true,
      messageFont: function() {
        return {
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          fontSize: 14,
          fontWeight: 'normal'
        }
      }
    },
    gantt: {
      useMaxWidth: false,
      fontSize: 12
    },
    er: {
      useMaxWidth: false,
      fontSize: 12
    },
    pie: {
      useMaxWidth: false,
      textPosition: 0.75
    },
    quadrantChart: {
      useMaxWidth: false
    },
    xyChart: {
      useMaxWidth: false
    },
    requirement: {
      useMaxWidth: false,
      fontSize: 12
    },
    mindmap: {
      useMaxWidth: false
    },
    timeline: {
      useMaxWidth: false
    },
    gitGraph: {
      useMaxWidth: false,
      theme: 'dark'
    },
    c4: {
      useMaxWidth: false
    },
    sankey: {
      useMaxWidth: false
    },
    block: {
      useMaxWidth: false
    },
    packet: {
      useMaxWidth: false
    },
    architecture: {
      useMaxWidth: false
    }
  })
}

// Set theme dynamically
export const setMermaidTheme = (isDark: boolean) => {
  mermaid.initialize({
    theme: isDark ? 'dark' : 'default',
    themeVariables: {
      darkMode: isDark,
      primaryColor: isDark ? '#3b82f6' : '#2563eb',
      primaryTextColor: isDark ? '#ffffff' : '#1f2937',
      primaryBorderColor: isDark ? '#1e40af' : '#3b82f6',
      lineColor: isDark ? '#6b7280' : '#374151',
      sectionBkgColor: isDark ? '#374151' : '#f3f4f6',
      altSectionBkgColor: isDark ? '#4b5563' : '#e5e7eb',
      gridColor: isDark ? '#4b5563' : '#d1d5db',
      c0: isDark ? '#1f2937' : '#ffffff',
      c1: isDark ? '#374151' : '#f9fafb',
      c2: isDark ? '#4b5563' : '#f3f4f6',
      c3: isDark ? '#6b7280' : '#e5e7eb'
    }
  })
}

// Render Mermaid diagram
export const renderMermaidDiagram = async (
  definition: string,
  elementId: string
): Promise<{ svg: string; bindFunctions?: any }> => {
  try {
    // Validate the mermaid syntax first
    const isValid = await mermaid.parse(definition)
    if (!isValid) {
      throw new Error('Invalid Mermaid syntax')
    }

    // Generate unique ID for this diagram
    const graphId = `mermaid-${elementId}-${Date.now()}`

    // Render the diagram
    const { svg, bindFunctions } = await mermaid.render(graphId, definition)

    return { svg, bindFunctions }
  } catch (error) {
    console.error('Error rendering Mermaid diagram:', error)
    throw error
  }
}

// Interface for diagram metadata
export interface DiagramMetadata {
  content: string
  index: number
  title?: string
  startLine: number
  endLine: number
  rawBlock: string
}

// Extract Mermaid code blocks from Markdown with metadata
export const extractMermaidFromMarkdown = (markdown: string): string[] => {
  const mermaidBlocks: string[] = []
  const regex = /```mermaid\s*\n([\s\S]*?)\n```/g
  let match

  while ((match = regex.exec(markdown)) !== null) {
    mermaidBlocks.push(match[1].trim())
  }

  return mermaidBlocks
}

// Enhanced extraction with metadata
export const extractMermaidDiagramsWithMetadata = (markdown: string): DiagramMetadata[] => {
  const diagrams: DiagramMetadata[] = []
  const lines = markdown.split('\n')

  // Regex patterns for different code block formats
  const mermaidBlockRegex = /```(?:mermaid|mmd)(?:\s+(.+?))?\s*$/
  const endBlockRegex = /^```\s*$/

  let inMermaidBlock = false
  let currentDiagram: string[] = []
  let blockStartLine = -1
  let blockTitle: string | undefined
  let diagramIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!inMermaidBlock) {
      const match = line.match(mermaidBlockRegex)
      if (match) {
        inMermaidBlock = true
        blockStartLine = i
        blockTitle = match[1] || undefined // Capture title if present
        currentDiagram = []

        // Look for a heading above the code block (search up to 5 lines back)
        if (!blockTitle) {
          for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
            const prevLine = lines[j].trim()

            // Skip empty lines
            if (!prevLine) continue

            // Check for markdown headings
            const headingMatch = prevLine.match(/^#+\s+(.+)$/)
            if (headingMatch) {
              blockTitle = headingMatch[1]
              break
            }

            // Check for underlined headings
            if (j < lines.length - 1 && /^[=-]+$/.test(lines[j + 1])) {
              blockTitle = prevLine
              break
            }

            // Stop at the first non-empty, non-heading line
            if (prevLine && !prevLine.startsWith('#')) {
              // Check if it could be an underlined heading
              if (j < lines.length - 1 && !/^[=-]+$/.test(lines[j + 1])) {
                break
              }
            }
          }
        }
      }
    } else {
      if (endBlockRegex.test(line)) {
        // End of mermaid block
        const content = currentDiagram.join('\n').trim()
        if (content) {
          diagrams.push({
            content,
            index: diagramIndex,
            title: blockTitle || `Diagram ${diagramIndex + 1}`,
            startLine: blockStartLine,
            endLine: i,
            rawBlock: lines.slice(blockStartLine, i + 1).join('\n')
          })
          diagramIndex++
        }

        inMermaidBlock = false
        currentDiagram = []
        blockTitle = undefined
      } else {
        currentDiagram.push(line)
      }
    }
  }

  // Handle unclosed block at end of file
  if (inMermaidBlock && currentDiagram.length > 0) {
    const content = currentDiagram.join('\n').trim()
    if (content) {
      diagrams.push({
        content,
        index: diagramIndex,
        title: blockTitle || `Diagram ${diagramIndex + 1}`,
        startLine: blockStartLine,
        endLine: lines.length - 1,
        rawBlock: lines.slice(blockStartLine).join('\n')
      })
    }
  }

  return diagrams
}

// Validate Mermaid syntax
export const validateMermaidSyntax = async (definition: string): Promise<{
  isValid: boolean
  error?: string
}> => {
  try {
    const isValid = await mermaid.parse(definition)
    return { isValid }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown syntax error'
    }
  }
}

// Get supported diagram types
export const getSupportedDiagramTypes = () => {
  return [
    { type: 'flowchart', name: 'Flowchart', example: 'flowchart TD\nA[Start] --> B[End]' },
    { type: 'sequenceDiagram', name: 'Sequence Diagram', example: 'sequenceDiagram\nAlice->>Bob: Hello Bob, how are you?\nBob-->>Alice: Great!' },
    { type: 'classDiagram', name: 'Class Diagram', example: 'classDiagram\nclass Animal\nAnimal: +String name\nAnimal: +bark()' },
    { type: 'stateDiagram', name: 'State Diagram', example: 'stateDiagram-v2\n[*] --> Still\nStill --> [*]' },
    { type: 'erDiagram', name: 'Entity Relationship', example: 'erDiagram\nCUSTOMER ||--o{ ORDER : places' },
    { type: 'journey', name: 'User Journey', example: 'journey\ntitle My working day\nsection Go to work\nMake tea: 5: Me' },
    { type: 'gantt', name: 'Gantt Chart', example: 'gantt\ntitle A Gantt Diagram\nTask 1: done, des1, 2014-01-06,2014-01-08' },
    { type: 'pie', name: 'Pie Chart', example: 'pie title Pets adopted by volunteers\n"Dogs" : 386\n"Cats" : 85' },
    { type: 'quadrantChart', name: 'Quadrant Chart', example: 'quadrantChart\ntitle Reach and influence\nx-axis Low Reach --> High Reach\ny-axis Low Influence --> High Influence\nquadrant-1 We should expand\nquadrant-2 Need to promote\nquadrant-3 Re-evaluate\nquadrant-4 May be improved' },
    { type: 'requirement', name: 'Requirement Diagram', example: 'requirementDiagram\nrequirement test_req {\nid: 1\ntext: the test text.\nrisk: high\nverifymethod: test\n}' },
    { type: 'gitgraph', name: 'Git Graph', example: 'gitgraph\ncommit\nbranch develop\ncommit' },
    { type: 'mindmap', name: 'Mindmap', example: 'mindmap\nroot((mindmap))\nOrigins\nLong history\nPopularisation' },
    { type: 'timeline', name: 'Timeline', example: 'timeline\ntitle History of Social Media Platform\n2002 : LinkedIn\n2004 : Facebook' },
    { type: 'sankey', name: 'Sankey Diagram', example: 'sankey-beta\nA,B,10\nA,C,20\nB,D,15' },
    { type: 'xyChart', name: 'XY Chart', example: 'xyChart-beta\ntitle "Sales Revenue"\nx-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]\ny-axis "Revenue (in $)" 4000 --> 11000\nbar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]' },
    { type: 'block', name: 'Block Diagram', example: 'block-beta\ncolumns 1\ndb(("DB"))\nblockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)\nblock:ID\nA\nB["A wide one in the middle"]\nC\nend' },
    { type: 'packet', name: 'Packet Diagram', example: 'packet-beta\n0-15: "Source Port"\n16-31: "Destination Port"' },
    { type: 'c4Context', name: 'C4 Context', example: 'C4Context\ntitle System Context diagram for Internet Banking System\nEnterprise_Boundary(b0, "BankBoundary0") {\nPerson(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")\n}' },
    { type: 'architecture', name: 'Architecture', example: 'architecture-beta\ngroup api(logos:aws-lambda)[API]\nservice db(logos:aws-aurora)[Database] in api\nservice disk1(logos:aws-glacier)[Storage] in api' }
  ]
}