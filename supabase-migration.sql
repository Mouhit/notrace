-- ============================================================
-- NoTrace P2P Chat — Complete Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles table — stores user identity
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  public_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (lower(username));

-- 2. Signaling table — stores WebRTC SDP offers/answers/ICE candidates
-- Messages stay here for 60 seconds then auto-delete
CREATE TABLE IF NOT EXISTS signaling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  type TEXT NOT NULL,      -- 'offer' | 'answer' | 'ice'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_signaling_room_id ON signaling (room_id);
CREATE INDEX IF NOT EXISTS idx_signaling_receiver ON signaling (receiver, consumed);
CREATE INDEX IF NOT EXISTS idx_signaling_created ON signaling (created_at);

-- 3. Auto-cleanup function — delete old signals every 5 minutes
CREATE OR REPLACE FUNCTION cleanup_old_signaling()
RETURNS void AS $$
BEGIN
  DELETE FROM signaling WHERE created_at < NOW() - INTERVAL '90 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signaling ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "No direct insert profiles" ON profiles;
DROP POLICY IF EXISTS "No direct update profiles" ON profiles;
DROP POLICY IF EXISTS "No direct delete profiles" ON profiles;
DROP POLICY IF EXISTS "No public access to signaling" ON signaling;

-- RLS Policies — Profiles
-- Profiles: anyone can read (for discovery), only service role can write
CREATE POLICY "Public read profiles"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "No direct insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "No direct update profiles"
  ON profiles FOR UPDATE
  USING (FALSE);

CREATE POLICY "No direct delete profiles"
  ON profiles FOR DELETE
  USING (FALSE);

-- RLS Policies — Signaling
-- Signaling: only service role can access (via API)
CREATE POLICY "No public access to signaling"
  ON signaling FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

-- Grant service role permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON signaling TO service_role;
GRANT USAGE ON SEQUENCE profiles_id_seq TO service_role;
GRANT USAGE ON SEQUENCE signaling_id_seq TO service_role;
