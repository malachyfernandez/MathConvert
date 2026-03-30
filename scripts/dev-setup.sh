#!/bin/bash

# Development Setup Script
# This script sets up the development environment correctly

echo "🔧 Setting up development environment..."

# Check if we're on dev branch
if [[ $(git branch --show-current) != "dev" ]]; then
    echo "⚠️  Switching to dev branch..."
    git checkout dev
fi

# Copy development environment files
echo "📝 Setting up development environment variables..."
cp .env.dev .env
cp .env.local.dev .env.local

# Start Convex dev server if not running
if ! pgrep -f "convex dev" > /dev/null; then
    echo "🚀 Starting Convex dev server..."
    npx convex dev &
    sleep 3
fi

echo "✅ Development environment ready!"
echo ""
echo "To start development:"
echo "  npx expo --web          # Start web development server"
echo "  npx convex dev          # Start Convex backend (if not running)"
echo ""
echo "To switch to production:"
echo "  git checkout main       # Switch to production branch"
echo "  # Production uses different .env files automatically"
