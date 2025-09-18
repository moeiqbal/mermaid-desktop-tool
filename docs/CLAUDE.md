# CLAUDE.md - Mermaid & YANG Model Visualization Web Application

## Project Overview
You are building a locally hosted web application for visualizing and managing Mermaid diagrams, Markdown files, and YANG models. This application will run in Docker on an ARM-based MacBook and should have a premium, visually appealing interface with three core features.

## Technical Stack Requirements
- **Deployment**: Docker container optimized for ARM architecture (Apple Silicon)
- **Backend**: Node.js with Express or Python with FastAPI
- **Frontend**: React or Vue.js with a modern UI framework (Material-UI, Ant Design, or Tailwind CSS)
- **Mermaid Rendering**: Latest mermaid.js library (refer to https://mermaid.js.org/intro/)
- **YANG Processing**: Open-source YANG parser library (pyang, yang-js, or similar)
- **File Management**: Local file system integration with temporary server storage
- **No Authentication**: This is for local development only - no passwords or security measures needed

## Core Features Specification

### Feature 1: Mermaid Diagram Viewer
**Left Panel - File Selection**
- Display a tree view or list of uploaded Markdown and Mermaid files
- Support for .md, .mmd, and .mermaid file extensions
- Visual indicators for file types (icons)
- Search/filter capability for files
- File upload button with drag-and-drop support
- Delete button for each file (removes from server storage only, not local filesystem)
- Files should persist in browser localStorage or server session

**Main Panel - Diagram Display**
- Render selected Mermaid diagrams with full support for all diagram types:
  - Flowchart
  - Sequence Diagram
  - Class Diagram
  - State Diagram
  - Entity Relationship Diagram
  - User Journey
  - Gantt
  - Pie Chart
  - Quadrant Chart
  - Requirement Diagram
  - Gitgraph
  - C4 Diagrams
  - Mindmaps
  - Timeline
  - ZenUML
  - Sankey
  - XY Chart
  - Block Diagram
  - Packet
  - Architecture
- Pan and zoom controls:
  - Mouse wheel zoom
  - Click and drag to pan
  - Zoom buttons (+/-, reset, fit to screen)
  - Mini-map for navigation (optional but preferred)
- Export options: PNG, SVG, PDF
- Full-screen mode toggle

### Feature 2: Markdown/Mermaid Linting
**Right-Click Context Menu on Files**
- "Lint Markdown" option for .md files
- "Lint Mermaid" option for Mermaid content
- "Auto-fix Issues" option

**Linting Functionality**
- Markdown linting using markdownlint or similar
- Mermaid syntax validation using mermaid.parse()
- Display issues in a modal or side panel with:
  - Line numbers
  - Error descriptions
  - Suggested fixes
  - "Fix All" button
  - "Fix Selected" option
- Auto-correction with user confirmation prompt
- Preserve original file backup before corrections
- Show before/after diff view

### Feature 3: YANG Model Explorer
**Top Navigation Bar**
- "YANG Explorer" button/tab
- File/folder selection dialog
- Support for:
  - Single .yang file upload
  - Multiple .yang files selection
  - Entire folder upload
  - Drag-and-drop functionality

**YANG Visualization Panel**
- Tree view of YANG model hierarchy
- Expandable/collapsible nodes
- Visual representation showing:
  - Modules and submodules
  - Containers
  - Lists
  - Leaf nodes
  - RPCs
  - Notifications
  - Augmentations
  - Dependencies between modules
- Search functionality within models
- Properties panel showing details of selected nodes
- Export capabilities (JSON, tree diagram)
- Syntax highlighting for YANG code view

## UI/UX Requirements

### Design Principles
- **Premium Feel**: Use subtle gradients, smooth animations, and consistent spacing
- **Color Scheme**: Dark mode by default with light mode toggle
- **Typography**: Clean, modern fonts (Inter, Roboto, or system fonts)
- **Layout**: Responsive design with resizable panels
- **Animations**: Smooth transitions (300ms default) for all interactions
- **Loading States**: Skeleton screens or elegant spinners
- **Empty States**: Helpful messages and call-to-action buttons

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] [YANG Explorer]           [Dark/Light] [Settings]│ <- Header
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  File    │                                              │
│  List    │            Main Content Area                 │
│          │         (Diagram/Editor/YANG View)           │
│  [+ Add] │                                              │
│  [Search]│                                              │
│          │                                              │
│          │     [Zoom Controls] [Export] [Fullscreen]    │
└──────────┴──────────────────────────────────────────────┘
```

## Development Approach & Task Management

### Task Breakdown Structure
Create a `tasks.md` file in the project root that follows this structure:

```markdown
# Development Tasks

## Phase 1: Project Setup
- [ ] Initialize project structure
  - [ ] Create Docker configuration for ARM
  - [ ] Setup frontend framework
  - [ ] Setup backend server
  - [ ] Configure hot-reloading for development
- [ ] Analysis: [Write technical decisions and rationale]
- [ ] Output: [Document setup instructions]

## Phase 2: Core Infrastructure
- [ ] Implement file management system
  - [ ] File upload API
  - [ ] Temporary storage management
  - [ ] File listing endpoint
- [ ] Setup Mermaid.js integration
- [ ] Setup YANG parser library
- [ ] Analysis: [Document API design choices]
- [ ] Output: [API documentation]

## Phase 3: Feature 1 - Mermaid Viewer
- [ ] Build file selection panel
  - [ ] File tree component
  - [ ] Upload interface
  - [ ] Delete functionality
- [ ] Implement diagram renderer
  - [ ] Mermaid initialization
  - [ ] Pan/zoom implementation
  - [ ] Export functionality
- [ ] Analysis: [Performance considerations]
- [ ] Output: [Feature test cases]

## Phase 4: Feature 2 - Linting
- [ ] Integrate linting libraries
- [ ] Build context menu
- [ ] Implement auto-fix logic
- [ ] Create diff viewer
- [ ] Analysis: [Linting rules configuration]
- [ ] Output: [Linting documentation]

## Phase 5: Feature 3 - YANG Explorer
- [ ] Setup YANG parser
- [ ] Build tree visualization
- [ ] Implement search functionality
- [ ] Create properties panel
- [ ] Analysis: [YANG parsing strategy]
- [ ] Output: [YANG feature guide]

## Phase 6: Polish & Optimization
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Error handling
- [ ] Final testing
- [ ] Analysis: [Performance metrics]
- [ ] Output: [Deployment guide]
```

### Scratchpad Requirements
For each task, maintain a scratchpad section in `tasks.md`:
- **Analysis**: Document technical decisions, trade-offs, and reasoning
- **Blockers**: List any impediments or dependencies
- **Solutions**: Document solutions to problems encountered
- **Testing Notes**: Record test scenarios and results
- **Performance Metrics**: Note any performance considerations

## File Structure
```
project-root/
├── docker/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── uploads/           # Temporary file storage
├── tasks.md          # Task tracking with scratchpad
├── CLAUDE.md         # This file
├── docker-compose.yml
└── README.md

```

## Success Criteria
1. Application runs successfully in Docker on ARM MacBook with single command
2. All three features are fully functional without authentication
3. UI is visually appealing with smooth interactions
4. Files can be uploaded, viewed, and managed efficiently
5. Mermaid diagrams render correctly with pan/zoom functionality
6. Linting provides accurate feedback and auto-correction
7. YANG models are parsed and visualized hierarchically
8. No external dependencies beyond Docker
9. Hot-reloading works for development
10. Application is responsive and performs well with large files

## Implementation Notes
- Start with a minimal viable version of each feature
- Focus on functionality over optimization initially
- Use modern JavaScript/TypeScript features
- Implement proper error boundaries and fallbacks
- Add console logging for debugging during development
- Comment code thoroughly for future maintenance
- Create a simple landing page that clearly shows all three features

## Commands to Include
```bash
# Build and run
docker build -t mermaid-yang-app .
docker run -p 3000:3000 -v $(pwd):/app mermaid-yang-app

# Development mode
docker-compose up --build

# Stop application
docker-compose down
```

Remember: This is for local development only. Prioritize functionality and user experience over security or scalability concerns.