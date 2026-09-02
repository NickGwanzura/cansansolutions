'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { BrandLogo } from './BrandLogo';
import { CartDrawer } from './CartDrawer';
import { WA_NUMBER, SITE_PHONE } from '@/lib/site';
import { CATALOG_CATEGORIES, getCategoryHref } from '@/lib/catalog';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Store' },
  { href: '/services', label: 'Services' },
  { href: '/insights', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
];

const QUICK_CATEGORY_SLUGS = ['laptops', 'networking', 'cctv'];

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const quickCategories = QUICK_CATEGORY_SLUGS.map((slug) =>
    CATALOG_CATEGORIES.find((category) => category.slug === slug),
  ).filter((category): category is (typeof CATALOG_CATEGORIES)[number] => Boolean(category));

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    setMenuOpen(false);
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <>
      {/* Utility bar */}
      <div className="hidden bg-red-700 text-red-50 text-xs sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="text-green-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
                Genuine products with local support
              </span>
              <span className="hidden items-center gap-1.5 md:flex">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="text-amber-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Fast Harare delivery & nationwide courier
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/contact" className="hover:text-white transition">
                Help &amp; Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white shadow-[0_8px_24px_-18px_rgba(24,24,27,0.16)]">
        {/* Main bar */}
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="group shrink-0 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
            aria-label="Cansan Electronics"
          >
            <BrandLogo priority className="w-28 sm:w-32" />
          </Link>

          <button
            type="button"
            onClick={() => setCategoriesOpen((value) => !value)}
            className="hidden min-h-12 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 xl:inline-flex"
            aria-expanded={categoriesOpen}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Browse departments
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-2xl md:block">
            <div className="relative">
              <svg
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
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
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search for laptops, SSDs, CCTV..."
                aria-label="Search products"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-500 shadow-sm transition focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden min-h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 lg:inline-flex"
            >
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium text-zinc-400">Need help?</span>
                <span>Talk to sales</span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 lg:flex">
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s7-5.2 7-12A7 7 0 1 0 5 9c0 6.8 7 12 7 12Z"
                />
                <circle cx="12" cy="9" r="2" />
              </svg>
              <span>
                <span className="block text-[10px] leading-none text-zinc-400">Deliver to</span>
                <strong className="font-semibold">Harare</strong>
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              aria-label="Open cart"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white shadow">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Category / nav row */}
        <div className="hidden border-t border-zinc-200 bg-zinc-50 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <nav className="flex items-center gap-1">
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen((value) => !value)}
                  aria-expanded={categoriesOpen}
                  className="flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-3 text-sm font-bold text-zinc-900 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  All Categories
                  <svg
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-[680px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl">
                    <div className="grid grid-cols-3 gap-1">
                      {CATALOG_CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          href={getCategoryHref(category.slug)}
                          onClick={() => setCategoriesOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-red-50 hover:text-red-700"
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="mt-3 block rounded-lg bg-zinc-50 px-3 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      View all products →
                    </Link>
                  </div>
                )}
              </div>

              {quickCategories.map((category) => (
                <Link
                  key={category.id}
                  href={getCategoryHref(category.slug)}
                  className={`flex min-h-11 items-center rounded-lg px-3 py-3 text-sm font-medium transition ${pathname.startsWith(getCategoryHref(category.slug)) ? 'bg-red-50 text-red-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'}`}
                >
                  {category.label}
                </Link>
              ))}

              {navLinks.slice(1).map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center rounded-lg px-3 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-red-50 text-red-700'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              {SITE_PHONE}
            </a>
          </div>
        </div>

        {categoriesOpen && (
          <div className="hidden border-t border-zinc-200 bg-white/95 backdrop-blur xl:block">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <div className="grid grid-cols-5 gap-2">
                {CATALOG_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={getCategoryHref(category.slug)}
                    onClick={() => setCategoriesOpen(false)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-zinc-100 bg-white px-4 py-4 shadow-lg shadow-zinc-900/5 md:hidden">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
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
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  pathname.startsWith('/products')
                    ? 'bg-red-50 text-red-700'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                All Products
              </Link>

              <div className="flex flex-wrap gap-2 px-3 py-2">
                {quickCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={getCategoryHref(category.slug)}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>

              {navLinks.slice(1).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    pathname === href ? 'bg-red-50 text-red-700' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
