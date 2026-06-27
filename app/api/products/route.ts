export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/admin-data';

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[API /products] FAILED:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
