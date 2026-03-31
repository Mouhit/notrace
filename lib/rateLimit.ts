/**
 * NoTrace — Rate Limiter
 * In-memory rate limiting per IP address.
 * Resets every window period.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — resets on cold start (good enough for Vercel serverless)
const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  key: string;          // unique key e.g. "create:{ip}"
  limit: number;        // max requests
  windowMs: number;     // time window in ms
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(config.key);

  if (!entry || now > entry.resetAt) {
    // Fresh window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(config.key, newEntry);
    return {
      allowed: true,
      count: 1,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: newEntry.resetAt,
    };
  }

  entry.count += 1;
  store.set(config.key, entry);

  return {
    allowed: entry.count <= config.limit,
    count: entry.count,
    limit: config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt: entry.resetAt,
  };
}

// Get IP from request headers (works with Vercel proxy)
export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
