-- Function to check if message is expired
CREATE OR REPLACE FUNCTION is_message_expired(message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT id, expiry_at, destroyed_at 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg IS NULL THEN
    RETURN true;
  END IF;
  
  IF msg.destroyed_at IS NOT NULL THEN
    RETURN true;
  END IF;
  
  IF NOW() > msg.expiry_at THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if message is scheduled yet available
CREATE OR REPLACE FUNCTION is_message_available(message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT id, scheduled_for 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg IS NULL THEN
    RETURN false;
  END IF;
  
  IF msg.scheduled_for IS NULL THEN
    RETURN true;
  END IF;
  
  IF NOW() >= msg.scheduled_for THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get time until message is available (for scheduled messages)
CREATE OR REPLACE FUNCTION time_until_available(message_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT scheduled_for 
  INTO msg 
  FROM public.messages 
  WHERE id = message_id;
  
  IF msg.scheduled_for IS NULL THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  IF NOW() >= msg.scheduled_for THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  RETURN msg.scheduled_for - NOW();
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to mark message as destroyed
CREATE OR REPLACE FUNCTION mark_message_destroyed(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET destroyed_at = NOW()
  WHERE id = message_id AND destroyed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to mark message as opened
CREATE OR REPLACE FUNCTION mark_message_opened(message_id UUID, access_ip VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET 
    opened_at = COALESCE(opened_at, NOW()),
    view_count = view_count + 1,
    ip_accessed_from = access_ip
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check failed password attempts for a message
CREATE OR REPLACE FUNCTION get_failed_attempts_count(message_id UUID, time_window INTERVAL DEFAULT '1 hour'::INTERVAL)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.password_attempts
    WHERE 
      id = message_id 
      AND success = false
      AND attempted_at > (NOW() - time_window)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to cleanup expired messages (soft delete by marking destroyed)
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET destroyed_at = NOW()
  WHERE 
    destroyed_at IS NULL
    AND NOW() > expiry_at;
END;
$$ LANGUAGE plpgsql;

-- Create an index on password_attempts for efficient rate limiting check
CREATE INDEX idx_password_attempts_recent ON public.password_attempts(message_id, attempted_at DESC) 
WHERE succeeded = false AND attempted_at > NOW() - INTERVAL '1 hour';
