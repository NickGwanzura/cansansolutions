import { Suspense } from 'react';
import { ProductsClient } from './ProductsClient';
import { readProducts } from '@/lib/admin-data';
import categoriesData from '@/data/categories.json';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const categories = categoriesData as Category[];

async function ProductsContent() {
  const products = await readProducts();
  
  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories}
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
