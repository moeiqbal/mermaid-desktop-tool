# Deployment Guide - Mermaid & YANG Visualization Tool

## Overview

This guide provides comprehensive instructions for deploying the Mermaid & YANG Visualization Tool in various environments, from local development to production Docker deployments on ARM-based systems.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Performance Tuning](#performance-tuning)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Operating System**: macOS (ARM64), Linux (x86_64/ARM64), Windows (WSL2 recommended)
- **Docker**: Docker Desktop 4.0+ or Docker Engine 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 18+ (for local development)
- **Memory**: Minimum 4GB RAM, 8GB+ recommended
- **Storage**: 2GB free space minimum, 10GB+ recommended for file uploads

### Development Requirements
```bash
node --version    # v18.0.0+
npm --version     # v9.0.0+
docker --version  # 20.10.0+
docker compose version  # v2.0.0+
```

## Local Development Setup

### 1. Clone and Setup
```bash
git clone <repository-url>
cd mermaid-desktop-tool

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Environment Configuration
Create environment files:

**`.env.development`**:
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

**`frontend/.env.local`**:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=Mermaid & YANG Visualizer
```

### 3. Development Server
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## Docker Deployment

### Development with Docker Compose

**Quick Start:**
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml Configuration:**
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3001

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=development
      - PORT=3001
      - CORS_ORIGIN=http://localhost:3000
```

### Production Docker Build

**Single Container Production Build:**
```bash
# Build production image
docker build -t mermaid-yang-app .

# Run production container
docker run -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -e NODE_ENV=production \
  mermaid-yang-app
```

**Multi-stage Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built applications
COPY --from=builder /app/frontend/dist ./public
COPY --from=builder /app/backend ./

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node uploads

# Use non-root user
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
```

## Production Deployment

### 1. Environment Setup

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info

# Security
SESSION_SECRET=your-secure-session-secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Performance
NODE_OPTIONS="--max-old-space-size=2048"
UV_THREADPOOL_SIZE=8
```

### 2. Docker Compose Production

**docker-compose.prod.yml:**
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - uploads-data:/app/uploads
      - logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - uploads-data:/usr/share/nginx/html/uploads
    depends_on:
      - app
    restart: unless-stopped

volumes:
  uploads-data:
  logs:
```

### 3. Nginx Configuration

**nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # File upload limits
        client_max_body_size 10M;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /uploads/ {
            alias /usr/share/nginx/html/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Environment Configuration

### Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| NODE_ENV | development | production |
| Logging | debug/verbose | info/warn/error |
| File Size Limit | 10MB | 10MB (configurable) |
| CORS | localhost:3000 | your-domain.com |
| SSL | disabled | required |
| Compression | disabled | enabled |
| Caching | disabled | aggressive |

### Security Configuration

**Production Security Checklist:**
- [ ] SSL/TLS certificates configured
- [ ] CORS properly configured for production domain
- [ ] File upload validation and limits in place
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Non-root user in Docker containers
- [ ] Secrets management (environment variables)
- [ ] Regular dependency updates

## Performance Tuning

### Node.js Optimization

**Memory Configuration:**
```bash
# Increase heap size for large files
export NODE_OPTIONS="--max-old-space-size=2048"

# Optimize garbage collection
export NODE_OPTIONS="--max-old-space-size=2048 --gc-interval=100"
```

**Concurrency Optimization:**
```bash
# Increase UV thread pool size for file operations
export UV_THREADPOOL_SIZE=8
```

### Docker Performance

**Docker Build Optimization:**
```dockerfile
# Use multi-stage builds to reduce image size
# Leverage build cache with proper layer ordering
# Use .dockerignore to exclude unnecessary files
```

**Container Resource Limits:**
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Frontend Performance

**Build Optimization:**
- Code splitting enabled in Vite configuration
- Tree shaking for unused dependencies
- Asset optimization and compression
- Service worker for caching (optional)

**Runtime Performance:**
- React.memo for expensive components
- useMemo for expensive computations
- Debounced search inputs
- Virtual scrolling for large lists (implemented)
- Lazy loading of components

## Monitoring & Maintenance

### Health Checks

**Application Health Endpoint:**
```bash
curl http://localhost:3000/api/health
```

**Docker Health Checks:**
```bash
docker ps  # Check container status
docker logs container_name  # View logs
docker exec -it container_name sh  # Debug container
```

### Log Management

**Production Logging:**
- Use structured logging (JSON format)
- Log rotation to prevent disk space issues
- Centralized logging with tools like ELK stack
- Error tracking with services like Sentry

**Log Locations:**
- Container logs: `docker logs <container_name>`
- Application logs: `/app/logs/` (if configured)
- Nginx logs: `/var/log/nginx/`

### Backup Strategy

**File Uploads:**
```bash
# Backup uploads directory
docker run --rm -v mermaid-yang_uploads-data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

**Configuration:**
- Version control for configuration files
- Environment variable documentation
- Docker image versioning strategy

### Updates and Maintenance

**Application Updates:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Verify health
curl http://localhost:3000/api/health
```

**Dependency Updates:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs app

# Common causes:
# - Port already in use
# - Environment variables missing
# - Volume mount issues
# - Dependency installation failures
```

#### 2. File Upload Issues
```bash
# Check upload directory permissions
docker exec -it container_name ls -la /app/uploads

# Verify file size limits
curl -F "files=@large-file.md" http://localhost:3000/api/files/upload
```

#### 3. Performance Issues
```bash
# Monitor resource usage
docker stats

# Check memory usage
docker exec -it container_name cat /proc/meminfo

# Monitor application logs
docker logs -f container_name
```

#### 4. Network Connectivity
```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/files

# Check Docker networking
docker network ls
docker network inspect bridge
```

### Debug Mode

**Enable Debug Logging:**
```bash
# Development
DEBUG=app:* npm run dev

# Docker
docker-compose up --build
docker-compose logs -f
```

**Application Debug Information:**
- Browser Developer Tools for frontend issues
- Network tab for API request inspection
- Console logs for JavaScript errors
- Backend logs for server-side issues

### Performance Debugging

**Frontend Performance:**
- React Developer Tools Profiler
- Chrome DevTools Performance tab
- Lighthouse audits
- Bundle analyzer for build optimization

**Backend Performance:**
- Node.js built-in profiler
- Memory usage monitoring
- API response time analysis
- Database query performance (if applicable)

## Quick Reference

### Essential Commands
```bash
# Development
npm run dev                    # Start development server
docker-compose up --build      # Start with Docker

# Production
docker build -t app .          # Build production image
docker run -p 3000:3000 app    # Run production container

# Maintenance
docker-compose logs -f         # View logs
docker exec -it container sh   # Access container
docker system prune            # Clean up Docker resources
```

### Port Reference
| Service | Development | Production |
|---------|-------------|------------|
| Frontend | 3000 | 80/443 (via Nginx) |
| Backend | 3001 | 3000 (internal) |
| API | /api/* | /api/* |

### File Locations
| Component | Location |
|-----------|----------|
| Frontend Build | `/frontend/dist` |
| Backend Source | `/backend/src` |
| File Uploads | `/uploads` |
| Configuration | `/` (root) |
| Logs | `/app/logs` (production) |

---

## Support

For additional support:
1. Check application logs for specific error messages
2. Verify environment configuration
3. Test with minimal configuration
4. Consult Docker documentation for container issues
5. Review Node.js documentation for application errors

This deployment guide provides a foundation for successfully deploying the Mermaid & YANG Visualization Tool in various environments while maintaining security, performance, and reliability standards.