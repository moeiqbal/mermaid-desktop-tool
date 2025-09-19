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

## Release Notes

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
- Docker installed on your system
- ARM-based Mac (Apple Silicon) or compatible ARM64 system

### Run the Application

```bash
# Clone or navigate to the project directory
cd mermaid-desktop-tool

# Build and run in production mode
docker build -t mermaid-yang-app -f docker/Dockerfile .
docker run -p 3000:3000 -v $(pwd)/uploads:/app/uploads mermaid-yang-app
```

Open your browser to [http://localhost:3000](http://localhost:3000)

### Development Mode

```bash
# Run with hot-reloading for development
docker-compose up dev --build
```

This will start:
- Backend API server on port 3000
- Frontend dev server on port 5173 (with hot-reloading)

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

1. **Port Already in Use**
   ```bash
   # Change the port in docker-compose.yml or kill existing processes
   lsof -ti:3000 | xargs kill
   ```

2. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify file extensions are supported
   - Ensure `uploads/` directory has write permissions

3. **ARM Architecture Issues**
   ```bash
   # Force ARM64 platform
   docker build --platform linux/arm64 -t mermaid-yang-app .
   ```

4. **Hot-Reload Not Working**
   - Ensure volume mounts are correct in `docker-compose.yml`
   - Check that both frontend and backend are running in dev mode

5. **HTML Export Issues**
   - Ensure browser allows file downloads
   - Check console for JavaScript errors
   - Verify Mermaid diagrams are valid before export

6. **YANG Parsing Errors**
   - Check YANG syntax using the error panel
   - Verify file encoding (UTF-8 recommended)
   - Review error details for specific line numbers and suggestions

## License

MIT License - see project specifications for full details.

## Support

This is a local development tool. For issues:
1. Check the Docker logs: `docker-compose logs`
2. Verify file permissions on the `uploads/` directory
3. Ensure ARM64 compatibility for your system