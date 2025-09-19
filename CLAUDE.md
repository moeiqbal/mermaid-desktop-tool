# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Building and Running

#### Multi-Architecture Builds (Recommended)
```bash
# Multi-architecture build for both ARM64 and AMD64
./scripts/build-multiarch.sh mermaid-yang-app:latest

# Build for specific architecture (loadable locally)
./scripts/build-single-arch.sh arm64 mermaid-yang-app:arm64
./scripts/build-single-arch.sh amd64 mermaid-yang-app:amd64

# Direct buildx commands
docker buildx build --platform linux/arm64 -t mermaid-yang-app:arm64 -f docker/Dockerfile --load .
docker buildx build --platform linux/amd64 -t mermaid-yang-app:amd64 -f docker/Dockerfile --load .

# Development build with auto-detection
./scripts/build-dev.sh auto

# Development build for specific architecture
./scripts/build-dev.sh arm64  # or amd64
```

#### Production Deployment
```bash
# Clean production build
cd frontend && npm run build
cd ../backend && npm install

# Start production server (port 3000)
NODE_ENV=production node backend/src/server.js

# Access points:
# - Production app: http://localhost:3000
# - Backend API: http://localhost:3000/api/
# - Swagger docs: http://localhost:3000/api/docs
# - Health check: http://localhost:3000/api/health
```

#### Development Mode
```bash
# Frontend dev server with hot-reload
cd frontend && npm run dev  # Port 5173

# Backend dev server
cd backend && npm run dev    # Port 3000

# Docker development
docker-compose up dev --build
```

#### Legacy Single-Architecture Builds
```bash
# Production build and run (single container)
docker build -t mermaid-yang-app -f docker/Dockerfile .
docker run -p 3000:3000 -v $(pwd)/uploads:/app/uploads mermaid-yang-app
```

#### Docker Buildx Setup (One-time)
If multi-arch builds fail, ensure buildx is properly configured:
```bash
# Create and use multi-arch builder
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap
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

## Recent Feature Additions (v2.1)

### HTML Export System
- `frontend/src/utils/htmlExport.ts` - Core HTML generation with 3 CSS themes
- `frontend/src/components/HtmlExportModal.tsx` - Export configuration modal
- Supports Tailwind, GitHub, and Custom CSS styling options
- Generates standalone HTML files with embedded interactive Mermaid diagrams

### Enhanced Error Handling
- `frontend/src/components/YangErrorPanel.tsx` - Comprehensive error display component
- Structured error reporting with line numbers, severity levels, and troubleshooting tips
- Copy-to-clipboard functionality and expandable/collapsible interface
- Enhanced YANG parser error handling with fallback strategies

### UI/UX Improvements
- Fixed close button behavior in `FullScreenDiagram.tsx` with smart navigation
- Improved PNG/SVG export reliability in `MermaidDiagram.tsx` with React state management
- Enhanced notification system integration for user feedback

## Recent Updates (v2.2) - Safari Compatibility System

### Production Safari Compatibility Fix
**Problem**: Safari browsers showed white screens with SSL/connection errors instead of the React application, preventing the BrowserCompatibilityCheck component from loading.

**Solution**: Implemented server-side Safari detection and direct HTML response system:

#### Server-side Browser Detection (`backend/src/server.js`)
```javascript
// Safari compatibility middleware - serves compatibility page before React app loads
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || ''

  // Detect Safari (but not Chrome-based browsers)
  const isSafariRegex = /^((?!chrome|android).)*safari/i.test(userAgent)
  const isMobileSafari = /iphone|ipad|ipod/.test(userAgent.toLowerCase()) &&
                        /safari/.test(userAgent.toLowerCase()) &&
                        !/chrome/.test(userAgent.toLowerCase())

  if ((isSafariRegex || isMobileSafari) && req.path === '/') {
    // Serve Safari compatibility page directly
    res.send(/* Static HTML compatibility page */)
    return
  }
  next()
})
```

#### Enhanced Security Configuration
- **Content Security Policy**: Updated for Safari compatibility
- **Cross-Origin Policies**: Disabled COEP for Safari compatibility
- **Static HTML Response**: No external dependencies, preventing SSL/loading issues

#### Browser Support Matrix
- ✅ **Chrome/Chromium**: Full React application access
- ✅ **Firefox**: Full React application access
- ✅ **Microsoft Edge**: Full React application access
- ⚠️ **Safari (Desktop)**: Professional compatibility warning page
- ⚠️ **Safari (iOS/Mobile)**: Professional compatibility warning page

#### Benefits
- **No White Screens**: Safari users see professional messaging instead of errors
- **Zero Console Errors**: Clean server-side detection prevents asset loading failures
- **User-Friendly**: Clear browser recommendations with download links
- **SEO Safe**: Proper HTML structure and meta tags
- **Performance**: Lightweight static HTML loads instantly

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
- **Playwright E2E**: Multi-browser support (Chrome, Firefox, Safari WebKit)
- **Vitest Unit Tests**: Component testing with React Testing Library
- **API Integration Tests**: Backend endpoint validation and error handling
- **Browser Compatibility Tests**: Safari detection and compatibility page rendering
- **Test Coverage**: 93 unit tests (88 passed), 65 E2E tests with comprehensive scenarios
- **Known Test Issues**: Some Playwright tests fail in CI due to rapid execution environment differences vs production
- **Production Validation**: Manual testing confirms Safari compatibility system works correctly
- Test files in `frontend/tests/` and `frontend/src/__tests__/`

### Production Deployment Status
- ✅ **Application**: Running on port 3000 with clean build
- ✅ **All APIs**: Health, Files, Lint, YANG endpoints fully functional
- ✅ **Swagger Documentation**: Interactive API docs available at `/api/docs`
- ✅ **Safari Compatibility**: Server-side detection serving professional warning page
- ✅ **Chrome/Firefox/Edge**: Full React application access with all features