# Mermaid & YANG Model Visualization Tool

A powerful web application for visualizing and managing Mermaid diagrams, Markdown files, and YANG models. Built with React, Node.js, and optimized for ARM architecture (Apple Silicon).

![Version](https://img.shields.io/badge/version-2.5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Platform](https://img.shields.io/badge/platform-ARM64%20%7C%20AMD64-orange)

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/moeiqbal/mermaid-desktop-tool.git
cd mermaid-desktop-tool

# Start the application
docker-compose up -d app

# Access at http://localhost:3000
```

### Local Development
```bash
# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev

# Backend (http://localhost:3000)
cd backend && npm install && npm run dev
```

## ✨ Features

### 🎨 **Mermaid Viewer**
- Upload and organize Markdown/Mermaid files
- Support for all Mermaid diagram types
- Interactive pan, zoom, and fullscreen controls
- Export to PNG, SVG, and PDF formats

### ✏️ **Mermaid Editor** (New in v2.5.0)
- Live split-pane editor with syntax highlighting
- Real-time preview and error detection
- CodeMirror-powered editing experience
- Export capabilities with theme selection

### 📄 **Document View**
- Render Markdown with inline Mermaid diagrams
- Multiple theme options (Tailwind, GitHub, Custom)
- Export to standalone HTML files
- Print-optimized formatting

### 🔧 **YANG Explorer**
- Parse and visualize YANG models
- Interactive tree navigation
- Dependency tracking and analysis
- Comprehensive error reporting

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite 6, TailwindCSS
- **Backend**: Node.js 18+, Express (ESM), Multer
- **Diagram Engine**: Mermaid.js 11.4
- **Editor**: CodeMirror 6
- **Container**: Docker with multi-arch support (ARM64/AMD64)
- **Testing**: Playwright, Vitest

## 📦 Installation

### Prerequisites
- Docker Desktop 4.0+ or Docker Engine 20.10+
- Node.js 18+ (for local development)
- 4GB RAM minimum (8GB recommended)

### Docker Deployment
```bash
# Production build
docker-compose up -d app

# Development with hot-reload
docker-compose up -d dev

# View logs
docker-compose logs -f app

# Stop application
docker-compose down
```

### Building from Source
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Build frontend
cd frontend && npm run build

# Start production server
cd ../backend && NODE_ENV=production node src/server.js
```

## 🔗 API Documentation

The application provides a RESTful API with Swagger documentation:

- **Base URL**: `http://localhost:3000/api`
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/health`

Key endpoints:
- `GET /api/files` - List uploaded files
- `POST /api/files/upload` - Upload files
- `POST /api/lint/markdown` - Lint Markdown content
- `POST /api/yang/parse` - Parse YANG models

## 🧪 Testing

```bash
# Run all tests
cd frontend && npm test

# Run specific test
npx playwright test tests/specific-test.spec.ts

# Interactive test UI
npm run test:ui
```

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Recommended |
| Firefox | ✅ Full | Fully supported |
| Safari | ⚠️ Limited | Compatibility page shown |

## 📝 Configuration

### Environment Variables
```bash
NODE_ENV=production|development
PORT=3000                    # Backend port
VITE_PORT=5173              # Frontend dev port
```

### File Limits
- Maximum file size: 10MB per file
- Maximum files per upload: 10
- Supported formats: `.md`, `.mmd`, `.mermaid`, `.yang`

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the `develop` branch.

### Development Workflow
1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

### Common Issues

**Docker build fails on ARM Mac**
```bash
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap
```

**Port already in use**
```bash
lsof -ti:3000 | xargs kill -9
```

**Browser cache issues**
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Try incognito/private browsing mode

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/moeiqbal/mermaid-desktop-tool/issues)
- **Documentation**: [Project Wiki](https://github.com/moeiqbal/mermaid-desktop-tool/wiki)

## 🙏 Acknowledgments

- [Mermaid.js](https://mermaid.js.org/) for diagram rendering
- [CodeMirror](https://codemirror.net/) for the editor
- [yang-js](https://github.com/saintkepha/yang-js) for YANG parsing
- All contributors and users of this project

---

**Latest Release**: v2.5.0 | [View Changelog](./CHANGELOG.md) | [View All Releases](https://github.com/moeiqbal/mermaid-desktop-tool/releases)