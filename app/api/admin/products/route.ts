export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readProducts, createProduct } from '@/lib/admin-data';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  try {
    const store = await cookies();
    return store.get('admin_auth')?.value === ADMIN_PASSWORD;
  } catch (e) {
    console.error('[Auth] Cookie check failed:', e);
    return false;
  }
}

export async function GET() {
  try {
    console.log('[API GET] Starting request...');
    
    const authed = await checkAuth();
    console.log('[API GET] Auth result:', authed);
    
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[API GET] Fetching products...');
    const products = await readProducts();
    console.log('[API GET] Success:', products.length, 'products');
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API GET] CRITICAL ERROR:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('[API POST] Starting...');
    
    if (!(await checkAuth())) {
      console.log('[API POST] Auth failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let data;
    try {
      data = await req.json();
    } catch (e) {
      console.error('[API POST] JSON parse failed:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    console.log('[API POST] Data received:', JSON.stringify(data, null, 2));
    
    if (!data.name?.trim()) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    if (!data.slug?.trim()) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    if (!data.category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    if (data.price == null || isNaN(parseFloat(data.price))) return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    if (!data.description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    if (!data.image || data.image === '/images/products/placeholder.svg') return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    
    console.log('[API POST] Calling createProduct...');
    const product = await createProduct(data);
    console.log('[API POST] Created:', product);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API POST] ERROR:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
