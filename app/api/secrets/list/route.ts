// app/api/secrets/list/route.ts
// List secrets (optionally filtered by collection)
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collection_id');

    let query = supabase
      .from('secrets')
      .select('id, created_at, expires_at, is_read, collection_id')
      .order('created_at', { ascending: false });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch secrets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      secrets: data || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
