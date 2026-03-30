-- ============================================================
-- NoTrace — Migration: Collections / Workspaces ("The One")
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📁',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add collection_id to secrets table
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS collection_id TEXT;

-- Index for fast lookup by owner
CREATE INDEX IF NOT EXISTS idx_collections_owner_id ON collections (owner_id);
CREATE INDEX IF NOT EXISTS idx_secrets_collection_id ON secrets (collection_id);

-- RLS for collections — block direct client access
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access to collections" ON collections FOR ALL USING (FALSE);
