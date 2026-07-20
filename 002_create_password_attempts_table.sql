-- Create password attempts table
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

-- Enable RLS
ALTER TABLE public.password_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only system can insert
CREATE POLICY "Allow insert via API only"
  ON public.password_attempts
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: No one can read (privacy)
CREATE POLICY "Deny all reads"
  ON public.password_attempts
  FOR SELECT
  USING (false);

-- Add comment
COMMENT ON TABLE public.password_attempts IS 'Tracks password attempts for rate limiting and security';
