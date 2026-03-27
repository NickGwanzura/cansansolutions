export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readProducts, createProduct } from '@/lib/admin-data';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

export async function GET() {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[API GET] Fetching products...');
    const products = await readProducts();
    console.log('[API GET] Products fetched:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API GET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: errorMessage,
      stack: errorStack,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    console.log('[API POST] Creating product:', data);
    
    const product = await createProduct(data);
    console.log('[API POST] Product created:', product);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API POST] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: errorMessage,
      stack: errorStack,
    }, { status: 500 });
  }
}
