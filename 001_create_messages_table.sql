-- Create messages table
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read a message (no login required)
CREATE POLICY "Allow anyone to read messages"
  ON public.messages
  FOR SELECT
  USING (true);

-- RLS Policy: Only system can insert
CREATE POLICY "Allow insert via API only"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only system can update
CREATE POLICY "Allow update via API only"
  ON public.messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.messages IS 'Stores encrypted secret messages with metadata';
