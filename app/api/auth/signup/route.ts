// app/api/auth/signup/route.ts
// Sign up API - By Engage Ad

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name,
        subscription_tier: 'FREE',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return Response.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create free subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'FREE',
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });

    return Response.json({
      success: true,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
