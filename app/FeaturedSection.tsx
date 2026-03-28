'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import type { Product } from '@/lib/types';

interface FeaturedSectionProps {
  products: Product[];
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Curated picks</p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">Featured Products</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-red-600 hover:text-red-700">
            View all
          </Link>
        </div>

        {featured.length > 0 ? (
          <FeaturedGrid products={featured} />
        ) : (
          <div className="py-12 text-center text-zinc-400">
            <p>No featured products yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
