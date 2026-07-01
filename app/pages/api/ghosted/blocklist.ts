/**
 * Blocklist API Endpoint for Ghosted Android App
 * 
 * Route: GET /api/ghosted/blocklist
 * Location: app/pages/api/ghosted/blocklist.ts
 * 
 * Purpose: Serve dynamic blocklists to Ghosted app
 * Response Format: JSON with domain array + metadata
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Types
interface BlocklistResponse {
  blocklist: string[];
  count: number;
  lastUpdated: string;
  version: string;
  cacheHit?: boolean;
}

interface BlocklistError {
  error: string;
  timestamp?: string;
}

// In-memory cache (simple implementation)
// For production, consider Redis
let blocklistCache: {
  data: string[];
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 3600000; // 1 hour

/**
 * GET /api/ghosted/blocklist
 * 
 * Returns a list of blocked domains for the Ghosted app
 * 
 * Query Parameters (optional):
 * - category: Filter by category (e.g., "analytics", "advertising")
 * - format: Response format (default: "json", could be "csv", "txt")
 * - bypass-cache: If present, ignore cache and fetch fresh data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlocklistResponse | BlocklistError>
) {
  // ============================================================================
  // VALIDATION
  // ============================================================================

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed - only GET is supported'
    });
  }

  try {
    // ============================================================================
    // CACHE CHECK
    // ============================================================================

    const bypassCache = 'bypass-cache' in req.query;
    const now = Date.now();

    if (
      !bypassCache &&
      blocklistCache &&
      now - blocklistCache.timestamp < CACHE_DURATION_MS
    ) {
      console.log('[Blocklist] Serving from cache');
      
      return res
        .setHeader('Cache-Control', 'public, max-age=3600')
        .setHeader('X-Blocklist-Version', '1.0')
        .setHeader('X-Cache', 'HIT')
        .status(200)
        .json({
          blocklist: blocklistCache.data,
          count: blocklistCache.data.length,
          lastUpdated: new Date().toISOString(),
          version: '1.0',
          cacheHit: true
        });
    }

    // ============================================================================
    // DATABASE QUERY
    // ============================================================================

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Blocklist] Missing Supabase credentials');
      return res.status(500).json({
        error: 'Database connection failed'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get category filter if provided
    const category = req.query.category as string | undefined;

    // Build query
    let query = supabase
      .from('blocklist_rules')
      .select('domain', { count: 'exact' })
      .eq('active', true)
      .order('domain', { ascending: true });

    // Apply category filter if provided
    if (category && category.trim()) {
      query = query.eq('category', category.trim());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Blocklist] Database error:', error);
      return res.status(500).json({
        error: 'Failed to fetch blocklist from database'
      });
    }

    // ============================================================================
    // PARSE RESPONSE
    // ============================================================================

    const blocklist = data?.map(row => row.domain) || [];

    // Validate we got data
    if (!Array.isArray(blocklist)) {
      console.error('[Blocklist] Invalid data format received');
      return res.status(500).json({
        error: 'Invalid response format from database'
      });
    }

    // ============================================================================
    // CACHE STORAGE
    // ============================================================================

    blocklistCache = {
      data: blocklist,
      timestamp: now
    };

    console.log(`[Blocklist] Fetched ${blocklist.length} domains from database`);

    // ============================================================================
    // RESPONSE
    // ============================================================================

    const response: BlocklistResponse = {
      blocklist,
      count: blocklist.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    return res
      .setHeader('Cache-Control', 'public, max-age=3600')
      .setHeader('Content-Type', 'application/json')
      .setHeader('X-Blocklist-Version', '1.0')
      .setHeader('X-Cache', 'MISS')
      .setHeader('X-Blocklist-Count', blocklist.length.toString())
      .status(200)
      .json(response);

  } catch (error) {
    console.error('[Blocklist] Unexpected error:', error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';

    return res
      .setHeader('Content-Type', 'application/json')
      .status(500)
      .json({
        error: 'Internal Server Error',
        timestamp: new Date().toISOString()
      });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clear cache (useful for manual refresh during tests)
 */
export function clearBlocklistCache() {
  blocklistCache = null;
  console.log('[Blocklist] Cache cleared');
}

/**
 * Get current cache status (for debugging)
 */
export function getBlocklistCacheStatus() {
  if (!blocklistCache) {
    return { cached: false, age: null };
  }

  const ageMs = Date.now() - blocklistCache.timestamp;
  const ageSeconds = Math.round(ageMs / 1000);

  return {
    cached: true,
    count: blocklistCache.data.length,
    ageSeconds,
    expiresIn: Math.round((CACHE_DURATION_MS - ageMs) / 1000)
  };
}