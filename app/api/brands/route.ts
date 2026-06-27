export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getActiveBrands } from '@/lib/db';

export async function GET() {
  try {
    const brands = await getActiveBrands();
    return NextResponse.json(brands, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
