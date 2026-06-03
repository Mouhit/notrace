// middleware.ts
// Global middleware for rate limiting - By Engage Ad

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Determine rate limit type based on route
  let limitType: 'signup' | 'login' | 'payment' | 'createSecret' | null = null;

  if (pathname === '/api/auth/signup') {
    limitType = 'signup';
  } else if (pathname === '/api/auth/login') {
    limitType = 'login';
  } else if (pathname.startsWith('/api/payments')) {
    limitType = 'payment';
  } else if (pathname === '/api/secrets/create') {
    limitType = 'createSecret';
  }

  if (limitType) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = await checkRateLimit(ip, limitType);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
