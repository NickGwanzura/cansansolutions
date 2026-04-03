'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { QuickPreview } from '@/components/QuickPreview';
import { EmptyState } from '@/components/EmptyState';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import type { Product, Category } from '@/lib/types';
import { isBundleProduct } from '@/lib/catalog';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<'all' | 'single' | 'bundle'>('all');
  const [activeCondition, setActiveCondition] = useState<'all' | 'new' | 'pre-owned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const products = initialProducts;

  useEffect(() => {
    const cat = searchParams.get('category');
    const type = searchParams.get('type');
    const cond = searchParams.get('condition') as typeof activeCondition | null;
    queueMicrotask(() => {
      setActiveCategory(cat ?? 'all');
      setActiveType(type === 'single' || type === 'bundle' ? type : 'all');
      setActiveCondition(cond && ['new', 'pre-owned'].includes(cond) ? cond : 'all');
      // Simulate loading for skeleton demonstration
      setTimeout(() => setIsLoading(false), 300);
    });
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const productType = isBundleProduct(p) ? 'bundle' : 'single';
      const matchType = activeType === 'all' || productType === activeType;
      const matchCond = activeType === 'bundle' || activeCondition === 'all' || p.condition === activeCondition;
      
      // Search functionality
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        p.specs && Object.values(p.specs).some(val => 
          String(val).toLowerCase().includes(searchLower)
        );
      
      return matchCat && matchType && matchCond && matchSearch;
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [products, activeCategory, activeType, activeCondition, searchQuery, sortBy]);

  const typeCounts = {
    single: products.filter((p) => !isBundleProduct(p) && (activeCategory === 'all' || p.category === activeCategory)).length,
    bundle: products.filter((p) => isBundleProduct(p) && (activeCategory === 'all' || p.category === activeCategory)).length,
  };

  const conditionCounts = {
    new: products.filter((p) => !isBundleProduct(p) && p.condition === 'new' && (activeCategory === 'all' || p.category === activeCategory)).length,
    'pre-owned': products.filter((p) => !isBundleProduct(p) && p.condition === 'pre-owned' && (activeCategory === 'all' || p.category === activeCategory)).length,
  };

  const clearAllFilters = () => {
    setActiveCategory('all');
    setActiveType('all');
    setActiveCondition('all');
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters = activeCategory !== 'all' || activeType !== 'all' || activeCondition !== 'all' || searchQuery !== '';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-zinc-100" />
        </div>
        <ProductSkeleton count={8} />
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

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search products, brands, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mr-1">Type:</span>
            {(
              [
                { value: 'all', label: 'Everything' },
                { value: 'single', label: `Products${typeCounts.single > 0 ? ` (${typeCounts.single})` : ''}` },
                { value: 'bundle', label: `Bundles${typeCounts.bundle > 0 ? ` (${typeCounts.bundle})` : ''}` },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setActiveType(value);
                  if (value === 'bundle') setActiveCondition('all');
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  activeType === value
                    ? value === 'bundle'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-red-600 text-white'
                    : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-600 focus:border-red-300 focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Condition filter */}
        {activeType !== 'bundle' && (
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
        )}

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
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

        {/* Results info */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            {searchQuery && ` matching "${searchQuery}"`}
            {activeCategory !== 'all' && ` in ${categories.find((c) => c.slug === activeCategory)?.label ?? activeCategory}`}
            {activeType !== 'all' && ` · ${activeType === 'bundle' ? 'Bundles' : 'Single products'}`}
            {activeCondition !== 'all' && ` · ${activeCondition === 'new' ? 'Brand New' : 'Pre-owned'}`}
          </p>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>

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
          <EmptyState
            type="search"
            title={searchQuery ? `No products found for "${searchQuery}"` : 'No products match your filters'}
            description={searchQuery ? 'Try different keywords or check your spelling.' : 'Try adjusting your filters to see more products.'}
            action={{
              label: hasActiveFilters ? 'Clear all filters' : 'Browse all products',
              onClick: clearAllFilters,
            }}
          />
        )}
      </div>

      <QuickPreview product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
