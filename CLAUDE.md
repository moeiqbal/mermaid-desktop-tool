# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Docker Deployment (Recommended)
```bash
# Production
docker-compose up -d app          # Start production container
docker-compose logs -f app         # View logs
docker-compose down                # Stop all containers
docker-compose restart app         # Restart application

# Development with hot-reload
docker-compose up -d dev           # Start dev environment
docker-compose logs -f dev         # View dev logs

# Clean rebuild
docker-compose down
docker system prune -af --volumes
docker-compose build --no-cache app
docker-compose up -d app
```

### Local Development
```bash
# Frontend (port 5173)
cd frontend
npm install                        # Install dependencies
npm run dev                        # Start Vite dev server
npm run build                      # Production build
npm run lint                       # Run ESLint
npm run typecheck                  # TypeScript checking
npm run test                       # Run Playwright tests
npm run test:ui                    # Playwright UI mode

# Backend (port 3000)
cd backend
npm install                        # Install dependencies
npm run dev                        # Start with nodemon
npm start                          # Production mode
NODE_ENV=production node src/server.js  # Direct production start

# Run specific Playwright test
cd frontend
npx playwright test tests/specific-test.spec.ts --headed
```

## Architecture Overview

### Application Structure
Four-view React SPA with Express backend, optimized for ARM64/Apple Silicon:
- **Mermaid Viewer**: File management and diagram rendering with export capabilities
- **Mermaid Editor**: Interactive split-pane editor with CodeMirror and live preview (v2.5.0)
- **Document View**: Markdown rendering with inline Mermaid diagrams and theme selection
- **YANG Explorer**: Model parsing, tree visualization, and dependency tracking

### Critical Implementation Patterns

#### View State Management
```typescript
// App.tsx manages view switching
const [currentView, setCurrentView] = useState<'mermaid' | 'editor' | 'document' | 'yang'>('mermaid')
// Header.tsx receives and updates view state
// Each view is a separate component in frontend/src/views/
```

#### ESM/CommonJS Compatibility
Backend uses ESM but some packages require special handling:
```javascript
// Required pattern for CommonJS packages
import markdownlintPkg from 'markdownlint'
const { markdownlint } = markdownlintPkg
```

#### Mermaid Integration
```javascript
// frontend/src/utils/mermaidInit.ts handles initialization
// Each view that renders Mermaid must call initializeMermaid()
// Theme preferences stored in localStorage
```

#### File Upload Flow
1. Multer middleware: 10MB limit, 10 files max (`backend/src/routes/files.js`)
2. Temporary storage in `uploads/` directory
3. Files processed in-memory, not permanently stored
4. Supported: `.md`, `.mmd`, `.mermaid`, `.yang`

#### Safari Compatibility
Server-side detection prevents React loading issues:
```javascript
// backend/src/server.js
// Safari users receive static HTML compatibility page
// Other browsers load full React application
```

## Key Dependencies and Versions

### Frontend Critical Packages
- `mermaid`: v11.4.1 (breaking changes from v10)
- `@uiw/react-codemirror`: Editor functionality
- `vite`: v6 (watch plugin compatibility)
- `eslint`: v9 (new config format in `eslint.config.js`)

### Backend Critical Packages
- `yang-js`: YANG parsing (replaced deprecated `node-yang`)
- `multer`: v2.0.2 for file uploads
- `express`: ESM module configuration

## Docker Build Configuration
- Multi-stage build optimized for ARM64
- Frontend build stage → static assets
- Production stage with non-root user
- Health checks on `/api/health`
- Volumes: `./uploads:/app/uploads`

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/files` - List uploaded files
- `POST /api/files/upload` - Upload files
- `POST /api/lint/markdown` - Lint Markdown content
- `POST /api/yang/parse` - Parse YANG models
- `GET /api/docs` - Swagger documentation

## Testing Strategy
- **Playwright E2E**: `frontend/tests/` directory
- **Component tests**: `frontend/src/__tests__/`
- **Known issues**: Some tests fail in CI but work in production
- **Safari testing**: Manual validation required

## Recent Changes (v2.5.0)
- Added Mermaid Editor feature with CodeMirror integration
- Fixed missing navigation integration in App.tsx
- Added required dependencies for editor functionality
- Updated TypeScript view state types