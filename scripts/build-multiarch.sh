#!/bin/bash
set -e

# Multi-Architecture Docker Build Script
# Builds images for both ARM64 (Apple Silicon) and AMD64 (Intel/AMD) architectures

echo "🚀 Starting multi-architecture build for Mermaid Desktop Tool..."

# Default image tag
IMAGE_TAG=${1:-"mermaid-yang-app:latest"}
DOCKERFILE=${2:-"docker/Dockerfile"}
PUSH=${3:-"false"}

echo "📋 Build Configuration:"
echo "   - Image Tag: $IMAGE_TAG"
echo "   - Dockerfile: $DOCKERFILE"
echo "   - Push to Registry: $PUSH"
echo "   - Target Platforms: linux/amd64,linux/arm64"

# Ensure buildx is available
echo "🔧 Verifying Docker buildx..."
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx is not available. Please install Docker Desktop or enable buildx."
    exit 1
fi

# Create or use existing builder
BUILDER_NAME="multiarch-builder"
echo "🏗️  Setting up buildx builder: $BUILDER_NAME"

if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
    echo "   Creating new builder: $BUILDER_NAME"
    docker buildx create --name "$BUILDER_NAME" --use
else
    echo "   Using existing builder: $BUILDER_NAME"
    docker buildx use "$BUILDER_NAME"
fi

# Inspect builder to ensure it supports required platforms
echo "🔍 Verifying builder supports required platforms..."
if ! docker buildx inspect --bootstrap | grep -E "linux/amd64|linux/arm64" > /dev/null; then
    echo "❌ Builder does not support required platforms (linux/amd64, linux/arm64)"
    exit 1
fi

# Build command with conditional push
BUILD_CMD="docker buildx build --platform linux/amd64,linux/arm64 -f $DOCKERFILE -t $IMAGE_TAG ."

if [ "$PUSH" = "true" ]; then
    echo "📤 Building and pushing multi-architecture images..."
    BUILD_CMD="$BUILD_CMD --push"
else
    echo "🔨 Building multi-architecture images (cache only)..."
    echo "   Note: Multi-arch builds cannot be loaded locally, stored in build cache"
fi

echo "🚀 Executing: $BUILD_CMD"
eval $BUILD_CMD

if [ $? -eq 0 ]; then
    echo "✅ Multi-architecture build completed successfully!"
    echo ""
    echo "📊 Build Summary:"
    echo "   - Platforms: linux/amd64, linux/arm64"
    echo "   - Image: $IMAGE_TAG"
    echo "   - Status: $([ "$PUSH" = "true" ] && echo "Pushed to registry" || echo "Built locally")"
    echo ""
    echo "🏃 To run the image:"
    echo "   docker run -p 3000:3000 $IMAGE_TAG"
else
    echo "❌ Multi-architecture build failed!"
    exit 1
fi