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
    
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API GET /admin/products] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    console.log('[API POST /admin/products] Creating product:', data);
    
    const product = await createProduct(data);
    console.log('[API POST /admin/products] Product created:', product);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API POST /admin/products] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
