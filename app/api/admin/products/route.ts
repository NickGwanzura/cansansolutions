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
    console.log('[API GET] ENV check:', { 
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV 
    });
    
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
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    console.log('[API POST] Creating:', data);
    
    const product = await createProduct(data);
    console.log('[API POST] Created:', product.id);
    
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
