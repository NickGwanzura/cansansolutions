export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getActiveBanners } from '@/lib/db';

export async function GET() {
  try {
    const banners = await getActiveBanners();
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
