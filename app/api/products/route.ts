export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/admin-data';

export async function GET() {
  try {
    console.log('[API /products] Fetching...');
    const products = await readProducts();
    console.log('[API /products] Success:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API /products] FAILED:', error);
    // Return empty array + error header so frontend can handle gracefully
    return NextResponse.json([], { 
      status: 200,
      headers: { 'X-Error': error instanceof Error ? error.message : 'DB Error' }
    });
  }
}
