# Phase 3: Document View Tab - Full Markdown Preview with Inline Diagrams

## Overview
Add a new "Document View" tab alongside the existing "Mermaid Viewer" and "YANG Explorer" tabs that renders the complete markdown file with inline mermaid diagrams in a formatted, readable view. This feature addresses the user need to review full documents (30% of usage) without leaving the application for VSCode or Obsidian, while preserving all existing Mermaid Viewer functionality.

## Phase 3 Detailed Todo List

### 1. Planning & Architecture Analysis
- [ ] Review existing tab navigation system in `App.tsx`
- [ ] Analyze current Mermaid Viewer component structure
- [ ] Study existing theme system and CSS export functionality
- [ ] Map out component reuse opportunities for diagram rendering
- [ ] Document current markdown parsing approach
- [ ] Identify shared state requirements between tabs

### 2. Tab Navigation System Enhancement
- [ ] Modify main navigation to add "Document View" tab
- [ ] Position new tab between "Mermaid Viewer" and "YANG Explorer"
- [ ] Ensure identical tab styling matches existing design
- [ ] Implement tab state preservation when switching views
- [ ] Update tab focus and accessibility attributes
- [ ] Test tab navigation behavior and keyboard shortcuts

### 3. Document View Component Architecture
- [ ] Create `DocumentView.tsx` main component in `frontend/src/views/`
- [ ] Design layout structure with main content area and sidebar
- [ ] Implement responsive layout matching existing views
- [ ] Create container margins and padding consistent with Mermaid Viewer
- [ ] Set up proper component hierarchy and data flow
- [ ] Implement error boundaries for document parsing failures

### 4. Markdown Rendering Engine
- [ ] Integrate with existing markdown parsing library
- [ ] Implement full markdown content rendering with themes
- [ ] Support for headings (H1, H2, H3) extraction
- [ ] Handle inline code, links, tables, and other markdown elements
- [ ] Parse and identify mermaid diagram blocks in document
- [ ] Maintain original positioning of diagrams in document flow

### 5. Theme System Integration
- [ ] Reuse existing Export HTML theme selector component
- [ ] Position theme selector in top-right (similar to Export HTML button)
- [ ] Implement theme options:
  - [ ] Tailwind CSS theme
  - [ ] GitHub Style theme
  - [ ] Custom theme
  - [ ] Dark mode toggle
- [ ] Apply theme changes in real-time without page refresh
- [ ] Share CSS theme definitions with Export HTML feature

### 6. Sidebar Navigation Component
- [ ] Create collapsible table of contents sidebar
- [ ] Extract document headings (H1, H2, H3) for navigation
- [ ] Generate diagram list with titles (e.g., "Diagram 1: vCMTS Cluster Physical Architecture")
- [ ] Implement click-to-scroll functionality for sections/diagrams
- [ ] Add current section highlighting based on scroll position
- [ ] Use same styling as existing file browser sidebar
- [ ] Implement collapsible/expandable behavior

### 7. Inline Diagram Rendering
- [ ] Reuse existing mermaid rendering components/logic from Mermaid Viewer
- [ ] Render diagrams inline at original document positions
- [ ] Ensure diagram IDs are consistent between Document View and Mermaid Viewer
- [ ] Implement lazy loading for large documents with many diagrams
- [ ] Maintain diagram performance and rendering quality
- [ ] Handle diagram parsing errors gracefully in document context

### 8. Diagram Interaction System
- [ ] Implement hover overlay controls for diagrams:
  - [ ] Zoom in/out buttons
  - [ ] Pan control
  - [ ] Export (SVG/PNG) buttons
  - [ ] Fullscreen button
  - [ ] "Open in Mermaid Viewer" link
- [ ] Use same icons and styling as existing Mermaid Viewer
- [ ] Implement click behavior to open diagram in modal/lightbox
- [ ] Integrate full Mermaid Viewer controls in modal
- [ ] Maintain existing zoom/pan functionality from Mermaid Viewer

### 9. Cross-Tab Synchronization
- [ ] Implement "Open in Mermaid Viewer" functionality:
  - [ ] Switch to Mermaid Viewer tab
  - [ ] Highlight/scroll to specific diagram
  - [ ] Maintain diagram focus and context
- [ ] Add optional breadcrumb showing "Viewing Diagram X of Y"
- [ ] Sync diagram state between Document View and Mermaid Viewer
- [ ] Ensure seamless transition between views

### 10. Performance Optimization
- [ ] Implement efficient DOM operations for large documents
- [ ] Add lazy loading for diagrams if document contains many
- [ ] Optimize re-rendering when switching themes
- [ ] Ensure no performance degradation for existing features
- [ ] Implement virtual scrolling if needed for very large documents
- [ ] Cache rendered diagrams to avoid re-processing

### 11. Testing & Quality Assurance
- [ ] Create unit tests for DocumentView component
- [ ] Test markdown parsing with various document structures
- [ ] Test theme switching functionality
- [ ] Verify diagram interactions work correctly
- [ ] Test sidebar navigation with different document sizes
- [ ] Cross-browser testing for rendering consistency
- [ ] Performance testing with large documents
- [ ] Accessibility testing for keyboard navigation

### 12. Integration & UI Consistency
- [ ] Ensure consistent color scheme, fonts, and spacing
- [ ] Use same component library (Lucide icons, existing button styles)
- [ ] Maintain current responsive breakpoints
- [ ] Follow established interaction patterns (hover states, click behaviors)
- [ ] Keep same header height and layout structure
- [ ] Verify no existing Mermaid Viewer features are modified
- [ ] Maintain UI consistency throughout application

### 13. Documentation & Final Polish
- [ ] Add JSDoc comments for new components and functions
- [ ] Update component documentation
- [ ] Add entries to FEATURE_TESTS.md
- [ ] Create user guide section for Document View
- [ ] Document theme system integration
- [ ] Update API documentation if needed

## Technical Implementation Details

### Component Structure
```
frontend/src/views/DocumentView.tsx (main component)
frontend/src/components/DocumentViewSidebar.tsx
frontend/src/components/InlineDiagram.tsx
frontend/src/components/DiagramHoverControls.tsx
frontend/src/utils/markdownParser.ts
```

### Integration Points
```
frontend/src/App.tsx (add new tab)
frontend/src/views/MermaidViewer.tsx (diagram synchronization)
frontend/src/components/ThemeSelector.tsx (reuse)
frontend/src/utils/mermaidRenderer.ts (reuse diagram logic)
```

### Shared State Management
- Current document content
- Active theme selection
- Diagram states and positions
- Navigation state between tabs

### Theme CSS Integration
- Reuse existing theme definitions from HTML export
- Apply themes to document content and diagrams
- Maintain theme persistence across tab switches

## User Stories & Acceptance Criteria

### User Story 1: Document Review
**As an architect, I want to review my complete documentation with embedded diagrams without switching to VSCode**
- [ ] Can switch to Document View tab
- [ ] See full markdown document with formatted text
- [ ] View diagrams in their original document context
- [ ] Navigate document using sidebar table of contents

### User Story 2: Workflow Integration
**As a user, I want to quickly switch between focused diagram work (75% of time) and document review (30% of time)**
- [ ] Can seamlessly switch between Document View and Mermaid Viewer
- [ ] All existing Mermaid Viewer features remain unchanged
- [ ] No performance degradation when switching views
- [ ] State is preserved when switching between tabs

### User Story 3: Diagram Interaction
**As a user, I want to see diagrams in their document context while retaining ability to interact with them**
- [ ] Can hover over diagrams to see interaction controls
- [ ] Can click diagrams to open in modal with full controls
- [ ] Can export diagrams directly from document view
- [ ] Can switch to focused diagram editing in Mermaid Viewer

## Success Criteria Checklist
- [ ] New Document View tab is visible and functional
- [ ] All existing Mermaid Viewer features remain unchanged
- [ ] Markdown renders with selected CSS theme
- [ ] Diagrams appear inline and are interactive
- [ ] Sidebar navigation works for headings and diagrams
- [ ] Can switch between Document View and Mermaid Viewer seamlessly
- [ ] UI consistency maintained throughout
- [ ] No performance degradation for existing features

## Design Constraints & Requirements
- [ ] Match existing color scheme, fonts, and spacing
- [ ] Use the same component library (Lucide icons, existing button styles)
- [ ] Maintain current responsive breakpoints
- [ ] Follow established interaction patterns (hover states, click behaviors)
- [ ] Keep the same header height and layout structure
- [ ] Preserve excellent diagram-focused workflow users currently love

## Files to be Modified/Created

### New Files
- [ ] `frontend/src/views/DocumentView.tsx`
- [ ] `frontend/src/components/DocumentViewSidebar.tsx`
- [ ] `frontend/src/components/InlineDiagram.tsx`
- [ ] `frontend/src/components/DiagramHoverControls.tsx`
- [ ] `frontend/src/utils/documentParser.ts`

### Modified Files
- [ ] `frontend/src/App.tsx` (add new tab)
- [ ] `frontend/src/views/MermaidViewer.tsx` (synchronization)
- [ ] Existing theme components (integration)
- [ ] Navigation components (add new tab)

### Test Files
- [ ] `frontend/tests/document-view.spec.ts`
- [ ] `frontend/tests/diagram-interaction.spec.ts`
- [ ] `frontend/tests/theme-integration.spec.ts`

## Estimated Timeline
**Total: 20-25 hours**
- Planning & Architecture: 3 hours
- Tab Navigation & Basic Layout: 4 hours
- Markdown Rendering & Theme Integration: 5 hours
- Sidebar Navigation: 3 hours
- Diagram Interaction System: 6 hours
- Cross-tab Synchronization: 3 hours
- Testing & Polish: 4 hours
- Documentation: 2 hours

## Risk Mitigation
- [ ] Maintain complete backward compatibility with existing features
- [ ] Implement feature flags for gradual rollout if needed
- [ ] Create comprehensive test coverage before merging
- [ ] Performance monitoring to ensure no degradation
- [ ] User feedback integration for iterative improvements