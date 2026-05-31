// app/api/secrets/create/route.ts
// Create encrypted secret
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encrypted_blob, password_hash, collection_id, expires_in_minutes } = body;

    // Validate input
    if (!encrypted_blob || typeof encrypted_blob !== 'string') {
      return NextResponse.json(
        { success: false, error: 'encrypted_blob is required' },
        { status: 400 }
      );
    }

    if (!expires_in_minutes || expires_in_minutes <= 0) {
      return NextResponse.json(
        { success: false, error: 'expires_in_minutes must be positive' },
        { status: 400 }
      );
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in_minutes * 60000).toISOString();

    // Insert into database
    const { data, error } = await supabase
      .from('secrets')
      .insert([
        {
          encrypted_blob,
          password_hash: password_hash || null,
          collection_id: collection_id || null,
          expires_at: expiresAt,
          is_read: false,
          created_by_tier: 'free',
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create secret' },
        { status: 500 }
      );
    }

    // Generate shareable link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://notrace.co.in';
    const link = `${baseUrl}/secret?id=${data.id}`;

    return NextResponse.json({
      success: true,
      id: data.id,
      link,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
