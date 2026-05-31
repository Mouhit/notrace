// app/api/testimonials/submit/route.ts
// Submit a testimonial (all fields optional except message)
// By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, company, message, rating, email } = body;

    // Validate message (only required field)
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          name: name || null,
          title: title || null,
          company: company || null,
          message: message.trim(),
          rating: rating || null,
          email: email || null,
          approved: false,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit testimonial' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted! It will appear after review.',
      id: data.id,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
