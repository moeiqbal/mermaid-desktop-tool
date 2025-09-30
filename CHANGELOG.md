# Changelog

All notable changes to the Mermaid & YANG Visualization Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2025-09-29

### Added
- **Mermaid Editor Feature**: New interactive code editor view for creating and editing Mermaid diagrams
  - Live preview with split-pane interface
  - Syntax highlighting with CodeMirror
  - Real-time error detection and validation
  - Theme selector integration
  - Export capabilities (PNG, SVG, HTML)
  - Resizable editor and preview panes

### Fixed
- Integrated Mermaid Editor into main navigation (was missing from App.tsx routing)
- Added missing CodeMirror dependencies (@uiw/react-codemirror, @codemirror/lang-javascript, @codemirror/view)
- Fixed Docker build failures due to missing dependencies
- Resolved navigation state management to include 'editor' view type

### Changed
- Updated frontend and backend package versions to 2.5.0
- Enhanced Header component to support four navigation views (Viewer, Editor, Document, YANG)
- Improved build configuration to include CodeMirror dependencies

### Technical Details
- Added MermaidEditorView component with full editor functionality
- Added MermaidEditor component for CodeMirror integration
- Added SplitPane component for resizable panels
- Updated routing configuration in App.tsx
- Fixed TypeScript type definitions for view states

## [2.4.0] - 2025-09-29

### Added
- Document View improvements with word wrap overflow fixes
- Mermaid theme selector in Document View

### Fixed
- Resolved horizontal overflow issues in Document View
- Fixed text wrapping for long words without spaces

## [2.3.0] - Previous Release

### Added
- Comprehensive dark mode toggle for Mermaid diagrams
- Theme persistence across sessions

## [2.2.0] - Previous Release

### Added
- Safari compatibility system with server-side detection
- Professional compatibility warning page for unsupported browsers

## [2.1.0] - Previous Release

### Added
- HTML export system with multiple CSS themes
- Enhanced error handling for YANG parsing
- Comprehensive test suite