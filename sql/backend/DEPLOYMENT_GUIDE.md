# Deployment Fix - Schema Loading Issue

## What Was Fixed

### Problem
- Vercel deployment failed because `docs/` and `*.md` files were excluded by `.vercelignore`
- The build script couldn't access `DATABASE_SCHEMA.md` during deployment

### Solution
1. **Updated `.vercelignore`** - Removed `docs` and `scripts` exclusions (needed for build)
2. **Enhanced build script** - Added better error handling and directory creation
3. **Build-time schema generation** - Schema is now embedded at build time

## Files Changed
- ✅ `.vercelignore` - Allow docs/ and scripts/ during build
- ✅ `scripts/generate-schema-constant.js` - More robust error handling
- ✅ `package.json` - Build scripts configured
- ✅ `api/lib/ai-service.ts` - Uses generated constant
- ✅ `api/lib/generated-schema.ts` - Auto-generated (15KB)

## Deploy to Vercel

### Option 1: Git Push (Recommended)
```bash
git add .
git commit -m "Fix: Embed DATABASE_SCHEMA.md for Vercel deployment"
git push
```
Vercel will auto-deploy if connected to your Git repo.

### Option 2: Manual Deploy
```bash
vercel --prod
```

## Verify Deployment
After deployment, test with:
```
POST https://your-app.vercel.app/api/query
{
  "question": "show me occupied plot at Astana Tegal Gundul cemetery"
}
```

Should work without "ENOENT" errors!
