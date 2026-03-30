#!/bin/bash

# Verification Script
# Checks that the current environment is properly configured

echo "🔍 Verifying setup..."

# Check branch
BRANCH=$(git branch --show-current)
echo "📂 Branch: $BRANCH"

# Check environment files
if [[ -f ".env" ]]; then
    echo "✅ .env exists"
    CLERK_KEY=$(grep EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY .env | cut -d'=' -f2)
    if [[ $CLERK_KEY == pk_test_* ]]; then
        echo "✅ Using development Clerk key"
    elif [[ $CLERK_KEY == pk_live_* ]]; then
        echo "✅ Using production Clerk key"
    else
        echo "⚠️  Unknown Clerk key format"
    fi
else
    echo "❌ .env missing"
fi

if [[ -f ".env.local" ]]; then
    echo "✅ .env.local exists"
    CONVEX_URL=$(grep EXPO_PUBLIC_CONVEX_URL .env.local | cut -d'=' -f2)
    echo "🌐 Convex URL: $CONVEX_URL"
else
    echo "⚠️  .env.local missing (ok for production)"
fi

# Check Convex status
if pgrep -f "convex dev" > /dev/null; then
    echo "✅ Convex dev server running"
else
    echo "⚠️  Convex dev server not running"
fi

# Check web server
if curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Web server accessible"
else
    echo "⚠️  Web server not running"
fi

echo ""
echo "📋 Summary:"
if [[ $BRANCH == "dev" ]]; then
    echo "  Development mode - use 'npx expo --web' to start"
elif [[ $BRANCH == "main" ]]; then
    echo "  Production mode - use 'vercel --prod' to deploy"
else
    echo "  Unknown branch - check configuration"
fi
