# Mermaid & YANG Model Visualization Web Application

A locally hosted web application for visualizing and managing Mermaid diagrams, Markdown files, and YANG models. Built with React, Node.js, and optimized for ARM architecture (Apple Silicon).

## Features

### 🎨 Mermaid Diagram Viewer
- **File Management**: Upload and organize Markdown and Mermaid files
- **Full Diagram Support**: All Mermaid diagram types (flowchart, sequence, class, state, etc.)
- **Interactive Controls**: Pan, zoom, export (PNG/SVG/PDF), fullscreen mode
- **HTML Export**: Export Markdown files with embedded diagrams to standalone HTML with 3 CSS styling options
- **Premium UI**: Dark mode default with smooth animations

### 🔍 Markdown/Mermaid Linting
- **Smart Linting**: Markdown validation using markdownlint
- **Mermaid Syntax Check**: Real-time validation of diagram syntax
- **Auto-fix**: Automatic correction of common issues
- **Detailed Feedback**: Line-by-line error reporting with suggested fixes

### ⚡ YANG Model Explorer
- **Model Parsing**: Upload single files, multiple files, or entire folders
- **Tree Visualization**: Interactive hierarchy with expandable nodes
- **Dependency Tracking**: Visual representation of module relationships
- **Error Handling**: Comprehensive error panel showing parse failures, line numbers, and severity levels
- **Export Options**: JSON and tree diagram export

## Recent Feature Updates

### 🆕 HTML Export (v2.1)
Export your Markdown documents with embedded Mermaid diagrams to standalone HTML files:
- **Three CSS Styling Options**:
  - Tailwind CSS (Modern utility-first framework styling)
  - GitHub Style (GitHub-like Markdown rendering)
  - Custom Theme (Enhanced typography with dark/light mode support)
- **Interactive Diagrams**: Mermaid diagrams remain fully interactive in exported HTML
- **Offline Ready**: Exported HTML files work offline (requires internet for initial diagram rendering)
- **Print Friendly**: Optimized styling for printing
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🛠️ Enhanced Error Handling (v2.1)
- **YANG Error Panel**: Dedicated component for displaying parse failures
  - Line numbers and severity levels (error, warning, info)
  - Expandable/collapsible interface with troubleshooting tips
  - Copy errors to clipboard functionality
  - Color-coded error types for quick identification
- **Improved Close Button**: Smart navigation handling for different browser contexts
- **Fixed Export Functionality**: Reliable PNG/SVG export with proper state management

### 🌐 Safari Compatibility System (v2.2)
- **Server-side Browser Detection**: Identifies Safari browsers before React app loads
- **Professional Compatibility Page**: Clean, branded warning page instead of white screen/errors
- **Zero Console Errors**: Prevents SSL/connection issues that caused Safari failures
- **Universal Support**:
  - ✅ **Chrome, Firefox, Edge**: Full application access with all features
  - ⚠️ **Safari (Desktop/Mobile)**: Professional compatibility message with browser recommendations
- **User Experience**: Clear guidance to supported browsers with download links

## Release Notes

### Version 2.2.0 (2025-01-19)

🌐 **Safari Compatibility System**
- Server-side Safari browser detection preventing white screen issues
- Professional compatibility warning page with branded styling and browser recommendations
- Enhanced Content Security Policy configuration for Safari compatibility
- Zero console errors for Safari users with clean fallback experience
- Support matrix: Chrome/Firefox/Edge (full access), Safari (compatibility page)

🔧 **Production Improvements**
- Comprehensive test suite with 93 unit tests and 65 E2E tests
- Production deployment documentation and troubleshooting guides
- Enhanced Swagger API documentation with interactive endpoints
- Improved CSP and security middleware configuration

### Version 2.1.0 (2024-09-18)

🚀 **New Features**
- Document View Tab with inline diagram rendering and multi-theme support
- Multi-architecture Docker support (ARM64 + AMD64) with automated build scripts
- HTML Export System with 3 CSS theme options (Tailwind, GitHub, Custom)
- Interactive diagram controls with zoom, pan, and export functionality
- Version management system with automated incrementing and release note generation
- Documentation QA agent with comprehensive quality checking

🐛 **Bug Fixes**
- Fixed Safari compatibility issues with export functionality
- Resolved close button behavior in fullscreen diagram view
- Enhanced PNG/SVG export reliability with improved state management
- Fixed theme control visibility issues in Document View

📚 **Documentation**
- Complete API documentation update with endpoint specifications
- Enhanced troubleshooting guides with specific error scenarios
- Added comprehensive development workflow documentation
- Created automated documentation quality assurance system

🔧 **Technical Improvements**
- Implemented semantic versioning with git tag automation
- Enhanced error handling system with structured reporting
- Improved notification system integration across components
- Added comprehensive test coverage for v2.1 features

### Version 2.0.1 (2024-09-15)

🐛 **Bug Fixes**
- Fixed Docker build issues on ARM64 systems
- Resolved file upload size limitations
- Enhanced YANG parser error reporting

### Version 2.0.0 (2024-09-10)

🚀 **New Features**
- Initial YANG Model Explorer implementation
- Multi-file upload support with drag-and-drop
- Enhanced Mermaid diagram viewer with fullscreen mode
- Premium dark theme UI with smooth animations

⚠️ **Breaking Changes**
- Migrated from Vue.js to React framework
- Updated API endpoints structure
- Changed Docker configuration for ARM64 optimization

### Version 1.0.0 (2024-09-01)

🎉 **Initial Release**
- Basic Mermaid diagram rendering
- File upload and management
- Docker containerization
- Local web server implementation

---

**[View All Releases](docs/releases/)** | **[Version History](version-history.json)**

## Quick Start

### Prerequisites
- **Docker** (v20.10 or later) - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** (v2.0 or later) - Included with Docker Desktop
- **Supported Systems**:
  - ARM-based Mac (Apple Silicon M1/M2/M3)
  - AMD64/x86_64 systems (Intel/AMD processors)
  - Linux ARM64 and AMD64

### Production Mode (Recommended)

The simplest way to run the application in production mode:

```bash
# 1. Navigate to the project directory
cd mermaid-desktop-tool

# 2. Build and start the application
docker-compose up -d app

# 3. Verify the application is running
docker ps
```

**Access the application:**
- 🌐 Main Application: [http://localhost:3000](http://localhost:3000)
- 📝 API Documentation: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- 🩺 Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

**Stop the application:**
```bash
docker-compose down
```

### Alternative: Direct Docker Commands

If you prefer not to use docker-compose:

```bash
# Build the production image
docker build -t mermaid-yang-app:latest -f docker/Dockerfile .

# Run the container
docker run -d \
  --name mermaid-yang-app \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  mermaid-yang-app:latest

# View logs
docker logs -f mermaid-yang-app

# Stop the container
docker stop mermaid-yang-app
docker rm mermaid-yang-app
```

### Development Mode (Hot-Reloading)

For active development with automatic code reloading:

```bash
# Start development environment
docker-compose up dev --build

# Or run in detached mode
docker-compose up -d dev

# View logs
docker-compose logs -f dev
```

**Development access points:**
- Backend API: [http://localhost:3000](http://localhost:3000)
- Frontend Dev Server: [http://localhost:5173](http://localhost:5173)
- API Documentation: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] [YANG Explorer]           [Dark/Light] [Settings]│ <- Header (64px)
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  File    │                                              │
│  List    │            Main Content Area                 │ <- Main View
│  (320px) │         (Diagram/Editor/YANG View)           │   (calc(100vh-64px))
│          │                                              │
│  [+ Add] │                                              │
│  [Search]│     [Zoom Controls] [Export] [Fullscreen]    │
└──────────┴──────────────────────────────────────────────┘
```

## Project Structure

```
project-root/
├── docker/
│   ├── Dockerfile              # Production build
│   └── Dockerfile.dev          # Development with hot-reload
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── views/             # Page-level components
│   │   ├── utils/             # Helper functions
│   │   └── styles/            # Tailwind CSS configuration
│   └── package.json
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   └── package.json
├── uploads/                   # Temporary file storage
├── tasks.md                   # Development tracking
├── docker-compose.yml         # Multi-service orchestration
└── README.md                  # This file
```

## API Endpoints

### File Management
- `GET /api/files` - List uploaded files
- `POST /api/files/upload` - Upload files (supports .md, .mmd, .mermaid, .yang)
- `GET /api/files/:id/content` - Get file content
- `PUT /api/files/:id/content` - Update file content
- `DELETE /api/files/:id` - Delete file

### Linting
- `POST /api/lint/markdown` - Lint Markdown content
- `POST /api/lint/mermaid` - Validate Mermaid syntax
- `POST /api/lint/markdown/fix` - Auto-fix Markdown issues

### YANG Processing
- `POST /api/yang/parse` - Parse single YANG file with enhanced error reporting
- `POST /api/yang/parse-multiple` - Parse multiple YANG files with dependency analysis

### Health Check
- `GET /api/health` - Server status and uptime

## Development

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Containerization**: Docker (ARM64 optimized)
- **Libraries**:
  - Mermaid.js for diagram rendering
  - markdownlint for Markdown validation
  - Custom YANG parser (extensible for proper YANG libraries)

### Development Commands

```bash
# Frontend development
cd frontend
npm install
npm run dev        # Start Vite dev server

# Backend development
cd backend
npm install
npm run dev        # Start with nodemon

# Docker development
docker-compose up dev --build    # Both frontend + backend with hot-reload
```

### File Upload Limits
- Maximum file size: 10MB per file
- Maximum files per upload: 10
- Supported formats: `.md`, `.mmd`, `.mermaid`, `.yang`
- Files are stored temporarily in the `uploads/` directory

## Customization

### Styling
The application uses Tailwind CSS with a custom design system:
- **Colors**: Custom dark theme with premium gradients
- **Fonts**: Inter for UI, JetBrains Mono for code
- **Animations**: Smooth 300ms transitions throughout

### Adding New Features
1. Backend: Add routes in `backend/src/routes/`
2. Frontend: Add components in `frontend/src/components/`
3. Update the Docker configuration if needed
4. Test with hot-reloading in development mode

## Production Deployment

The application is designed for local use but can be deployed:

```bash
# Build production image
docker build -t mermaid-yang-app -f docker/Dockerfile .

# Run with volume mounts for persistent storage
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  mermaid-yang-app
```

## Troubleshooting

### Common Issues

#### 1. Docker Container Won't Start

**Problem:** Container fails to start or exits immediately
```bash
# Check container logs
docker logs mermaid-yang-app

# Check container status
docker ps -a

# Restart the container
docker-compose restart app
```

#### 2. Port Already in Use

**Problem:** Error: "port 3000 is already in use"
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
# ports:
#   - "3001:3000"  # Use port 3001 instead
```

#### 3. Application Shows White Screen

**Problem:** Browser shows blank/white screen

**Solutions:**
- Clear browser cache and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify container is running: `docker ps`
- Check container logs: `docker logs mermaid-yang-app`
- For Safari users: The app shows a compatibility warning (expected behavior)

#### 4. Clean Docker Installation

**Problem:** Issues with cached images or volumes
```bash
# Stop all containers
docker-compose down

# Remove all images and cache
docker system prune -af --volumes

# Rebuild from scratch
docker-compose build --no-cache app
docker-compose up -d app
```

#### 5. File Upload Issues

**Problem:** Cannot upload files or files disappear
- Maximum file size: 10MB per file
- Supported extensions: `.md`, `.mmd`, `.mermaid`, `.yang`
- Ensure `uploads/` directory exists and has write permissions
- Check container volume mount: `docker inspect mermaid-yang-app`

#### 6. API Endpoints Not Responding

**Problem:** API calls fail or return errors
```bash
# Test the health endpoint
curl http://localhost:3000/api/health

# Check if the container is healthy
docker inspect mermaid-yang-app --format='{{.State.Health.Status}}'

# View real-time logs
docker logs -f mermaid-yang-app
```

#### 7. Multi-Architecture Build Issues

**Problem:** Build fails on different architectures
```bash
# Check available platforms
docker buildx ls

# Create multi-arch builder (one-time setup)
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap

# Build for specific architecture
docker buildx build --platform linux/arm64 -t mermaid-yang-app:arm64 -f docker/Dockerfile --load .
docker buildx build --platform linux/amd64 -t mermaid-yang-app:amd64 -f docker/Dockerfile --load .
```

#### 8. Hot-Reload Not Working (Development Mode)

**Problem:** Code changes don't trigger automatic reload
- Verify volume mounts in `docker-compose.yml` are correct
- Check that you're using the `dev` service: `docker-compose up dev`
- Ensure both frontend and backend containers are running
- Review logs: `docker-compose logs -f dev`

#### 9. HTML Export Issues

**Problem:** Export to HTML fails or generates invalid files
- Ensure browser allows file downloads
- Check browser console (F12) for JavaScript errors
- Verify Mermaid diagrams are valid before export
- Test with a simple diagram first

#### 10. YANG Parsing Errors

**Problem:** YANG files fail to parse or show errors
- Check YANG syntax using the built-in error panel
- Verify file encoding is UTF-8
- Review error details for specific line numbers and suggestions
- Test with a simple YANG file first
- Ensure all imported modules are uploaded together

### Getting Help

If issues persist:
1. Check the Docker logs: `docker-compose logs app`
2. Verify system requirements are met
3. Ensure Docker and Docker Compose are up to date
4. Test with a fresh installation using the clean Docker installation steps above

## License

MIT License - see project specifications for full details.

## Support

This is a local development tool. For issues:
1. Check the Docker logs: `docker-compose logs`
2. Verify file permissions on the `uploads/` directory
3. Ensure ARM64 compatibility for your system