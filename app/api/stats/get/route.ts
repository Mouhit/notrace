// app/api/stats/get/route.ts
// Get usage statistics
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('usage_stats')
      .select('secrets_sent_count, updated_at')
      .limit(1)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        secrets_sent_count: data?.secrets_sent_count || 0,
        updated_at: data?.updated_at,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
