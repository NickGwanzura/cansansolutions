'use client';

import Link from 'next/link';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import type { Product } from '@/lib/types';

interface FeaturedSectionProps {
  products: Product[];
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  const featured = products.filter((p) => p.featured);
  const fallbackProducts = products.slice(0, 8);
  const displayProducts = featured.length > 0 ? featured : fallbackProducts;
  const showingFallback = featured.length === 0;

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {showingFallback ? 'Fresh arrivals' : 'Curated picks'}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              {showingFallback ? 'Latest Products' : 'Featured Products'}
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-red-600 hover:text-red-700">
            View all
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <FeaturedGrid products={displayProducts} />
        ) : (
          <div className="py-12 text-center text-zinc-400">
            <p>No products yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
