import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BYPASS_PASSWORD = process.env.MAINTENANCE_PASSWORD || 'cansan2024';
const BYPASS_COOKIE = 'maintenance_bypass';

export async function POST(req: Request) {
  try {
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
