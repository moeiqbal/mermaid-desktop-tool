#!/bin/bash
set -e

# Development Multi-Architecture Docker Build Script
# Builds development images with hot-reloading support

echo "🚀 Starting development multi-architecture build..."

# Architecture selection
ARCH=${1:-"auto"}
IMAGE_TAG="mermaid-yang-app:dev"

if [ "$ARCH" = "auto" ]; then
    echo "🔍 Auto-detecting architecture..."
    if [[ $(uname -m) == "arm64" ]]; then
        PLATFORM="linux/arm64"
        echo "   Detected: ARM64 (Apple Silicon)"
    else
        PLATFORM="linux/amd64"
        echo "   Detected: AMD64 (Intel/AMD)"
    fi
elif [ "$ARCH" = "arm64" ]; then
    PLATFORM="linux/arm64"
    echo "🍎 Building for ARM64 (Apple Silicon)"
elif [ "$ARCH" = "amd64" ]; then
    PLATFORM="linux/amd64"
    echo "💻 Building for AMD64 (Intel/AMD)"
elif [ "$ARCH" = "both" ]; then
    PLATFORM="linux/amd64,linux/arm64"
    echo "🌐 Building for both architectures"
else
    echo "❌ Invalid architecture: $ARCH"
    echo "Usage: $0 [auto|arm64|amd64|both]"
    exit 1
fi

echo "📋 Development Build Configuration:"
echo "   - Image Tag: $IMAGE_TAG"
echo "   - Platform(s): $PLATFORM"
echo "   - Dockerfile: docker/Dockerfile.dev"

# Build development image
echo "🔨 Building development image..."
if [ "$ARCH" = "both" ]; then
    # Multi-arch build requires buildx
    docker buildx build \
        --platform "$PLATFORM" \
        -f docker/Dockerfile.dev \
        -t "$IMAGE_TAG" \
        --load \
        .
else
    # Single architecture build
    docker buildx build \
        --platform "$PLATFORM" \
        -f docker/Dockerfile.dev \
        -t "$IMAGE_TAG" \
        --load \
        .
fi

if [ $? -eq 0 ]; then
    echo "✅ Development build completed successfully!"
    echo ""
    echo "🏃 To start development environment:"
    echo "   docker-compose up dev"
    echo ""
    echo "📡 Development servers will be available at:"
    echo "   - Backend: http://localhost:3000"
    echo "   - Frontend: http://localhost:5173"
else
    echo "❌ Development build failed!"
    exit 1
fi