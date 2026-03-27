export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/admin-data';

export async function GET() {
  try {
    console.log('[API /products] Fetching...');
    const products = await readProducts();
    console.log('[API /products] Success:', products.length);
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[API /products] FAILED:', error);
    return NextResponse.json([], { 
      status: 200,
      headers: { 
        'X-Error': error instanceof Error ? error.message : 'DB Error',
        'Cache-Control': 'no-store',
      }
    });
  }
}
