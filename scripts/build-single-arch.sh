#!/bin/bash
set -e

# Single-Architecture Docker Build Script
# Builds images for a specific architecture that can be loaded locally

echo "🚀 Starting single-architecture build for Mermaid Desktop Tool..."

# Parse arguments
ARCH=${1:-"auto"}
IMAGE_TAG=${2:-"mermaid-yang-app:latest"}
DOCKERFILE=${3:-"docker/Dockerfile"}

# Determine architecture
if [ "$ARCH" = "auto" ]; then
    if [[ $(uname -m) == "arm64" ]]; then
        PLATFORM="linux/arm64"
        ARCH_SUFFIX="arm64"
        echo "🔍 Auto-detected: ARM64 (Apple Silicon)"
    else
        PLATFORM="linux/amd64"
        ARCH_SUFFIX="amd64"
        echo "🔍 Auto-detected: AMD64 (Intel/AMD)"
    fi
elif [ "$ARCH" = "arm64" ]; then
    PLATFORM="linux/arm64"
    ARCH_SUFFIX="arm64"
    echo "🍎 Building for ARM64 (Apple Silicon)"
elif [ "$ARCH" = "amd64" ]; then
    PLATFORM="linux/amd64"
    ARCH_SUFFIX="amd64"
    echo "💻 Building for AMD64 (Intel/AMD)"
else
    echo "❌ Invalid architecture: $ARCH"
    echo "Usage: $0 [auto|arm64|amd64] [image-tag] [dockerfile]"
    exit 1
fi

# Add architecture suffix to image tag if it doesn't already have one
if [[ ! "$IMAGE_TAG" =~ :(arm64|amd64)$ ]]; then
    IMAGE_TAG="${IMAGE_TAG%:*}:${ARCH_SUFFIX}"
fi

echo "📋 Build Configuration:"
echo "   - Platform: $PLATFORM"
echo "   - Image Tag: $IMAGE_TAG"
echo "   - Dockerfile: $DOCKERFILE"

# Build single architecture image
echo "🔨 Building single-architecture image..."
BUILD_CMD="docker buildx build --platform $PLATFORM -f $DOCKERFILE -t $IMAGE_TAG --load ."

echo "🚀 Executing: $BUILD_CMD"
eval $BUILD_CMD

if [ $? -eq 0 ]; then
    echo "✅ Single-architecture build completed successfully!"
    echo ""
    echo "📊 Build Summary:"
    echo "   - Platform: $PLATFORM"
    echo "   - Image: $IMAGE_TAG"
    echo "   - Status: Loaded locally"
    echo ""
    echo "🏃 To run the image:"
    echo "   docker run -p 3000:3000 -v \$(pwd)/uploads:/app/uploads $IMAGE_TAG"
    echo ""
    echo "🔍 To inspect the image:"
    echo "   docker images | grep ${IMAGE_TAG%:*}"
else
    echo "❌ Single-architecture build failed!"
    exit 1
fi