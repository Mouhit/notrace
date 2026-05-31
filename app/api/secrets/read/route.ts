// app/api/secrets/read/route.ts
// Read encrypted secret (without deleting)
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch secret
    const { data, error } = await supabase
      .from('secrets')
      .select('encrypted_blob, password_hash, expires_at, is_read')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Secret not found or already deleted' },
        { status: 410 }
      );
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Secret has expired' },
        { status: 410 }
      );
    }

    // Check if already read
    if (data.is_read) {
      return NextResponse.json(
        { success: false, error: 'Secret already read and deleted' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      encrypted_blob: data.encrypted_blob,
      requires_password: !!data.password_hash,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
