// app/api/subscriptions/status/route.ts
// Get subscription status - By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return Response.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
