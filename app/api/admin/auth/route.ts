export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = (req.headers as Headers).get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(req: Request) {
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
  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_auth', ADMIN_PASSWORD, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
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
