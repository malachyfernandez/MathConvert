# Development Workflow Guide

This project uses separate branches and configurations for development and production.

## Quick Start

### Development
```bash
./scripts/dev-setup.sh    # Sets up dev environment
npx expo --web           # Start web dev server
```

### Production
```bash
./scripts/prod-setup.sh   # Switch to production config
npx convex deploy        # Deploy Convex functions
vercel --prod            # Deploy to Vercel
```

## Branch Strategy

- **`dev` branch**: Development environment
  - Uses `.env.dev` and `.env.local.dev`
  - Convex dev deployment: `https://rare-puffin-639.convex.cloud`
  - Clerk development key: `pk_test_Y2xlcmsuYWNjb3VudHMuZGV2JA`

- **`main` branch**: Production environment
  - Uses `.env` (production values)
  - Convex production: `https://shocking-owl-592.convex.cloud`
  - Clerk production key: `pk_live_Y2xlcmsucGFwZXIubWFsYWNoeWYuY29tJA`

## Environment Files

| File | Purpose | Branch |
|------|---------|--------|
| `.env.dev` | Development variables | dev |
| `.env.local.dev` | Development Convex override | dev |
| `.env` | Production variables | main |
| `.env.local` | Local overrides (gitignored) | both |

## Daily Workflow

### 1. Start Development
```bash
git checkout dev
./scripts/dev-setup.sh
npx expo --web
```

### 2. Make Changes
- Edit code
- Test locally
- Commit to dev branch

### 3. Deploy to Production
```bash
# Merge changes to main
git checkout main
git merge dev

# Deploy
./scripts/prod-setup.sh
npx convex deploy
vercel --prod

# Push main
git push origin main
```

## Troubleshooting

### Clerk Errors
- Development: Use `pk_test_` keys
- Production: Use `pk_live_` keys
- Check `convex/auth.config.ts` trusts the right domains

### Convex Issues
- Dev: `npx convex dev` (auto-creates dev deployment)
- Prod: `npx convex deploy` (uses production deployment)

### Environment Variables
- Never commit real keys to git
- Use Vercel dashboard for production env vars
- Use `npx convex env set` for Convex env vars

## Testing

After any setup change:
1. Web server loads at `http://localhost:8081`
2. Clerk authentication works
3. Convex queries/mutations work
4. No console errors

## Pushing Changes

```bash
# Development changes
git checkout dev
git add .
git commit -m "feat: new feature"
git push origin dev

# Production deployment
git checkout main
git merge dev
./scripts/prod-setup.sh
npx convex deploy
vercel --prod
git push origin main
```
