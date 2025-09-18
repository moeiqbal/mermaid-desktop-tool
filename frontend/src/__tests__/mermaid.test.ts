import { describe, it, expect } from 'vitest'
import {
  extractMermaidFromMarkdown,
  extractMermaidDiagramsWithMetadata
} from '../utils/mermaid'

describe('Mermaid Extraction Utils', () => {
  describe('extractMermaidFromMarkdown', () => {
    it('should extract a single mermaid diagram', () => {
      const markdown = `
# Test Document

Some text here

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

More text
      `
      const diagrams = extractMermaidFromMarkdown(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0]).toBe('graph TD\n  A --> B')
    })

    it('should extract multiple mermaid diagrams', () => {
      const markdown = `
\`\`\`mermaid
graph TD
  A --> B
\`\`\`

\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
\`\`\`
      `
      const diagrams = extractMermaidFromMarkdown(markdown)
      expect(diagrams).toHaveLength(2)
      expect(diagrams[0]).toContain('graph TD')
      expect(diagrams[1]).toContain('sequenceDiagram')
    })

    it('should return empty array when no diagrams found', () => {
      const markdown = `
# Regular markdown

No mermaid diagrams here

\`\`\`javascript
const code = 'not mermaid';
\`\`\`
      `
      const diagrams = extractMermaidFromMarkdown(markdown)
      expect(diagrams).toHaveLength(0)
    })

    it('should handle malformed mermaid blocks', () => {
      const markdown = `
\`\`\`mermaid
graph TD
  A --> B
      `
      const diagrams = extractMermaidFromMarkdown(markdown)
      expect(diagrams).toHaveLength(0) // Unclosed blocks are not extracted by the simple regex
    })
  })

  describe('extractMermaidDiagramsWithMetadata', () => {
    it('should extract diagram with metadata including title from heading', () => {
      const markdown = `
# Introduction

## System Architecture

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0]).toMatchObject({
        content: 'graph TD\n  A --> B',
        index: 0,
        title: 'System Architecture',
        startLine: expect.any(Number),
        endLine: expect.any(Number)
      })
    })

    it('should detect title from code block metadata', () => {
      const markdown = `
\`\`\`mermaid title="Custom Title"
graph TD
  A --> B
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].title).toBe('title="Custom Title"')
    })

    it('should handle .mmd alias for mermaid blocks', () => {
      const markdown = `
\`\`\`mmd
graph TD
  A --> B
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].content).toBe('graph TD\n  A --> B')
    })

    it('should number untitled diagrams sequentially', () => {
      const markdown = `
\`\`\`mermaid
graph TD
  A --> B
\`\`\`

Some text

\`\`\`mermaid
graph LR
  C --> D
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(2)
      expect(diagrams[0].title).toBe('Diagram 1')
      expect(diagrams[1].title).toBe('Diagram 2')
    })

    it('should capture correct line numbers', () => {
      const markdown = `Line 0
Line 1
\`\`\`mermaid
graph TD
  A --> B
\`\`\`
Line 6`
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].startLine).toBe(2)
      expect(diagrams[0].endLine).toBe(5)
    })

    it('should handle unclosed mermaid blocks at end of file', () => {
      const markdown = `
\`\`\`mermaid
graph TD
  A --> B
  C --> D`
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].content).toBe('graph TD\n  A --> B\n  C --> D')
    })

    it('should extract multiple diagrams with mixed titles', () => {
      const markdown = `
## First Diagram

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
\`\`\`

### Third Diagram

\`\`\`mermaid
classDiagram
  Class01 <|-- Class02
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(3)
      expect(diagrams[0].title).toBe('First Diagram')
      expect(diagrams[1].title).toBe('Diagram 2')
      expect(diagrams[2].title).toBe('Third Diagram')
    })

    it('should handle empty mermaid blocks', () => {
      const markdown = `
\`\`\`mermaid
\`\`\`

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1) // Empty blocks are skipped
      expect(diagrams[0].content).toBe('graph TD\n  A --> B')
    })

    it('should preserve diagram content exactly', () => {
      const diagramContent = `graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do Something]
  B -->|No| D[Do Something Else]
  C --> E[End]
  D --> E`

      const markdown = `
\`\`\`mermaid
${diagramContent}
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].content).toBe(diagramContent)
    })

    it('should extract underlined headings as titles', () => {
      const markdown = `Architecture Overview
====================

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(1)
      expect(diagrams[0].title).toBe('Architecture Overview')
    })

    it('should handle complex real-world example', () => {
      const markdown = `
# Project Documentation

This is an introduction paragraph.

## System Flow

The following diagram shows the system architecture:

\`\`\`mermaid
graph TB
  subgraph "Frontend"
    A[React App] --> B[Components]
  end

  subgraph "Backend"
    C[API] --> D[Database]
  end

  B -->|HTTP| C
\`\`\`

## Database Schema

\`\`\`mermaid
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
\`\`\`

That's all for now.
      `
      const diagrams = extractMermaidDiagramsWithMetadata(markdown)
      expect(diagrams).toHaveLength(2)
      expect(diagrams[0].title).toBe('System Flow')
      expect(diagrams[1].title).toBe('Database Schema')
      expect(diagrams[0].content).toContain('graph TB')
      expect(diagrams[1].content).toContain('erDiagram')
    })
  })
})