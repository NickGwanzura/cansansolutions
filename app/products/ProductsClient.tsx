'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { QuickPreview } from '@/components/QuickPreview';
import { EmptyState } from '@/components/EmptyState';
import type { Product, Category } from '@/lib/types';
import { getCategoryHref, isBundleProduct } from '@/lib/catalog';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  activeCategory: string;
  heading: string;
  description: string;
  initialType?: string;
  initialCondition?: string;
  initialSearchQuery?: string;
  initialSortBy?: string;
}

export function ProductsClient({
  initialProducts,
  categories,
  activeCategory,
  heading,
  description,
  initialType,
  initialCondition,
  initialSearchQuery,
  initialSortBy,
}: ProductsClientProps) {
  const [activeType, setActiveType] = useState<'all' | 'single' | 'bundle'>(
    initialType === 'single' || initialType === 'bundle' ? initialType : 'all',
  );
  const [activeCondition, setActiveCondition] = useState<'all' | 'new' | 'pre-owned'>(
    initialCondition === 'new' || initialCondition === 'pre-owned' ? initialCondition : 'all',
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>(
    initialSortBy === 'price-low' || initialSortBy === 'price-high' || initialSortBy === 'name'
      ? initialSortBy
      : 'default',
  );
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const products = initialProducts;
  const currentCategory =
    activeCategory === 'all'
      ? null
      : categories.find((category) => category.slug === activeCategory);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const productType = isBundleProduct(p) ? 'bundle' : 'single';
      const matchType = activeType === 'all' || productType === activeType;
      const matchCond =
        activeType === 'bundle' || activeCondition === 'all' || p.condition === activeCondition;

      // Search functionality
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        (p.specs &&
          Object.values(p.specs).some((val) => String(val).toLowerCase().includes(searchLower)));

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
    single: products.filter(
      (p) => !isBundleProduct(p) && (activeCategory === 'all' || p.category === activeCategory),
    ).length,
    bundle: products.filter(
      (p) => isBundleProduct(p) && (activeCategory === 'all' || p.category === activeCategory),
    ).length,
  };

  const conditionCounts = {
    new: products.filter(
      (p) =>
        !isBundleProduct(p) &&
        p.condition === 'new' &&
        (activeCategory === 'all' || p.category === activeCategory),
    ).length,
    'pre-owned': products.filter(
      (p) =>
        !isBundleProduct(p) &&
        p.condition === 'pre-owned' &&
        (activeCategory === 'all' || p.category === activeCategory),
    ).length,
  };

  const clearAllFilters = () => {
    setActiveType('all');
    setActiveCondition('all');
    setSearchQuery('');
    setSortBy('default');
    setShowMobileFilters(false);
  };

  const hasActiveFilters =
    activeType !== 'all' || activeCondition !== 'all' || searchQuery !== '' || sortBy !== 'default';

  return (
    <>
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-500">
            <Link href="/" className="transition hover:text-red-600">
              Home
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">Shop</span>
            {currentCategory && (
              <>
                <span className="mx-2 text-zinc-300">/</span>
                <span>{currentCategory.label}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                {currentCategory?.label ?? 'Cansan marketplace'}
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                {heading}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                {description}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Need help?
              </Link>
              <Link
                href="/delivery"
                className="hidden min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-red-300 hover:text-red-600 sm:inline-flex"
              >
                Delivery info
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mt-4 grid gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 sm:grid-cols-3 sm:p-5">
          <div>
            <p className="font-semibold text-zinc-900">WhatsApp-first ordering</p>
            <p className="mt-1">
              Confirm stock, get pricing help, and close orders without waiting on a form.
            </p>
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Harare delivery support</p>
            <p className="mt-1">
              Same-day delivery options and nationwide courier coordination for stocked items.
            </p>
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Bulk and business quotes</p>
            <p className="mt-1">
              Need multiple units? Use category pages to shortlist products, then request a quote
              fast.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm lg:block">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-950">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Categories
              </p>
              <div className="mt-3 space-y-1">
                <Link
                  href="/products"
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${activeCategory === 'all' ? 'bg-red-50 text-red-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'}`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={getCategoryHref(cat.slug)}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${activeCategory === cat.slug ? 'bg-red-50 text-red-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'}`}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Type</p>
              <div className="mt-3 space-y-1">
                {(
                  [
                    { value: 'all', label: 'Everything' },
                    { value: 'single', label: 'Products' },
                    { value: 'bundle', label: 'Bundles' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setActiveType(value);
                      if (value === 'bundle') setActiveCondition('all');
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${activeType === value ? 'bg-red-50 text-red-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {activeType !== 'bundle' && (
              <div className="mt-6 border-t border-zinc-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Condition
                </p>
                <div className="mt-3 space-y-1">
                  {(
                    [
                      { value: 'all', label: 'All conditions' },
                      { value: 'new', label: 'Brand new' },
                      { value: 'pre-owned', label: 'Pre-owned' },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setActiveCondition(value)}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${activeCondition === value ? 'bg-red-50 text-red-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <label
                htmlFor="desktop-sort"
                className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500"
              >
                Sort by
              </label>
              <select
                id="desktop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="mt-3 min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 focus:border-red-300 focus:outline-none"
              >
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </aside>

          <div>
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <input
                  type="search"
                  aria-label="Search products"
                  placeholder="Search products, brands, specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3 sm:hidden">
              <button
                onClick={() => setShowMobileFilters((value) => !value)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4.5h18M6.75 12h10.5M10.5 19.5h3"
                  />
                </svg>
                {showMobileFilters ? 'Hide filters' : 'Filters & sort'}
              </button>
              <p className="text-sm text-zinc-500">{filtered.length} shown</p>
            </div>

            <div
              className={`${showMobileFilters ? 'block' : 'hidden'} rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:block sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:hidden`}
            >
              {/* Filters row */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:self-center">
                    Type:
                  </span>
                  {(
                    [
                      { value: 'all', label: 'Everything' },
                      {
                        value: 'single',
                        label: `Products${typeCounts.single > 0 ? ` (${typeCounts.single})` : ''}`,
                      },
                      {
                        value: 'bundle',
                        label: `Bundles${typeCounts.bundle > 0 ? ` (${typeCounts.bundle})` : ''}`,
                      },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setActiveType(value);
                        if (value === 'bundle') setActiveCondition('all');
                      }}
                      className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
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

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 focus:border-red-300 focus:outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {activeType !== 'bundle' && (
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:self-center">
                    Condition:
                  </span>
                  {(
                    [
                      { value: 'all', label: 'All' },
                      {
                        value: 'new',
                        label: `Brand New${conditionCounts.new > 0 ? ` (${conditionCounts.new})` : ''}`,
                      },
                      {
                        value: 'pre-owned',
                        label: `Pre-owned${conditionCounts['pre-owned'] > 0 ? ` (${conditionCounts['pre-owned']})` : ''}`,
                      },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setActiveCondition(value)}
                      className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
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

              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href="/products"
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === 'all'
                      ? 'bg-red-600 text-white'
                      : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={getCategoryHref(cat.slug)}
                    className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeCategory === cat.slug
                        ? 'bg-red-600 text-white'
                        : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Results info */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                {searchQuery && ` matching "${searchQuery}"`}
                {activeCategory !== 'all' && ` in ${currentCategory?.label ?? activeCategory}`}
                {activeType !== 'all' &&
                  ` · ${activeType === 'bundle' ? 'Bundles' : 'Single products'}`}
                {activeCondition !== 'all' &&
                  ` · ${activeCondition === 'new' ? 'Brand New' : 'Pre-owned'}`}
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-medium text-red-600 transition hover:text-red-700"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all filters
                </button>
              )}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
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
                title={
                  searchQuery
                    ? `No products found for "${searchQuery}"`
                    : 'No products match your filters'
                }
                description={
                  searchQuery
                    ? 'Try different keywords or check your spelling.'
                    : 'Try adjusting your filters to see more products.'
                }
                action={{
                  label: hasActiveFilters ? 'Clear all filters' : 'Browse all products',
                  onClick: clearAllFilters,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <QuickPreview product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
