// app/api/collections/create/route.ts
// Create a new collection/folder
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          name: name.trim(),
          description: description || null,
        },
      ])
      .select('id, name, description, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create collection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: data,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
