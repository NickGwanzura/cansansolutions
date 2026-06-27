export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { readProducts, createProduct } from '@/lib/admin-data';
import { normalizeBundleItems, normalizeProductType } from '@/lib/catalog';

export async function GET() {
  try {
    console.log('[API GET] Starting request...');
    
    const authed = await checkAdminAuth();
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
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('[API POST] Starting...');
    
    if (!(await checkAdminAuth())) {
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
    if (normalizeProductType(data.productType) === 'bundle' && normalizeBundleItems(data.bundleItems).length === 0) {
      return NextResponse.json({ error: 'Bundle items are required for bundles' }, { status: 400 });
    }
    
    console.log('[API POST] Calling createProduct...');
    const product = await createProduct(data);
    console.log('[API POST] Created:', product);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API POST] ERROR:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
    }, { status: 500 });
  }
}
