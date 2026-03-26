'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { QuickPreview } from './QuickPreview';
import type { Product } from '@/lib/types';

export function FeaturedGrid({ products }: { products: Product[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>
      <QuickPreview product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
