-- ============================================================
-- NoTrace Payments — Supabase Migration
-- ============================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  service_description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'INR')),
  service_type TEXT NOT NULL CHECK (service_type IN ('service_1', 'service_2')),
  client_email TEXT NOT NULL,
  client_name TEXT,
  notes TEXT,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  amount_paid DECIMAL(12, 2),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_number ON payments (invoice_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_client_email ON payments (client_email);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments (razorpay_order_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow admin access only
CREATE POLICY "Admin only read payments"
  ON payments FOR SELECT
  USING (auth.uid()::text = ''); -- Will be set per deployment

CREATE POLICY "Admin only insert payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid()::text = '');

CREATE POLICY "Admin only update payments"
  ON payments FOR UPDATE
  USING (auth.uid()::text = '')
  WITH CHECK (auth.uid()::text = '');

-- Public access for payment verification (via API secret)
GRANT ALL ON payments TO service_role;
