# Supabase Setup Guide - NoTrace

**By Engage Ad**  
Email: mouhitkanaujia@gmail.com  
Phone: +91 9369524385

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `notrace`
   - Database password: Create strong password
   - Region: Choose closest to you (e.g., Singapore for India)
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

---

## Step 2: Get Connection Credentials

1. In Supabase dashboard, go to **Settings** → **Database**
2. Copy these values:
   - **Connection URL:** `postgresql://...`
   - **API URL:** `https://...supabase.co`
   - **Anon Key:** (under API section)

---

## Step 3: Update .env.local

In your project root, update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_api_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Example:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (EASIEST)

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire SQL from: `docs/DATABASE-SETUP.sql`
4. Paste it in the editor
5. Click **"Run"** button
6. Wait for success message

### Option B: Using psql Command Line

```bash
# Connect to your database
psql postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres

# Paste all SQL from docs/DATABASE-SETUP.sql
# Then exit
\q
```

---

## Step 5: Verify Database Setup

In Supabase SQL Editor, run these queries to verify:

### Check Tables Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show:
- collections
- secrets
- subscriptions
- testimonials
- usage_stats
- users

### Check Secrets Table
```sql
SELECT * FROM secrets LIMIT 1;
```

### Check Stats View
```sql
SELECT * FROM stats_summary;
```

### Check Indexes
```sql
SELECT * FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## Step 6: Enable RLS (Row Level Security)

The SQL file already enables RLS, but verify:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All should show `t` (true) for rowsecurity.

---

## Step 7: Test Connection from App

```bash
# In your project directory
npm run dev

# Visit http://localhost:3000
# Open browser console (F12)
# If no errors, connection is working!
```

---

## Database Structure

### Tables Created (6 total)

1. **users** - Paid user accounts
   - email, password_hash, subscription_tier, etc.

2. **secrets** - Encrypted messages
   - encrypted_blob, password_hash, expires_at, is_read

3. **collections** - User folders
   - name, description

4. **testimonials** - User reviews
   - message, rating, approved status

5. **subscriptions** - Payment history
   - tier, amount, razorpay_ids, status

6. **usage_stats** - Counter
   - secrets_sent_count

### Views (1)
- **stats_summary** - Dashboard stats

---

## Common Issues

### Issue: "Permission denied"
**Solution:** Check if you're using anon key (public), not service key (secret)

### Issue: "Table already exists"
**Solution:** Database was already set up. Run verification queries above.

### Issue: "Connection refused"
**Solution:** Check NEXT_PUBLIC_SUPABASE_URL and ANON_KEY in .env.local

### Issue: "RLS policy violation"
**Solution:** RLS policies allow all operations in Phase 1 (see SQL file)

---

## Backup Database

### In Supabase Dashboard
1. Go to **Settings** → **Backups**
2. Click **"Create backup"**
3. Backups are automatic every 24 hours

### Export Data (Optional)
```bash
# Export tables as CSV
# Go to SQL Editor → right-click table → Export as CSV
```

---

## Important Notes

✅ All tables created with CASCADE deletes  
✅ Indexes added for performance  
✅ Triggers auto-update timestamps  
✅ RLS enabled (but permissive for Phase 1)  
✅ Usage stats initialized with 0  
✅ Ready for API calls!

---

## SQL File Includes

The `DATABASE-SETUP.sql` file includes:

✅ 6 table definitions  
✅ 13 indexes for performance  
✅ 2 functions (auto-delete, timestamps)  
✅ 6 triggers for updated_at  
✅ RLS policies on all tables  
✅ 1 view for stats  
✅ Initial data insertion  

**Run once and you're done!**

---

## Next Steps

After database setup:

1. ✅ Update .env.local
2. ✅ Run npm install
3. ✅ Run npm run dev
4. ✅ Build API routes (Task 1.3)
5. ✅ Build components (Task 1.4-1.5)

---

## Support

**Email:** mouhitkanaujia@gmail.com  
**Phone:** +91 9369524385  
**Company:** Engage Ad

