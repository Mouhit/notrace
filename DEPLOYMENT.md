# Deployment Guide

Complete guide to deploy Secrets by NoTrace to production.

## Deployment Architecture

```
GitHub Repository
       ↓
    Vercel (Frontend + API Routes)
       ↓
    Supabase (Database + Auth)
       ↓
    Vercel CDN & Edge Functions
```

## Prerequisites

- GitHub account with repository
- Vercel account
- Supabase project created and migrated
- Domain (secrets.notrace.co.in)

## Step 1: Prepare Repository

### 1.1 Clean up code

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Test build locally
npm run build
```

### 1.2 Set up GitHub repository

```bash
# Initialize if not already done
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/yourusername/secrets-by-notrace.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.3 Protect main branch

1. Go to GitHub repo → Settings → Branches
2. Add branch protection rule for `main`:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

## Step 2: Deploy to Vercel

### 2.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Click "Import"

### 2.2 Configure environment variables

On Vercel project settings:

1. Go to Settings → Environment Variables
2. Add variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=https://secrets.notrace.co.in
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key (optional)
```

### 2.3 Configure build settings

Vercel should auto-detect Next.js. Verify:

- **Framework:** Next.js
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Test deployment at `https://your-project.vercel.app`

## Step 3: Configure Custom Domain

### 3.1 Add domain to Vercel

1. Go to Vercel project → Settings → Domains
2. Click "Add"
3. Enter `secrets.notrace.co.in`
4. Select "External Domain"
5. Note the DNS records to add

### 3.2 Update DNS records

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Add CNAME record:
   - **Name:** `secrets`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** 3600

2. Add TXT record (for verification):
   - **Name:** `_vercel`
   - **Value:** (provided by Vercel)
   - **TTL:** 3600

3. Wait for DNS propagation (5-30 minutes)

### 3.3 Enable HTTPS

Vercel auto-provides SSL via Let's Encrypt. Should be enabled within minutes.

## Step 4: Supabase Configuration

### 4.1 Configure CORS

In Supabase Dashboard:

1. Go to Settings → API
2. Add to allowed origins:
   - `https://secrets.notrace.co.in`
   - `https://www.secrets.notrace.co.in`
   - `https://*.vercel.app` (for preview deployments)

### 4.2 Enable RLS

All tables should have RLS enabled. Verify:

```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

Should return `true` for `rowsecurity`.

### 4.3 Set up database backups

1. Go to Project Settings → Backups
2. Set backup frequency to **Daily**
3. Set backup retention to **7 days** (minimum)

## Step 5: Post-Deployment Testing

### 5.1 Health checks

```bash
# Test homepage
curl https://secrets.notrace.co.in

# Test API
curl https://secrets.notrace.co.in/api/health

# Check HTTPS
curl -I https://secrets.notrace.co.in
```

### 5.2 Functional testing

1. Create a test message:
   - Visit homepage
   - Create message
   - Copy link
   - Open in new tab
   - Verify decryption works

2. Test password protection:
   - Create message with password
   - Try wrong password (should fail)
   - Enter correct password (should work)

3. Test scheduled messages:
   - Create message scheduled for 1 minute from now
   - Try to access immediately (should show countdown)
   - Wait and try again (should decrypt)

4. Test self-destruct:
   - Create message
   - Verify countdown
   - Wait for message to self-destruct
   - Verify "destroyed" state

### 5.3 Performance testing

```bash
# Test homepage load time
curl -w "Time taken: %{time_total}s\n" \
  https://secrets.notrace.co.in

# Test API latency
curl -w "Time taken: %{time_total}s\n" \
  https://secrets.notrace.co.in/api/messages/create
```

### 5.4 Security testing

1. **CORS headers:**
   ```bash
   curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     https://secrets.notrace.co.in/api/messages/create
   ```

2. **Content Security Policy:**
   ```bash
   curl -I https://secrets.notrace.co.in | grep "Content-Security-Policy"
   ```

3. **Security headers:**
   ```bash
   curl -I https://secrets.notrace.co.in | grep -E "X-Frame-Options|X-Content-Type-Options|X-XSS-Protection"
   ```

## Step 6: Monitoring & Analytics

### 6.1 Set up Vercel Analytics

1. Go to Vercel project → Settings → Analytics
2. Enable Web Analytics
3. Install analytics package:
   ```bash
   npm install @vercel/analytics/react
   ```

4. Add to `pages/_app.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function App({ Component, pageProps }) {
     return (
       <>
         <Component {...pageProps} />
         <Analytics />
       </>
     );
   }
   ```

### 6.2 Set up Vercel Monitoring

1. Go to Settings → Monitoring
2. Enable Performance Monitoring
3. Set up alerts for:
   - High error rates
   - Slow API responses
   - Memory usage spikes

### 6.3 Monitor Supabase

1. Go to Supabase Dashboard → Logs
2. Enable query logging
3. Set up alerts for:
   - Failed auth attempts
   - Query errors
   - Connection issues

## Step 7: Auto-Scaling Configuration

### 7.1 Vercel Functions

No manual scaling needed — Vercel scales automatically.

Optimize performance:

1. Reduce function execution time:
   - Cache database queries
   - Use edge functions for static content
   - Compress responses

2. Configure function timeout:
   - In `vercel.json`, set `maxDuration`:
   ```json
   {
     "functions": {
       "api/**": {
         "memory": 1024,
         "maxDuration": 30
       }
     }
   }
   ```

### 7.2 Supabase Performance

1. Monitor database:
   ```sql
   -- Check slow queries
   SELECT query, calls, mean_exec_time 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. Optimize queries:
   - Add EXPLAIN ANALYZE
   - Check index usage
   - Monitor connection pool

## Step 8: Continuous Deployment

### 8.1 Auto-deploy on push to main

Vercel does this by default. Verify:

1. Go to Settings → Git
2. Ensure "Automatic deployments" is ON
3. Verify branch is `main`

### 8.2 Preview deployments

Every pull request gets a preview URL:
- Pattern: `https://secrets-by-notrace-git-[branch]-username.vercel.app`

### 8.3 Rollback procedure

If something breaks:

1. Go to Vercel → Deployments
2. Find the last working deployment
3. Click "..." → "Redeploy"
4. Or revert code on GitHub and push

## Step 9: Database Migrations

### 9.1 For future schema changes

```bash
# Create new migration
supabase migration new add_new_column

# Edit migration file in supabase/migrations/

# Test locally
supabase db push

# Verify changes
supabase db pull

# Commit and push
git add supabase/migrations/
git commit -m "Add new column migration"
git push origin main

# Vercel will deploy automatically
```

### 9.2 Zero-downtime migrations

Always use additive migrations:
- Add columns with default values
- Don't drop columns immediately
- Remove columns after code is deployed

## Step 10: Security Hardening

### 10.1 Environment variables

✅ Already configured in Vercel

### 10.2 API security

In `next.config.js`, we've added:
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- X-XSS-Protection (1; mode=block)

### 10.3 Database security

In Supabase:
- RLS policies enabled ✅
- Password-protected database ✅
- Network restrictions (optional)

### 10.4 Domain security

1. Enable DNSSEC in registrar
2. Set up SPF/DKIM/DMARC for emails (if needed)
3. Monitor SSL certificate validity

## Step 11: Cost Optimization

### 11.1 Vercel

- Free tier: 100GB bandwidth/month
- Overages: $0.50/GB
- Optimize by:
  - Caching responses
  - Compressing assets
  - Using CDN

### 11.2 Supabase

- Free tier: 500MB storage, 2GB bandwidth
- Set storage limits in PostgreSQL
- Archive old messages to cold storage (future)

### 11.3 Estimated monthly costs

**Development:**
- Vercel: Free
- Supabase: Free
- Domain: $10-15
- **Total: ~$15**

**Production:**
- Vercel: $20-100 (depending on usage)
- Supabase: Pro $25 + overages
- Domain: $10-15
- CDN (optional): $0-50
- **Total: $55-190+**

## Troubleshooting

### Problem: Deployment fails

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Type errors (run: npm run type-check locally)
# - Supabase connection issues
```

### Problem: API returns 500 error

```bash
# Check Vercel function logs:
# 1. Go to Vercel project → Functions
# 2. Click on API route
# 3. View logs
```

### Problem: CORS errors in browser

```bash
# Verify CORS is configured in Supabase:
# 1. Go to Supabase → Settings → API
# 2. Check allowed origins include your domain
```

### Problem: Database connection timeout

```bash
# Check connection pool:
# 1. Supabase → Settings → Database
# 2. Verify pool size is adequate
# 3. Check for long-running queries
```

## Rollback Plan

If something critical breaks:

1. **Immediate:** Switch traffic to previous deployment
   ```bash
   # In Vercel dashboard
   Deployments → Select previous version → "Redeploy"
   ```

2. **Code rollback:**
   ```bash
   git revert HEAD
   git push origin main
   # Vercel auto-redeploys
   ```

3. **Database rollback:**
   ```bash
   # Use Supabase backup
   # Go to Settings → Backups → Restore
   ```

## Monitoring Checklist

- [ ] Uptime monitoring (99.9% SLA)
- [ ] Error rate alerts (>1%)
- [ ] Performance alerts (>2s response)
- [ ] Database health checks
- [ ] Backup verification
- [ ] Security patches

## Next Steps

1. ✅ Deploy to production
2. Set up monitoring & alerts
3. Configure email notifications
4. Plan disaster recovery
5. Schedule regular backup tests
6. Plan feature releases
