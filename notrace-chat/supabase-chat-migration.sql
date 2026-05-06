-- ============================================================
-- NoTrace Chat — Migration: Profiles table for P2P chat
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Profiles table — stores identity for chat users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  public_key TEXT NOT NULL,        -- Ed25519 public key (hex)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique lowercase username index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (lower(username));

-- Signaling table — ephemeral WebRTC SDP offers/answers
-- Rows auto-delete after 60 seconds via pg_cron or TTL policy
CREATE TABLE IF NOT EXISTS signaling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender TEXT NOT NULL,            -- username
  type TEXT NOT NULL,              -- 'offer' | 'answer' | 'ice'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signaling_room_id ON signaling (room_id);

-- Auto-cleanup old signaling rows (older than 2 minutes)
CREATE OR REPLACE FUNCTION cleanup_old_signaling()
RETURNS void AS $$
BEGIN
  DELETE FROM signaling WHERE created_at < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signaling ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by anyone (for discovery), writable only via service role
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "No direct insert profiles" ON profiles FOR INSERT USING (FALSE);
CREATE POLICY "No direct update profiles" ON profiles FOR UPDATE USING (FALSE);

-- Signaling: fully managed via service role only
CREATE POLICY "No public access to signaling" ON signaling FOR ALL USING (FALSE);
