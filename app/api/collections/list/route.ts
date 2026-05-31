// app/api/collections/list/route.ts
// List all collections
// By Engage Ad

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, description, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch collections' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collections: data || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
