export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateProduct, deleteProduct } from '@/lib/admin-data';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  
  const product = await updateProduct(id, data);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  
  const success = await deleteProduct(id);
  if (!success) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ ok: true });
}
