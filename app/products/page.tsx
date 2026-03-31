import { Suspense } from 'react';
import { ProductsClient } from './ProductsClient';
import { readProducts } from '@/lib/admin-data';
import { CATALOG_CATEGORIES } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ProductsContent() {
  const products = await readProducts();
  
  return (
    <ProductsClient 
      initialProducts={products} 
      categories={CATALOG_CATEGORIES}
    />
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-zinc-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
