import Link from 'next/link';
import { BrandsStrip } from '@/components/BrandsStrip';
import { FeaturedSection } from './FeaturedSection';
import { readProducts } from '@/lib/admin-data';
import type { ReactElement } from 'react';
import { CATALOG_CATEGORIES } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { getActiveBanners } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const categoryIcons: Record<string, ReactElement> = {
  smartphone: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth={2}/>
    </svg>
  ),
  laptop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round"/>
      <path d="M1 20h22" strokeLinecap="round"/>
    </svg>
  ),
  desktop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <rect x="2" y="3" width="20" height="13" rx="2" strokeLinecap="round"/>
      <path d="M8 21h8M12 17v4" strokeLinecap="round"/>
    </svg>
  ),
  monitor: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round"/>
      <path d="M8 21h8M12 17v4" strokeLinecap="round"/>
      <circle cx="12" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
    </svg>
  ),
  'shield-camera': (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5.25 12 5.25S20.268 7.943 21.542 12c-1.274 4.057-5.065 6.75-9.542 6.75S3.732 16.057 2.458 12Z" />
    </svg>
  ),
  headphones: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 14.25c0-4.972 4.03-9 9-9s9 4.028 9 9v3.75a2.25 2.25 0 0 1-2.25 2.25H18a2.25 2.25 0 0 1-2.25-2.25v-1.5a2.25 2.25 0 0 1 2.25-2.25h.75V14.25a6.75 6.75 0 0 0-13.5 0v.75H6A2.25 2.25 0 0 1 8.25 17.25v1.5A2.25 2.25 0 0 1 6 21H5.25A2.25 2.25 0 0 1 3 18.75V14.25Z" />
    </svg>
  ),
  plug: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  printer: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
  ),
  cpu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round"/>
      <rect x="8" y="8" width="8" height="8" rx="1" strokeLinecap="round"/>
      <path d="M9 4V2M12 4V2M15 4V2M9 22v-2M12 22v-2M15 22v-2M4 9H2M4 12H2M4 15H2M22 9h-2M22 12h-2M22 15h-2" strokeLinecap="round"/>
    </svg>
  ),
  storage: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <ellipse cx="12" cy="5" rx="9" ry="3" strokeLinecap="round"/>
      <path d="M21 12c0 1.657-4.029 3-9 3S3 13.657 3 12" strokeLinecap="round"/>
      <path d="M3 5v14c0 1.657 4.029 3 9 3s9-1.343 9-3V5" strokeLinecap="round"/>
    </svg>
  ),
  bundle: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l.75.75 3.75-4.5m-3.75 9a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
    </svg>
  ),
  deals: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
};

const categoryColors: Record<string, { bg: string; icon: string; border: string }> = {
  laptops: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', border: 'border-blue-100' },
  printing: { bg: 'from-purple-50 to-purple-100', icon: 'text-purple-600', border: 'border-purple-100' },
  networking: { bg: 'from-green-50 to-green-100', icon: 'text-green-600', border: 'border-green-100' },
  desktops: { bg: 'from-zinc-50 to-zinc-100', icon: 'text-zinc-700', border: 'border-zinc-200' },
  monitors: { bg: 'from-cyan-50 to-cyan-100', icon: 'text-cyan-600', border: 'border-cyan-100' },
  accessories: { bg: 'from-amber-50 to-amber-100', icon: 'text-amber-600', border: 'border-amber-100' },
  audio: { bg: 'from-rose-50 to-rose-100', icon: 'text-rose-600', border: 'border-rose-100' },
  'pc-parts': { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', border: 'border-orange-100' },
  drives: { bg: 'from-indigo-50 to-indigo-100', icon: 'text-indigo-600', border: 'border-indigo-100' },
  mobile: { bg: 'from-pink-50 to-pink-100', icon: 'text-pink-600', border: 'border-pink-100' },
  cctv: { bg: 'from-teal-50 to-teal-100', icon: 'text-teal-600', border: 'border-teal-100' },
  bundles: { bg: 'from-red-50 to-red-100', icon: 'text-red-600', border: 'border-red-100' },
};

export default async function HomePage() {
  const products = await readProducts();
  const banners = await getActiveBanners();
  const dealProducts = products.filter((p) => p.dealLabel === 'Top Laptop Deals').slice(0, 6);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-24 text-white sm:py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-repeat opacity-100" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[120px]" />
          <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-red-900/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.6))]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium tracking-wide">Open today until 6pm</span>
              </div>
              <h1 className="font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Tech that works for you.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg">
                Laptops, desktops, networking, CCTV, audio, and more. Ordered in seconds via WhatsApp.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-500"
                >
                  Shop Products
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="https://wa.me/263773754747?text=Hi%20Cansan%20Solutions%2C%20I'm%20interested%20in%20your%20products."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium backdrop-blur-sm transition hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <svg className="text-green-500" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Genuine Products
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="text-blue-500" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  Harare Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="text-amber-500" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.038a5.25 5.25 0 0 0 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                  Expert Advice
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {CATALOG_CATEGORIES.slice(0, 6).map((cat) => {
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/90 transition group-hover:scale-110 group-hover:bg-red-600">
                        {categoryIcons[cat.icon] ? (
                          <span className="scale-75">{categoryIcons[cat.icon]}</span>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold text-white/95">{cat.label}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Browse</p>
              <h2 className="mt-1 text-2xl font-bold text-zinc-900">Shop by Category</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {CATALOG_CATEGORIES.map((cat) => {
              const colors = categoryColors[cat.id] ?? { bg: 'from-zinc-50 to-zinc-100', icon: 'text-zinc-700', border: 'border-zinc-200' };
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-4 text-center transition hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ${colors.icon} transition group-hover:scale-110`}>
                    {categoryIcons[cat.icon] ?? categoryIcons.deals}
                  </div>
                  <span className="text-xs font-semibold leading-tight text-zinc-800">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <BrandsStrip />

      {/* Dynamic Banners - Managed via Admin */}
      {banners.map((banner) => (
        <section key={banner.id} className="bg-white px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <Link href={banner.buttonLink || '/products'} className="group relative block overflow-hidden rounded-3xl bg-zinc-100">
              <div className="relative aspect-[21/9] w-full overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                  <div className="max-w-lg">
                    {banner.badge && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white mb-4">
                        {banner.badge}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-sm sm:text-base text-zinc-300 mb-6 max-w-md">
                        {banner.subtitle}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition group-hover:bg-zinc-100">
                      {banner.buttonText || 'Shop Now'}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ))}

      {/* Top Laptop Deals */}
      {dealProducts.length > 0 && (
        <section className="bg-zinc-50 px-6 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Savings</p>
                <h2 className="mt-1 text-2xl font-bold text-zinc-900">Our Top Laptop Deals</h2>
              </div>
              <Link href="/products?category=laptops" className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-2">
                View all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {dealProducts.map((product) => (
                <div key={product.id} className="w-[260px] shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <FeaturedSection products={products} />

      {/* Why shop with us */}
      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900">Why shop with Cansan?</h2>
            <p className="mt-2 text-sm text-zinc-500">Genuine products, simple ordering, and reliable support.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Networking & Wi-Fi Setup', desc: 'Home or office. We supply and install routers, access points, and structured cabling.', href: '/services' },
              { title: 'WhatsApp Ordering', desc: 'No account needed. Add to cart, send a message, and we handle the rest.', href: '/products' },
              { title: 'Same-Day Delivery', desc: 'Harare orders delivered today. Nationwide courier available.', href: '/contact' },
              { title: 'After-Sales Support', desc: 'Setup help, warranty claims, and troubleshooting. We do not disappear.', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-red-600 group-hover:underline">
                  Learn more
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">About Cansan</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">Your trusted tech partner in Zimbabwe</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                We started small, helping friends and family source the right devices, and grew into a full-service tech retailer. Today we carry 200+ products backed by personal support and honest advice.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Whether you are upgrading your laptop, setting up a home network, or kitting out your office, we are here to help you make the right choice.
              </p>
              <div className="mt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Read our story
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 shadow-sm">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(24,24,27,0.08),transparent_40%)]" />
                <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-400">Business Ready</p>
                      <p className="mt-2 text-sm font-medium text-zinc-500">Laptops, accessories, and support for work, school, and everyday use.</p>
                    </div>
                    <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                      In Stock
                    </span>
                  </div>

                  <div className="flex flex-1 items-center justify-center py-6">
                    <img
                      src="/images/products/laptop-new.svg"
                      alt="Laptop product showcase"
                      className="h-full max-h-64 w-full max-w-md object-contain drop-shadow-[0_24px_30px_rgba(24,24,27,0.16)]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Laptops & Computing</p>
                      <p className="text-xs text-zinc-500">Reliable devices sourced for performance and value.</p>
                    </div>
                    <Link
                      href="/products?category=laptops"
                      className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Browse
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-zinc-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to order?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
            Chat with us on WhatsApp. We will help you find the right product at the right price.
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/263773754747?text=Hi%20Cansan%20Solutions%2C%20I'm%20interested%20in%20your%20products."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Start Chat on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Usually replies within minutes</p>
        </div>
      </section>
    </div>
  );
}
