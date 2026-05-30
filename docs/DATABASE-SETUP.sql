-- NoTrace Database Setup
-- By Engage Ad
-- Run this in Supabase SQL Editor

-- ========================================
-- CREATE TABLES
-- ========================================

-- Users Table (for paid users only)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_start_at TIMESTAMP,
  subscription_end_at TIMESTAMP,
  razorpay_subscription_id VARCHAR(255),
  secrets_created_today INT DEFAULT 0,
  last_secret_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Secrets Table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_blob TEXT NOT NULL,
  password_hash VARCHAR(255),
  collection_id UUID,
  expires_at TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_by_tier VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  title VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INT,
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table (payment history)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Stats Table
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secrets_sent_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_secrets_expires_at ON secrets(expires_at);
CREATE INDEX IF NOT EXISTS idx_secrets_collection_id ON secrets(collection_id);
CREATE INDEX IF NOT EXISTS idx_secrets_created_at ON secrets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secrets_user_id ON secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_secrets_is_read ON secrets(is_read);

CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_usage_stats_updated_at ON usage_stats(updated_at DESC);

-- ========================================
-- CREATE FUNCTIONS
-- ========================================

-- Function to auto-delete expired secrets
CREATE OR REPLACE FUNCTION delete_expired_secrets()
RETURNS void AS $$
BEGIN
  DELETE FROM secrets WHERE expires_at < NOW() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE TRIGGERS
-- ========================================

-- Triggers for updated_at column
CREATE TRIGGER update_secrets_updated_at
BEFORE UPDATE ON secrets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usage_stats_updated_at
BEFORE UPDATE ON usage_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- ========================================

-- Allow all operations (can be restricted later)
CREATE POLICY "Enable all operations for secrets" ON secrets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for collections" ON collections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for usage_stats" ON usage_stats
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- CREATE VIEW
-- ========================================

CREATE OR REPLACE VIEW public.stats_summary AS
SELECT 
  (SELECT COUNT(*) FROM secrets) as total_secrets,
  (SELECT COUNT(*) FROM secrets WHERE is_read = false) as unread_secrets,
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM testimonials WHERE approved = true) as approved_testimonials,
  (SELECT secrets_sent_count FROM usage_stats LIMIT 1) as total_secrets_sent;

-- ========================================
-- INSERT INITIAL DATA
-- ========================================

-- Initialize usage_stats with one row
INSERT INTO usage_stats (id, secrets_sent_count) 
VALUES (uuid_generate_v4(), 0)
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES (Run after setup)
-- ========================================

-- Check all tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check secrets table
-- SELECT * FROM secrets LIMIT 1;

-- Check stats
-- SELECT * FROM stats_summary;

