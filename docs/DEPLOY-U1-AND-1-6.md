# Deploy U1 Update + Phase 1.6 - Complete Guide

**By Engage Ad**  
**Ready to Deploy**

---

## 📦 Files to Deploy

### File 1: secret-page-U1.tsx
**What:** Updated secret read page with 3 buttons (Copy Message, Create Secret, Return Home)  
**Deploy to:** `app/secret/page.tsx`

### File 2: cron-delete-expired-secrets.ts
**What:** Auto-delete cron job for expired secrets  
**Deploy to:** `app/api/cron/delete-expired-secrets/route.ts`

### File 3: vercel.json
**What:** Cron job configuration (runs every hour)  
**Deploy to:** Root of project (same level as package.json)

---

## 🚀 Step-by-Step Deployment

### Step 1: Backup Current Files
```bash
cd notrace

# Backup current secret page
cp app/secret/page.tsx app/secret/page.tsx.backup-u1
```

### Step 2: Copy New Files
```bash
# U1 Update - Copy secret page
cp secret-page-U1.tsx app/secret/page.tsx

# Phase 1.6 - Create cron folder
mkdir -p app/api/cron/delete-expired-secrets

# Copy cron file
cp cron-delete-expired-secrets.ts app/api/cron/delete-expired-secrets/route.ts

# Copy vercel config (to project root)
cp vercel.json ./vercel.json
```

### Step 3: Add Environment Variable
```bash
# Add to .env.local
CRON_SECRET=your-random-secret-key-here-minimum-32-chars

# Example:
# CRON_SECRET=super_secret_cron_key_12345678901234567890
```

**Important:** 
- Generate a random string (minimum 32 characters)
- Keep it secret - don't share
- Use in vercel.json calls

### Step 4: Verify File Placement
```bash
# Check all files are in correct place
ls -la app/secret/page.tsx
ls -la app/api/cron/delete-expired-secrets/route.ts
ls -la vercel.json

# All three should exist without errors
```

### Step 5: Test Locally (Optional)
```bash
npm run dev

# Visit:
# http://localhost:3000/app - create secret
# http://localhost:3000/secret?id=test#key=test - test read page
```

### Step 6: Push to GitHub
```bash
git add app/secret/page.tsx
git add app/api/cron/delete-expired-secrets/route.ts
git add vercel.json
git add .env.local

git commit -m "feat: U1 Update + Phase 1.6 - Add Create Secret button and auto-delete cron job"

git push origin main
```

### Step 7: Vercel Auto-Deploy
- Vercel automatically deploys
- Wait 2-3 minutes for build
- Check deployment status in Vercel dashboard

### Step 8: Verify Deployment
```bash
# 1. Visit notrace.co.in/app
# - Create a test secret
# - Should work without errors

# 2. Get the secret link
# - Copy the link

# 3. Visit secret link (notrace.co.in/secret?id=xxx#key=yyy)
# - Click "Reveal Secret"
# - Should see message with 3 buttons:
#   - Copy Message ✅
#   - Create Secret ✅
#   - Return Home ✅

# 4. Test buttons
# - Copy Message: Should copy to clipboard
# - Create Secret: Should go to /app
# - Return Home: Should go to /

# 5. Check cron in Vercel dashboard
# - Go to Vercel Dashboard
# - Select project
# - Go to "Crons" tab
# - Should see: /api/cron/delete-expired-secrets
# - Schedule: 0 * * * * (every hour)
```

---

## 🔧 Configuration Details

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/delete-expired-secrets",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule explanation:**
- `0 * * * *` = Every hour at minute 0
- Runs: 00:00, 01:00, 02:00, ... 23:00 every day

### CRON_SECRET Variable
- Must be strong (32+ characters)
- Used to verify cron requests
- Set in Vercel dashboard under Settings → Environment Variables

---

## ✅ What Each File Does

### secret-page-U1.tsx
**Changes from previous version:**
- ❌ Removed ShareButtons component
- ❌ Removed QRCodeModal component
- ✅ Added "Copy Message" button (copies decrypted message)
- ✅ Added "Create Secret" button (goes to /app)
- ✅ Added "Return Home" button (goes to /)
- ✅ Added copy feedback message

**User sees after revealing secret:**
```
┌─────────────────────────┐
│ ✅ Secret decrypted     │
│                         │
│ [Message displayed]     │
│                         │
│ ⚠️ Don't refresh warning
│                         │
│ [📋 Copy Message]       │
│ [✏️ Create Secret]      │
│ [🏠 Return Home]        │
└─────────────────────────┘
```

### cron-delete-expired-secrets.ts
**What it does:**
1. Runs every hour (scheduled by vercel.json)
2. Finds all secrets where `expires_at < NOW()`
3. Deletes them from database
4. Logs the count of deleted secrets

**Example log output:**
```
✅ Deleted 5 expired secrets at 2026-06-01T22:00:00Z
```

**How it works:**
1. Vercel Cron triggers at /api/cron/delete-expired-secrets
2. Verifies CRON_SECRET header
3. Queries Supabase for expired secrets
4. Deletes matching records
5. Returns success response

### vercel.json
**What it does:**
- Configures Vercel Crons
- Sets schedule for deletion job
- Runs at specified time every day

---

## 🧪 Testing the Cron Job

### Method 1: Manual Trigger (for testing)
```bash
# Use curl to manually trigger
curl -X GET https://notrace.co.in/api/cron/delete-expired-secrets \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Response should be:
# { "success": true, "deleted": X, "message": "..." }
```

### Method 2: Check Vercel Logs
1. Go to Vercel Dashboard
2. Select notrace project
3. Go to "Deployments" → "Functions"
4. Click `/api/cron/delete-expired-secrets`
5. See execution history

### Method 3: Check Database
1. Go to Supabase Dashboard
2. Check "secrets" table
3. Filter by `expires_at < NOW()` and `is_read = false`
4. Should be empty (all deleted by cron)

---

## 🚨 Troubleshooting

### Issue: "Unauthorized" when testing cron
**Solution:** Check CRON_SECRET matches in .env.local and cron route

### Issue: Cron doesn't run at scheduled time
**Solution:** 
1. Check vercel.json syntax
2. Check Vercel dashboard for deployment status
3. Crons only work on production (not localhost)

### Issue: "Create Secret" button doesn't appear
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check app/secret/page.tsx is updated correctly

### Issue: Secrets not deleted after expiry
**Solution:**
1. Check cron is enabled in Vercel dashboard
2. Check CRON_SECRET environment variable is set
3. Check Supabase connection is working
4. Check database has `is_read` column

---

## ✅ Deployment Checklist

- [ ] Files copied to correct locations
- [ ] CRON_SECRET added to .env.local
- [ ] vercel.json in project root
- [ ] No syntax errors (npm run build)
- [ ] Pushed to GitHub
- [ ] Vercel build successful
- [ ] U1 buttons visible on secret page
- [ ] Cron job shows in Vercel dashboard
- [ ] Can manually trigger cron (optional)
- [ ] Expired secrets deleted after expiry

---

## 📊 Files Summary

| File | Location | Purpose |
|------|----------|---------|
| secret-page-U1.tsx | app/secret/page.tsx | Show 3 buttons after reveal |
| cron-delete-expired-secrets.ts | app/api/cron/delete-expired-secrets/route.ts | Auto-delete expired secrets |
| vercel.json | ./vercel.json (root) | Configure cron schedule |

---

## 🎉 After Deployment

**What's new:**

✅ **U1 Update:** Secret read page now has 3 buttons
- Copy Message (copies decrypted message)
- Create Secret (go to create page)
- Return Home (go to home page)

✅ **Phase 1.6:** Auto-delete works
- Every hour, expired secrets are automatically deleted
- No manual cleanup needed
- Reduces server storage usage

✅ **Ready for Phase 1.7:** Testing
- Use PHASE-1-7-TESTING-CHECKLIST.md
- Test all features thoroughly
- Find and document any bugs

---

## 📞 Support

**Questions?**
- Email: mouhitkanaujia@gmail.com
- Phone: +91 9369524385
- Company: Engage Ad

---

## 🚀 Next Steps

After deployment:

1. **Test U1** - Verify 3 buttons work
2. **Test Phase 1.6** - Create old secret, wait, verify deletion
3. **Run Phase 1.7** - Follow testing checklist
4. **Fix bugs** - Found during testing
5. **Document** - Write user/dev docs
6. **Launch** - Phase 1 Complete! 🎉

