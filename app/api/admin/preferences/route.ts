export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { getSitePreferences } = await import('@/lib/db');
  const prefs = await getSitePreferences();
  return NextResponse.json(prefs);
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid preferences payload' }, { status: 400 });
    }
    const allowed = new Set(['currency', 'low_stock_threshold', 'items_per_page']);
    const sanitized = Object.fromEntries(
      Object.entries(body).filter(
        ([key, value]) => allowed.has(key) && typeof value === 'string' && value.length <= 100,
      ),
    ) as Record<string, string>;
    const { saveSitePreferences } = await import('@/lib/db');
    await saveSitePreferences(sanitized);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
