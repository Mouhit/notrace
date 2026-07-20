# Supabase Setup Guide

Complete guide to set up Supabase for Secrets by NoTrace.

## Database Schema

### 1. Messages Table

```sql
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_content TEXT NOT NULL,
  nonce TEXT NOT NULL,
  encrypted_password TEXT,
  password_nonce TEXT,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('email', 'api_key', 'otp', 'journal', 'document', 'credit_card')),
  expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  destroyed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  ip_accessed_from VARCHAR(45),
  created_by_ip VARCHAR(45),
  CONSTRAINT scheduled_after_created CHECK (scheduled_for IS NULL OR scheduled_for > created_at),
  CONSTRAINT expiry_after_scheduled CHECK (expiry_at > COALESCE(scheduled_for, created_at))
);

-- Create indexes for performance
CREATE INDEX idx_messages_expiry_at ON public.messages(expiry_at);
CREATE INDEX idx_messages_scheduled_for ON public.messages(scheduled_for);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_destroyed_at ON public.messages(destroyed_at) WHERE destroyed_at IS NOT NULL;
```

### 2. Password Attempts Table

```sql
CREATE TABLE IF NOT EXISTS public.password_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address VARCHAR(45)
);

-- Create indexes
CREATE INDEX idx_password_attempts_message_id ON public.password_attempts(message_id);
CREATE INDEX idx_password_attempts_attempted_at ON public.password_attempts(attempted_at DESC);
CREATE INDEX idx_password_attempts_failed ON public.password_attempts(message_id, attempted_at DESC) WHERE success = false;
```

## Row Level Security (RLS)

### Enable RLS on messages table

```sql
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read messages (no login required)
CREATE POLICY "Allow anyone to read messages"
  ON public.messages
  FOR SELECT
  USING (true);

-- Policy: Only system can insert
CREATE POLICY "Allow insert via API only"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only system can update
CREATE POLICY "Allow update via API only"
  ON public.messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

### Enable RLS on password_attempts table

```sql
ALTER TABLE public.password_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Only system can insert
CREATE POLICY "Allow insert via API only"
  ON public.password_attempts
  FOR INSERT
  WITH CHECK (true);

-- Policy: No one can read (privacy)
CREATE POLICY "Deny all reads"
  ON public.password_attempts
  FOR SELECT
  USING (false);
```

## SQL Functions

### Check if message is expired

```sql
CREATE OR REPLACE FUNCTION is_message_expired(message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT id, expiry_at, destroyed_at 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg IS NULL THEN
    RETURN true;
  END IF;
  
  IF msg.destroyed_at IS NOT NULL THEN
    RETURN true;
  END IF;
  
  IF NOW() > msg.expiry_at THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Check if scheduled message is available

```sql
CREATE OR REPLACE FUNCTION is_message_available(message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT id, scheduled_for 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg IS NULL THEN
    RETURN false;
  END IF;
  
  IF msg.scheduled_for IS NULL THEN
    RETURN true;
  END IF;
  
  IF NOW() >= msg.scheduled_for THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Get time until message is available

```sql
CREATE OR REPLACE FUNCTION time_until_available(message_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT scheduled_for 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg.scheduled_for IS NULL THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  IF NOW() >= msg.scheduled_for THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  RETURN msg.scheduled_for - NOW();
END;
$$ LANGUAGE plpgsql STABLE;
```

### Mark message as destroyed

```sql
CREATE OR REPLACE FUNCTION mark_message_destroyed(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET destroyed_at = NOW()
  WHERE id = message_id AND destroyed_at IS NULL;
END;
$$ LANGUAGE plpgsql;
```

### Mark message as opened

```sql
CREATE OR REPLACE FUNCTION mark_message_opened(message_id UUID, access_ip VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET 
    opened_at = COALESCE(opened_at, NOW()),
    view_count = view_count + 1,
    ip_accessed_from = access_ip
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;
```

### Get failed password attempts count

```sql
CREATE OR REPLACE FUNCTION get_failed_attempts_count(message_id UUID, time_window INTERVAL DEFAULT '1 hour'::INTERVAL)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.password_attempts
    WHERE 
      message_id = message_id
      AND success = false
      AND attempted_at > (NOW() - time_window)
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### Cleanup expired messages

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET destroyed_at = NOW()
  WHERE 
    destroyed_at IS NULL
    AND NOW() > expiry_at;
END;
$$ LANGUAGE plpgsql;
```

## Installation Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Select your organization
4. Fill in project name: `secrets-by-notrace`
5. Set database password
6. Choose region closest to you
7. Click "Create new project"
8. Wait for setup to complete

### Step 2: Get API Keys

1. Go to Project Settings → API
2. Copy `URL` (NEXT_PUBLIC_SUPABASE_URL)
3. Copy `anon` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Save to `.env.local`

### Step 3: Set Up Database

#### Option A: Using Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option B: Manual SQL Execution

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste each migration file:
   - `001_create_messages_table.sql`
   - `002_create_password_attempts_table.sql`
   - `003_create_functions.sql`
4. Click "Run"

### Step 4: Verify Tables

Run this query in SQL Editor:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:
- `messages`
- `password_attempts`

### Step 5: Verify Functions

Run this query:

```sql
SELECT routinename FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

You should see all functions created.

## Testing the Setup

### Test Message Creation

```sql
-- Insert test message
INSERT INTO public.messages (
  encrypted_content,
  nonce,
  template_type,
  expiry_at,
  created_by_ip
) VALUES (
  'test-encrypted-content',
  'test-nonce',
  'email',
  NOW() + INTERVAL '24 hours',
  '127.0.0.1'
);

-- Select it back
SELECT id, template_type, expiry_at FROM public.messages LIMIT 1;
```

### Test Functions

```sql
-- Get a message ID from previous query
SELECT is_message_expired('your-message-id'::UUID);
SELECT is_message_available('your-message-id'::UUID);
SELECT time_until_available('your-message-id'::UUID);
```

### Test Password Attempts

```sql
-- Insert test attempt
INSERT INTO public.password_attempts (message_id, success, ip_address)
VALUES ('your-message-id'::UUID, false, '127.0.0.1');

-- Check RLS (should return 0 rows)
SELECT COUNT(*) FROM public.password_attempts;
```

## Monitoring & Maintenance

### Check table sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View expired messages

```sql
SELECT id, created_at, expiry_at 
FROM public.messages 
WHERE NOW() > expiry_at AND destroyed_at IS NULL
LIMIT 10;
```

### Clean up expired messages

```sql
SELECT cleanup_expired_messages();
```

### Monitor failed password attempts

```sql
SELECT 
  message_id,
  COUNT(*) as failed_attempts,
  MAX(attempted_at) as latest_attempt
FROM public.password_attempts 
WHERE success = false AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY message_id
ORDER BY failed_attempts DESC;
```

## Backup & Recovery

### Enable automated backups

1. Go to Project Settings → Backups
2. Set backup frequency (recommended: daily)
3. Backups are auto-enabled for Pro plans

### Manual backup

```bash
# Export database
pg_dump -h your-host -U your-user -d your-db > backup.sql
```

## Performance Tips

1. **Indexes are already created** on:
   - `expiry_at` — for cleanup queries
   - `scheduled_for` — for availability checks
   - `created_at` — for recent messages
   - `destroyed_at` — for status checks

2. **Run cleanup function** periodically:
   ```sql
   SELECT cleanup_expired_messages();
   ```
   
   Consider setting up a cron job in Supabase:
   ```sql
   SELECT cron.schedule(
     'cleanup-expired',
     '0 */6 * * *',  -- Every 6 hours
     'SELECT cleanup_expired_messages()'
   );
   ```

3. **Monitor query performance**:
   - Use EXPLAIN ANALYZE before and after schema changes
   - Check slow query logs in Supabase dashboard

## Troubleshooting

### Problem: "Policy violates no-inlining" error

**Solution:** Drop and recreate the policy:
```sql
DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.messages;
CREATE POLICY "Allow anyone to read messages"
  ON public.messages
  FOR SELECT
  USING (true);
```

### Problem: Function not found error

**Solution:** Make sure you're in the correct schema:
```sql
SELECT is_message_expired('message-id'::UUID);
```

### Problem: RLS blocking legitimate reads

**Solution:** Ensure policies are correctly scoped:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

## Next Steps

1. Connect Next.js app with `.env.local` variables
2. Test API endpoints
3. Set up monitoring/alerts
4. Configure automated backups
5. Set up cron jobs for cleanup
