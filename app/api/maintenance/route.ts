import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

const BYPASS_PASSWORD = process.env.MAINTENANCE_PASSWORD || 'cansan2024';
const BYPASS_COOKIE = 'maintenance_bypass';

function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = (req.headers as Headers).get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    // Rate limit: 10 attempts per IP per 5 minutes
    const ip = getClientIp(req);
    const limitResult = checkRateLimit(`maintenance-auth:${ip}`, 10, 300);

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', retryAfter: limitResult.resetInSeconds },
        { status: 429, headers: { 'Retry-After': String(limitResult.resetInSeconds) } }
      );
    }

    const { password } = await req.json();

    if (password === BYPASS_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(BYPASS_COOKIE, BYPASS_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(BYPASS_COOKIE);
  return NextResponse.json({ success: true });
}
