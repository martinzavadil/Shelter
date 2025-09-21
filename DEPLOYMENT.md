# Deployment Guide - Shelty

## Quick Deploy to Vercel (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/shelty)

## Manual Deployment Steps

### 1. Prerequisites

- Node.js 20+ installed
- Git repository with your code
- PostgreSQL database (Supabase recommended)
- Vercel account

### 2. Database Setup (Supabase)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Get Database URL:**
   - In Supabase dashboard → Settings → Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 3. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts to link your project
```

#### Option B: GitHub Integration
1. Connect your GitHub repo to Vercel
2. Import project in Vercel dashboard
3. Configure environment variables (see below)
4. Deploy

### 4. Environment Variables

Set these in your Vercel dashboard (Settings → Environment Variables):

```env
# Required
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-secure-random-string-here
NEXTAUTH_URL=https://your-app.vercel.app

# Optional (for enhanced features)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_STORAGE_BUCKET=shelter-photos
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Database Migration & Seeding

After deployment, run these commands locally (pointing to production DB):

```bash
# Set production DATABASE_URL in your terminal
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Push schema to production
npx prisma db push

# Seed with sample data
npx prisma db seed
```

Or run in Vercel Functions (create a temporary API endpoint):

```javascript
// pages/api/setup.js (temporary)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Run your seed script here
    // Delete this endpoint after use
  }
}
```

### 6. Post-Deployment Verification

1. **Check Homepage:** Visit your deployed URL
2. **Test Database:** Try the map page - should show shelters
3. **Test Search:** Search for "Matterhorn" - should find 1 result
4. **Test Emergency:** Visit `/emergency` - should load
5. **Test Auth:** Try login/register pages

### 7. Custom Domain (Optional)

1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain
4. Update any hardcoded URLs in your app

## Production Considerations

### Performance
- Vercel automatically handles caching and CDN
- Database connection pooling via Prisma
- Images optimized via Next.js Image component

### Security
- HTTPS enforced by default
- Environment variables secured
- CSRF protection via NextAuth
- Input validation on all forms

### Monitoring
- Vercel Analytics (optional)
- Vercel Functions logs
- Database monitoring via Supabase

### Scaling
- Vercel auto-scales based on demand
- Database scaling via Supabase plans
- Consider Redis for session storage at scale

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify Supabase project is active
   - Check IP allowlist in Supabase

2. **Build Failures**
   - Ensure all dependencies in package.json
   - Check TypeScript errors locally first
   - Verify Node.js version compatibility

3. **NextAuth Errors**
   - Ensure NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches deployment URL
   - Verify callback URLs in auth providers

4. **Missing Shelters**
   - Run database seed command
   - Check database connection
   - Verify schema was pushed correctly

### Debug Commands

```bash
# Check local build
npm run build

# Test production build locally
npm run start

# Check database connection
npx prisma db pull

# View database in browser
npx prisma studio
```

## Manual Testing Checklist

After deployment, test these core features:

- [ ] Homepage loads
- [ ] Map displays with markers
- [ ] Search works (try "Matterhorn")
- [ ] Shelter detail pages load
- [ ] Emergency finder loads
- [ ] Trip builder loads
- [ ] Login/register pages work
- [ ] 404 pages work
- [ ] Mobile responsive design

## Rollback Plan

If deployment fails:

1. **Revert to Previous Version:**
   ```bash
   vercel rollback
   ```

2. **Database Issues:**
   - Keep backups before major migrations
   - Use Supabase point-in-time recovery if needed

3. **Environment Issues:**
   - Double-check all environment variables
   - Compare with working local setup

---

## Support

For deployment issues:
- Check [Vercel documentation](https://vercel.com/docs)
- Check [Supabase documentation](https://supabase.com/docs)
- Review application logs in Vercel dashboard