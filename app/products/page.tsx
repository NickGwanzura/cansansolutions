'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import categoriesData from '@/data/categories.json';
import { ProductCard } from '@/components/ProductCard';
import { QuickPreview } from '@/components/QuickPreview';
import type { Product, Category } from '@/lib/types';

const categories = categoriesData as Category[];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeCondition, setActiveCondition] = useState<'all' | 'new' | 'pre-owned'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    const cond = searchParams.get('condition') as typeof activeCondition | null;
    if (cond && ['new', 'pre-owned'].includes(cond)) setActiveCondition(cond);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchCond = activeCondition === 'all' || p.condition === activeCondition;
    return matchCat && matchCond;
  });

  const conditionCounts = {
    new: products.filter((p) => p.condition === 'new' && (activeCategory === 'all' || p.category === activeCategory)).length,
    'pre-owned': products.filter((p) => p.condition === 'pre-owned' && (activeCategory === 'all' || p.category === activeCategory)).length,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600"></div>
        <p className="mt-2 text-sm text-zinc-500">Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Page title */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">All Products</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Brand new and quality pre-owned tech. All tested and ready.
            </p>
          </div>
        </div>

        {/* Condition filter */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mr-1">Condition:</span>
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'new', label: `Brand New${conditionCounts.new > 0 ? ` (${conditionCounts.new})` : ''}` },
              { value: 'pre-owned', label: `Pre-owned${conditionCounts['pre-owned'] > 0 ? ` (${conditionCounts['pre-owned']})` : ''}` },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCondition(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCondition === value
                  ? value === 'new'
                    ? 'bg-green-600 text-white'
                    : value === 'pre-owned'
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat.slug
                  ? 'bg-red-600 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="mb-5 text-sm text-zinc-500">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          {activeCategory !== 'all' && ` in ${categories.find((c) => c.slug === activeCategory)?.label ?? activeCategory}`}
          {activeCondition !== 'all' && ` · ${activeCondition === 'new' ? 'Brand New' : 'Pre-owned'}`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-sm">No products match this filter.</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveCondition('all'); }}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <QuickPreview product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-zinc-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
