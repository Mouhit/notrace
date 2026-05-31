// app/api/secrets/read-confirm/route.ts
// Mark secret as read AND DELETE IT
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    // Delete the secret (IMPORTANT: Actually delete, don't just mark as read)
    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete secret' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Secret deleted successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
