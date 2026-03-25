import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readProducts, writeProducts, nextId } from '@/lib/admin-data';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await readProducts());
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  const products = await readProducts();
  const product = { ...data, id: nextId(products) };
  products.push(product);
  await writeProducts(products);
  return NextResponse.json(product, { status: 201 });
}
