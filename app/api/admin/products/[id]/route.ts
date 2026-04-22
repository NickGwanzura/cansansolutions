export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateProduct, deleteProductById, getProductById } from '@/lib/admin-data';
import { normalizeBundleItems, normalizeProductType } from '@/lib/catalog';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { submitProductToIndexNow } from '@/lib/indexnow';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const data = await req.json();

  if (normalizeProductType(data.productType) === 'bundle' && normalizeBundleItems(data.bundleItems).length === 0) {
    return NextResponse.json({ error: 'Bundle items are required for bundles' }, { status: 400 });
  }
  
  const product = await updateProduct(id, data);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${product.slug}`);
  submitProductToIndexNow(product.slug);

  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  // Capture the slug BEFORE deletion so IndexNow can tell Bing/Yandex to
  // recrawl the now-404 URL and drop it from their indexes.
  const existing = await getProductById(id);

  const success = await deleteProductById(id);
  if (!success) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  revalidatePath('/');
  revalidatePath('/products');
  if (existing?.slug) {
    revalidatePath(`/products/${existing.slug}`);
    submitProductToIndexNow(existing.slug);
  }

  return NextResponse.json({ ok: true });
}
