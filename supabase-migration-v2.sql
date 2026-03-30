-- ============================================================
-- NoTrace — Migration: Scheduled Secrets + Secure Reply
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add scheduled_at column (secret unlocks at this time)
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Add reply_id column (links a reply secret back to original)
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS reply_to_id TEXT;

-- Add is_reply flag
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS is_reply BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for scheduled secrets
CREATE INDEX IF NOT EXISTS idx_secrets_scheduled_at ON secrets (scheduled_at) WHERE scheduled_at IS NOT NULL;
