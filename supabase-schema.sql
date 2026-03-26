-- ============================================================
-- NoTrace — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  password_hash TEXT,
  expiry TEXT NOT NULL DEFAULT '1hr',
  expires_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stats table
CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed stats keys
INSERT INTO stats (key, value) VALUES
  ('total_created', 0),
  ('total_read', 0)
ON CONFLICT (key) DO NOTHING;

-- Increment stat function (atomic)
CREATE OR REPLACE FUNCTION increment_stat(stat_key TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO stats (key, value, updated_at)
  VALUES (stat_key, 1, NOW())
  ON CONFLICT (key)
  DO UPDATE SET value = stats.value + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-cleanup expired secrets (run via pg_cron or Supabase scheduled function)
CREATE OR REPLACE FUNCTION cleanup_expired_secrets()
RETURNS void AS $$
BEGIN
  DELETE FROM secrets
  WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security: block all direct client access (API routes use service role)
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- No public access — all reads/writes go through Next.js API routes with service role
CREATE POLICY "No public access to secrets" ON secrets FOR ALL USING (FALSE);
CREATE POLICY "No public access to stats" ON stats FOR ALL USING (FALSE);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_secrets_expires_at ON secrets (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_secrets_is_read ON secrets (is_read);
