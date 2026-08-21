export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminAuth,
  checkRequestOrigin,
  createAdminSession,
  getAdminPassword,
} from '@/lib/check-admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = (req.headers as Headers).get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(req: NextRequest) {
  if (!checkRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 16 * 1024)
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 503 });
  }

  // Rate limit: 10 attempts per IP per 5 minutes
  const ip = getClientIp(req);
  const limitResult = checkRateLimit(`admin-auth:${ip}`, 10, 300);

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.', retryAfter: limitResult.resetInSeconds },
      { status: 429, headers: { 'Retry-After': String(limitResult.resetInSeconds) } },
    );
  }

  const { password } = await req.json();
  if (typeof password === 'string' && password === adminPassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_auth', createAdminSession(adminPassword), {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function DELETE(req: NextRequest) {
  if (!checkRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_auth', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
  return res;
}

/** GET returns 200 if the admin auth cookie is valid, 401 otherwise. */
export async function GET() {
  const authed = await checkAdminAuth();
  if (authed) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
