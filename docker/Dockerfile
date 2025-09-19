# Multi-stage build supporting both ARM64 and AMD64 architectures
FROM --platform=$BUILDPLATFORM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
FROM base AS deps
RUN cd frontend && npm ci --omit=dev
RUN cd backend && npm ci --omit=dev

# Build frontend
FROM base AS frontend-builder
COPY frontend/ ./frontend/
RUN cd frontend && npm ci
RUN cd frontend && npm run build

# Production image - automatically uses target platform (linux/amd64 or linux/arm64)
FROM node:18-alpine AS runner

# Build arguments for cross-compilation awareness
ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy backend dependencies
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --chown=nextjs:nodejs backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/server.js"]