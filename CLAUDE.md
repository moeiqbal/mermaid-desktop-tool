# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Building and Running
```bash
# Production build and run (single container)
docker build -t mermaid-yang-app -f docker/Dockerfile .
docker run -p 3000:3000 -v $(pwd)/uploads:/app/uploads mermaid-yang-app

# Development with hot-reloading (recommended)
docker-compose up dev --build

# Access points:
# - Frontend dev server: http://localhost:5173 (with hot-reload)
# - Backend API: http://localhost:3000/api/
# - Production app: http://localhost:3000
```

### Development Commands
```bash
# Frontend only
cd frontend
npm run dev        # Vite dev server on port 5173
npm run build      # Production build
npm run lint       # ESLint v9 with TypeScript
npm run test       # Playwright tests
npm run test:ui    # Playwright UI mode

# Backend only
cd backend
npm run dev        # Nodemon for auto-restart
npm start          # Production start

# Testing
cd frontend
npm run test                    # Run all Playwright tests
npm run test -- smoke-test     # Run specific test file
npm run test:report            # View test reports
```

### Linting and Type Checking
```bash
cd frontend
npm run lint           # ESLint (v9 config in eslint.config.js)
npm run typecheck      # TypeScript checking (run this before commits)
```

## Architecture Overview

This is a **dual-view web application** for Mermaid diagram visualization and YANG model exploration, built as a **React SPA with Express backend**, containerized for ARM64/Apple Silicon.

### Core Architecture Pattern
- **Single-page application** with view switching (no page reloads)
- **State management**: React hooks with localStorage persistence
- **API communication**: REST endpoints with axios
- **File handling**: Temporary uploads with in-memory processing
- **Notification system**: Context-based toast notifications

### Key Architectural Components

**Frontend Structure (`frontend/src/`)**:
- `App.tsx` - Root component with view state management and theme handling
- `views/` - Page-level components (`MermaidViewer`, `YangExplorer`)
- `components/` - Reusable UI components with consistent design system
- `utils/` - Mermaid initialization and helper functions

**Backend Structure (`backend/src/`)**:
- `server.js` - Express app with security middleware and static serving
- `routes/` - API endpoints (`files.js`, `lint.js`, `yang.js`)
- Production mode serves frontend build from `/frontend/dist`

**View Switching Logic**:
The app uses a `currentView` state to toggle between two main modes:
- `mermaid`: File upload → Mermaid rendering → Linting tools
- `yang`: YANG upload → Tree visualization → Properties panel

## Critical Implementation Details

### ESM/CommonJS Compatibility Issues
The backend uses ESM modules but some packages (markdownlint, mermaid) require special import handling:

```javascript
// Required pattern for CommonJS packages:
import markdownlintPkg from 'markdownlint'
const { markdownlint } = markdownlintPkg
```

### YANG Parser Configuration
- Uses `yang-js` (replaced `node-yang` which was deprecated)
- Parser calls: `Yang.parse()` not `yang.parseYang()`
- Fallback parsing with error handling for malformed YANG files

### NotificationSystem Implementation
- **Context-based**: `NotificationProvider` wraps the entire app
- **Hook usage**: `useToast()` for components, `useNotifications()` for advanced control
- **Auto-dismiss**: 5-second timeout unless marked `persistent: true`
- **Positioning**: Fixed top-right with stacking support

### Docker Multi-stage Build
- **ARM64 optimized**: Uses `--platform=linux/arm64` for Apple Silicon
- **Frontend build stage**: Vite build → static assets
- **Production stage**: Node.js serving backend + frontend dist
- **Security**: Non-root user, dumb-init for signal handling

### File Upload Architecture
- **Multer middleware**: 10MB limit, 10 files max per upload
- **Temporary storage**: `uploads/` directory (Docker volume mounted)
- **Processing**: Files processed in-memory, not permanently stored
- **Supported types**: `.md`, `.mmd`, `.mermaid`, `.yang`

## Recent Updates and Important Notes

**Package Updates (September 2025)**:
- Mermaid v10.6.1 → v11.4.1 (breaking changes possible)
- Vite v4 → v6 (watch for plugin compatibility)
- ESLint v8 → v9 (new config format in `eslint.config.js`)
- Multer v1.4.5-lts.1 → v2.0.2 (security fix)

**Known Issues to Watch**:
- ESM/CommonJS compatibility with new packages
- Vite 6 plugin compatibility
- Mermaid v11 API changes in diagram rendering
- `yang-js` vs `node-yang` parsing differences

**Testing Framework**:
- Playwright with multi-browser support (Chrome, Firefox, Safari, Mobile)
- Comprehensive test coverage: initialization, navigation, file operations, API integration
- Docker integration for consistent test environment
- Test files in `frontend/tests/` with detailed test plan documentation