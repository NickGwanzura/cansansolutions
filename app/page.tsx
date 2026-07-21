import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { formatInsightDate, getFeaturedInsights, getInsightHref } from '@/lib/articles';
import { getHomepageBanners, readProducts } from '@/lib/admin-data';
import { CATALOG_CATEGORIES, getCategoryHref, isSaImportProduct } from '@/lib/catalog';
import { buildAbsoluteMetadata } from '@/lib/seo';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { HeroProductSlider } from '@/components/HeroProductSlider';
import { HeroBannerCarousel } from '@/components/HeroBannerCarousel';
import { WA_NUMBER } from '@/lib/site';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Buy SSDs, Laptops & CCTV in Zimbabwe',
  description:
    'Shop SSDs, laptops, networking gear, CCTV, and accessories in Zimbabwe with fast delivery, secure payment options, and local support.',
  path: '/',
});

const CATEGORY_ICONS: Record<string, ReactNode> = {
  laptop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="18" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </svg>
  ),
  printer: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6.5 8V4h11v4M6.5 17.5H5A2 2 0 0 1 3 15.5v-4A2 2 0 0 1 5 9.5h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.5" />
      <rect x="6.5" y="13" width="11" height="7" rx="0.75" />
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 9c4.8-4.7 11.2-4.7 16 0M7.5 12.5c2.9-2.8 6.1-2.8 9 0M11.2 16.2a1.1 1.1 0 1 1 1.6 1.6 1.1 1.1 0 0 1-1.6-1.6Z" />
    </svg>
  ),
  desktop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M9 20h6M12 15v5" />
    </svg>
  ),
  monitor: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
      <path d="M9 20h6M12 16.5v3.5" />
    </svg>
  ),
  plug: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M8 4.5V7m8-2.5V7M12 7v4.5m0 0a3.5 3.5 0 1 0 3.5 3.5H12V11.5Zm0 0A3.5 3.5 0 1 1 8.5 15H12" />
    </svg>
  ),
  headphones: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4.5" height="6" rx="1.5" />
      <rect x="16.5" y="14" width="4.5" height="6" rx="1.5" />
    </svg>
  ),
  cpu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="7" y="7" width="10" height="10" rx="1.2" />
      <path d="M9.5 7V4m5 3V4m0 20v-3m-5 3v-3M7 9.5H4m3 5H4m16-5h-3m3 5h-3" />
    </svg>
  ),
  storage: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <ellipse cx="12" cy="5" rx="8.5" ry="2.5" />
      <path d="M20.5 12c0 1.4-3.8 2.5-8.5 2.5S3.5 13.4 3.5 12M3.5 5v14c0 1.4 3.8 2.5 8.5 2.5s8.5-1.1 8.5-2.5V5" />
    </svg>
  ),
  truck: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3.5 7.5h11v8h-11z" />
      <path d="M14.5 10.5h3.5l2.5 2.5V15.5H14.5z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  ),
  smartphone: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  'shield-camera': (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M2.5 12c1.2-3.6 4.6-6 8.8-6 4.1 0 7.5 2.4 8.7 6-1.2 3.6-4.6 6-8.7 6-4.2 0-7.6-2.4-8.8-6Z" />
      <circle cx="11.3" cy="12" r="2.7" />
    </svg>
  ),
  deals: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M11.5 3.5 4 11l8.5 9.5L20 13z" />
      <circle cx="9" cy="8" r="1.4" />
    </svg>
  ),
};

const HERO_TRUST_POINTS = [
  'Fast Harare delivery and nationwide courier',
  'Pay with USD cash, swipe, bank transfer, EcoCash',
  'Warranty-backed products and post-sale support',
  'Bulk pricing available for offices and institutions',
];

const FEATURE_TILES = [
  {
    title: 'Genuine Products',
    stat: '100% Verified',
    description: 'No guesswork. Check current availability before paying or traveling.',
  },
  {
    title: 'Fast Harare Delivery',
    stat: 'Same-Day in Harare',
    description: 'Same-day dispatch options in Harare and reliable courier nationwide.',
  },
  {
    title: 'WhatsApp Ordering',
    stat: 'Reply in Minutes',
    description: 'Get setup guidance, warranty direction, and product advice from a local team.',
    href: `https://wa.me/${WA_NUMBER}`,
    external: true,
  },
  {
    title: 'Bulk & Institution Pricing',
    stat: 'Custom Quotes',
    description: 'Strong value pricing for offices and schools, without disappearing after checkout.',
    href: '/bulk-orders',
  },
] as const;

const SERVICE_LINKS = [
  { label: 'Delivery Information', href: '/delivery' },
  { label: 'Payment Options', href: '/payments' },
  { label: 'Warranty Policy', href: '/warranty' },
  { label: 'Bulk Orders', href: '/bulk-orders' },
];

const HOMEPAGE_FEATURED_COUNT = 8;
const HOMEPAGE_LAPTOP_COUNT = 2;
const HOMEPAGE_SA_IMPORT_COUNT = 3;
const HARARE_TIME_ZONE = 'Africa/Harare';

function isLaptopProduct(product: Product) {
  return product.category.toLowerCase().includes('laptop');
}

function getHarareDayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HARARE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rankForDailyRotation(products: Product[], dayKey: string, salt: string) {
  return [...products].sort((left, right) => {
    const leftScore = hashString(`${dayKey}:${salt}:${left.id}:${left.slug}`);
    const rightScore = hashString(`${dayKey}:${salt}:${right.id}:${right.slug}`);
    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    const featuredDelta = Number(right.featured) - Number(left.featured);
    if (featuredDelta !== 0) {
      return featuredDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

function takeFromPool({
  pool,
  count,
  usedIds,
  dayKey,
  salt,
}: {
  pool: Product[];
  count: number;
  usedIds: Set<string>;
  dayKey: string;
  salt: string;
}) {
  if (count <= 0 || pool.length === 0) {
    return [] as Product[];
  }

  const ranked = rankForDailyRotation(pool, dayKey, salt);
  const picked: Product[] = [];

  for (const product of ranked) {
    if (usedIds.has(product.id)) {
      continue;
    }
    usedIds.add(product.id);
    picked.push(product);

    if (picked.length >= count) {
      break;
    }
  }

  return picked;
}

function takeMixedByCategory({
  pool,
  count,
  usedIds,
  dayKey,
  salt,
}: {
  pool: Product[];
  count: number;
  usedIds: Set<string>;
  dayKey: string;
  salt: string;
}) {
  if (count <= 0 || pool.length === 0) {
    return [] as Product[];
  }

  const ranked = rankForDailyRotation(pool, dayKey, salt);
  const picks: Product[] = [];
  const categoryChosen = new Set<string>();

  for (const product of ranked) {
    if (usedIds.has(product.id) || categoryChosen.has(product.category)) {
      continue;
    }
    usedIds.add(product.id);
    categoryChosen.add(product.category);
    picks.push(product);

    if (picks.length >= count) {
      return picks;
    }
  }

  for (const product of ranked) {
    if (usedIds.has(product.id)) {
      continue;
    }
    usedIds.add(product.id);
    picks.push(product);

    if (picks.length >= count) {
      break;
    }
  }

  return picks;
}

function getDailyHomepageProducts(products: Product[]) {
  const stockAwarePool = products.filter((product) => product.inStock);
  const sourcePool = stockAwarePool.length > 0 ? stockAwarePool : products;
  const dayKey = getHarareDayKey();
  const usedIds = new Set<string>();
  const selected: Product[] = [];
  const allLaptops = sourcePool.filter((product) => isLaptopProduct(product));
  const allSaImports = sourcePool.filter((product) => isSaImportProduct(product));

  selected.push(
    ...takeFromPool({
      pool: sourcePool.filter((product) => isLaptopProduct(product)),
      count: HOMEPAGE_LAPTOP_COUNT,
      usedIds,
      dayKey,
      salt: 'laptops',
    })
  );

  const laptopsSelected = selected.filter((product) => isLaptopProduct(product)).length;
  if (laptopsSelected < HOMEPAGE_LAPTOP_COUNT) {
    selected.push(
      ...takeFromPool({
        pool: allLaptops.filter((product) => !usedIds.has(product.id)),
        count: HOMEPAGE_LAPTOP_COUNT - laptopsSelected,
        usedIds,
        dayKey,
        salt: 'laptops-fallback',
      })
    );
  }

  selected.push(
    ...takeFromPool({
      pool: sourcePool.filter((product) => isSaImportProduct(product)),
      count: HOMEPAGE_SA_IMPORT_COUNT,
      usedIds,
      dayKey,
      salt: 'sa-imports',
    })
  );

  const saSelected = selected.filter((product) => isSaImportProduct(product)).length;
  if (saSelected < HOMEPAGE_SA_IMPORT_COUNT) {
    selected.push(
      ...takeFromPool({
        pool: allSaImports.filter((product) => !usedIds.has(product.id)),
        count: HOMEPAGE_SA_IMPORT_COUNT - saSelected,
        usedIds,
        dayKey,
        salt: 'sa-imports-fallback',
      })
    );
  }

  const remainingCount = HOMEPAGE_FEATURED_COUNT - selected.length;
  if (remainingCount > 0) {
    selected.push(
      ...takeMixedByCategory({
        pool: sourcePool.filter(
          (product) => !usedIds.has(product.id) && !isLaptopProduct(product) && !isSaImportProduct(product)
        ),
        count: remainingCount,
        usedIds,
        dayKey,
        salt: 'mixed-categories',
      })
    );
  }

  if (selected.length < HOMEPAGE_FEATURED_COUNT) {
    selected.push(
      ...takeFromPool({
        pool: sourcePool.filter((product) => !usedIds.has(product.id)),
        count: HOMEPAGE_FEATURED_COUNT - selected.length,
        usedIds,
        dayKey,
        salt: 'fallback',
      })
    );
  }

  return selected.slice(0, HOMEPAGE_FEATURED_COUNT);
}

export default async function HomePage() {
  const products = await readProducts();
  const banners = await getHomepageBanners();
  const featuredInsights = getFeaturedInsights(3);

  const homepageProducts = getDailyHomepageProducts(products);

  const discountedProducts = products
    .filter((product) => product.inStock && product.originalPrice && product.originalPrice > product.price)
    .slice(0, 4);

  const trendingProducts = products
    .filter((product) => product.inStock && !discountedProducts.some((deal) => deal.id === product.id))
    .slice(0, 4);

  const heroSlideProducts = (() => {
    const seen = new Set<string>();
    const pool = [...discountedProducts, ...homepageProducts, ...trendingProducts];
    const deduped: Product[] = [];

    for (const product of pool) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      deduped.push(product);
      if (deduped.length >= 5) break;
    }

    return deduped;
  })();

  return (
    <div className="overflow-x-hidden bg-white text-zinc-900">
      {banners.length > 0 ? (
        <section className="bg-white px-6 pt-6 sm:pt-8">
          <div className="mx-auto max-w-7xl">
            <HeroBannerCarousel banners={banners} />
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-white px-6 py-10 sm:py-14">
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-red-700">
              Zimbabwe&apos;s WhatsApp-First Tech Store
            </p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight text-zinc-950 sm:text-5xl">
              Trusted Zimbabwe Tech Store for SSDs, Laptops, Networking and CCTV
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Buy genuine devices with fast delivery, secure payment options, and local support that stays available after you order.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Shop Now
              </Link>
              <Link
                href="#shop-categories"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:border-zinc-400"
              >
                Browse Categories
              </Link>
            </div>

            <ul className="mt-7 grid max-w-xl gap-2.5 text-sm text-zinc-600 sm:grid-cols-2">
              {HERO_TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <HeroProductSlider products={heroSlideProducts} />
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURE_TILES.map((tile) => {
            const content = (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700">{tile.stat}</p>
                <h3 className="mt-2 text-lg font-bold text-zinc-900">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{tile.description}</p>
                {'href' in tile ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                    {tile.title === 'WhatsApp Ordering' ? 'Chat now' : 'Get a quote'}
                    <span aria-hidden="true">→</span>
                  </span>
                ) : null}
              </>
            );

            if ('href' in tile) {
              return (
                <Link
                  key={tile.title}
                  href={tile.href}
                  target={'external' in tile && tile.external ? '_blank' : undefined}
                  rel={'external' in tile && tile.external ? 'noreferrer' : undefined}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {content}
                </Link>
              );
            }

            return (
              <article key={tile.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section id="shop-categories" className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Primary Categories</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">Shop by Tech Category in Zimbabwe</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
              View all products
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {CATALOG_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={getCategoryHref(category.slug)}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-3 py-5 text-center transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
              >
                <span aria-hidden="true" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 text-red-700 transition group-hover:border-red-300 group-hover:bg-red-50">
                  {CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS.deals}
                </span>
                <span className="text-xs font-semibold leading-tight text-zinc-900">{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-products" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Featured Products</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">Top SSD, Laptop, Networking and CCTV Picks</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Daily-rotating mix: 2 laptops, 3 SA imports, plus 3 products from other categories for faster comparison.
              </p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-red-700 hover:text-red-800">
              Browse full catalog →
            </Link>
          </div>

          {homepageProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {homepageProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-500">
              Featured products will appear here as soon as inventory is loaded.
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Best Deals and Trending</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">Limited Offers and Fast-Selling Products</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-red-700 hover:text-red-800">
              See all deals →
            </Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-zinc-900">Best Deals</h3>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">Discounted now</span>
              </div>

              {discountedProducts.length > 0 ? (
                <ul className="space-y-3">
                  {discountedProducts.map((product) => {
                    const discount = product.originalPrice
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;

                    return (
                      <li key={product.id}>
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-red-300 hover:shadow-sm"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{product.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {product.inStock ? 'In stock and fast moving' : 'Stock updates available'}
                            </p>
                            {product.dealLabel ? (
                              <span className="mt-1.5 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                {product.dealLabel}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-zinc-900">{formatCurrency(product.price, product.currency)}</p>
                            <p className="text-xs font-semibold text-red-700">Save {discount}%</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                  New deal products will appear here automatically once promotional pricing is added.
                </p>
              )}
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-zinc-900">More to Explore</h3>
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Fast selling</span>
              </div>

              {trendingProducts.length > 0 ? (
                <ul className="space-y-3">
                  {trendingProducts.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-red-300 hover:shadow-sm"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{product.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">Popular with home and business buyers</p>
                        </div>
                        <p className="text-sm font-bold text-zinc-900">{formatCurrency(product.price, product.currency)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                  Trending products will show here after your first in-stock listings are published.
                </p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Buying Guides</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">SEO Content That Captures Ready-to-Buy Traffic</h2>
              <p className="mt-2 max-w-3xl text-sm text-zinc-600">
                Educational content answers buyer questions early and routes high-intent visitors directly to relevant categories.
              </p>
            </div>
            <Link href="/insights" className="text-sm font-semibold text-red-700 hover:text-red-800">
              Read all guides
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredInsights.map((article) => (
              <article key={article.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{article.categoryLabel}</p>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold text-zinc-900">{article.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">{article.excerpt}</p>
                <p className="mt-4 text-xs text-zinc-500">{formatInsightDate(article.publishedAt)}</p>
                <Link href={getInsightHref(article.slug)} className="mt-4 inline-flex text-sm font-semibold text-red-700 hover:text-red-800">
                  Read guide
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
