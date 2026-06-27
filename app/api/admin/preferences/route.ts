export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function checkAuth(): Promise<boolean> {
  try {
    const store = await cookies();
    return store.get('admin_auth')?.value === (ADMIN_PASSWORD || 'cansan2024');
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { getSitePreferences } = await import('@/lib/db');
  const prefs = await getSitePreferences();
  return NextResponse.json(prefs);
}

export async function PUT(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { saveSitePreferences } = await import('@/lib/db');
    await saveSitePreferences(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
