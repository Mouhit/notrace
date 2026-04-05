-- ============================================================
-- NoTrace — Migration: Ensure scheduled_at column exists
-- Run this in Supabase SQL Editor if scheduled secrets
-- are opening instantly (column may be missing)
-- ============================================================

-- Add scheduled_at if not already present
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Add is_reply if not already present  
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS is_reply BOOLEAN NOT NULL DEFAULT FALSE;

-- Add reply_to_id if not already present
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS reply_to_id TEXT;

-- Add collection_id if not already present
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS collection_id TEXT;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'secrets' 
ORDER BY ordinal_position;
