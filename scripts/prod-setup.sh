#!/bin/bash

# Production Setup Script
# This script switches to production configuration

echo "🚀 Setting up production environment..."

# Switch to main branch
if [[ $(git branch --show-current) != "main" ]]; then
    echo "⚠️  Switching to main branch..."
    git checkout main
fi

# Production uses .env (not .env.dev) and no .env.local override
echo "📝 Production environment uses .env file"
echo "   (Convex deployment: https://shocking-owl-592.convex.cloud)"

echo "✅ Production environment ready!"
echo ""
echo "To deploy to production:"
echo "  npx convex deploy          # Deploy Convex functions"
echo "  vercel --prod              # Deploy frontend to Vercel"
echo ""
echo "To switch back to development:"
echo "  ./scripts/dev-setup.sh     # Return to dev setup"
