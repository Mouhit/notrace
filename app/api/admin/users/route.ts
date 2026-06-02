// app/api/admin/users/route.ts
// List users (admin only) - By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const adminSecret = request.headers.get('x-admin-key');
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');

    let query = supabase
      .from('users')
      .select('id, email, full_name, subscription_tier, created_at, last_login')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    return Response.json({
      users,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
