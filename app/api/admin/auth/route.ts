export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkAdminAuth, createAdminSession, getAdminPassword } from '@/lib/check-admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = (req.headers as Headers).get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(req: Request) {
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
      { status: 429, headers: { 'Retry-After': String(limitResult.resetInSeconds) } }
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

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_auth', '', { maxAge: 0, path: '/' });
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
