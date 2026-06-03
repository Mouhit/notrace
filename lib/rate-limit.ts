// lib/rate-limit.ts
// Rate limiting - By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

const LIMITS: Record<string, RateLimitConfig> = {
  signup: { maxRequests: 5, windowMs: 3600000 }, // 5 per hour
  login: { maxRequests: 10, windowMs: 900000 }, // 10 per 15 min
  payment: { maxRequests: 3, windowMs: 60000 }, // 3 per minute
  createSecret: { maxRequests: 100, windowMs: 86400000 }, // 100 per day
};

export async function checkRateLimit(
  key: string,
  limitType: keyof typeof LIMITS
): Promise<{ allowed: boolean; remaining: number }> {
  const config = LIMITS[limitType];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get recent requests for this key
    const { data: requests, error } = await supabase
      .from('rate_limit_log')
      .select('*')
      .eq('key', key)
      .eq('type', limitType)
      .gte('created_at', new Date(windowStart).toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: config.maxRequests };
    }

    const count = requests?.length || 0;
    const allowed = count < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    // Log this request
    if (allowed) {
      await supabase.from('rate_limit_log').insert({
        key,
        type: limitType,
        created_at: new Date().toISOString(),
      });
    }

    return { allowed, remaining };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: config.maxRequests };
  }
}

export async function resetRateLimit(key: string, limitType: string) {
  try {
    await supabase
      .from('rate_limit_log')
      .delete()
      .eq('key', key)
      .eq('type', limitType);
  } catch (error) {
    console.error('Reset rate limit error:', error);
  }
}
