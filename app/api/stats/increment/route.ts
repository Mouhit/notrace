// app/api/stats/increment/route.ts
// Increment secrets counter (admin only)
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { increment = 1 } = body;

    if (typeof increment !== 'number' || increment <= 0) {
      return NextResponse.json(
        { success: false, error: 'increment must be positive number' },
        { status: 400 }
      );
    }

    // Get current count
    const { data: currentData } = await supabase
      .from('usage_stats')
      .select('secrets_sent_count')
      .limit(1)
      .single();

    const currentCount = currentData?.secrets_sent_count || 0;
    const newCount = currentCount + increment;

    // Update counter
    const { data, error } = await supabase
      .from('usage_stats')
      .update({ secrets_sent_count: newCount })
      .limit(1)
      .select('secrets_sent_count')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update counter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      secrets_sent_count: data.secrets_sent_count,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
