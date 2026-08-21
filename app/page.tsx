import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { formatInsightDate, getFeaturedInsights, getInsightHref } from '@/lib/articles';
import { readProducts } from '@/lib/admin-data';
import { CATALOG_CATEGORIES, getCategoryHref, isSaImportProduct } from '@/lib/catalog';
import { buildAbsoluteMetadata } from '@/lib/seo';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { HeroProductSlider } from '@/components/HeroProductSlider';
import { WA_NUMBER } from '@/lib/site';

// Dynamic, not ISR: DATABASE_URL is only injected at container runtime (not
// available during the Docker build), so static prerendering at build time
// bakes in an empty product list until the ISR window happens to lapse.
// Homepage product data also depends on the current Harare calendar day
// (see getDailyHomepageProducts), so it should never be served stale anyway.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Buy SSDs, Laptops & CCTV in Zimbabwe',
  description:
    'Shop SSDs, laptops, networking gear, CCTV, and accessories in Zimbabwe with fast delivery, secure payment options, and local support.',
  path: '/',
});

const CATEGORY_ICONS: Record<string, ReactNode> = {
  laptop: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="5" width="18" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </svg>
  ),
  printer: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M6.5 8V4h11v4M6.5 17.5H5A2 2 0 0 1 3 15.5v-4A2 2 0 0 1 5 9.5h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.5" />
      <rect x="6.5" y="13" width="11" height="7" rx="0.75" />
    </svg>
  ),
  network: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M4 9c4.8-4.7 11.2-4.7 16 0M7.5 12.5c2.9-2.8 6.1-2.8 9 0M11.2 16.2a1.1 1.1 0 1 1 1.6 1.6 1.1 1.1 0 0 1-1.6-1.6Z" />
    </svg>
  ),
  desktop: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M9 20h6M12 15v5" />
    </svg>
  ),
  monitor: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
      <path d="M9 20h6M12 16.5v3.5" />
    </svg>
  ),
  plug: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M8 4.5V7m8-2.5V7M12 7v4.5m0 0a3.5 3.5 0 1 0 3.5 3.5H12V11.5Zm0 0A3.5 3.5 0 1 1 8.5 15H12" />
    </svg>
  ),
  headphones: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4.5" height="6" rx="1.5" />
      <rect x="16.5" y="14" width="4.5" height="6" rx="1.5" />
    </svg>
  ),
  cpu: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="7" y="7" width="10" height="10" rx="1.2" />
      <path d="M9.5 7V4m5 3V4m0 20v-3m-5 3v-3M7 9.5H4m3 5H4m16-5h-3m3 5h-3" />
    </svg>
  ),
  storage: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <ellipse cx="12" cy="5" rx="8.5" ry="2.5" />
      <path d="M20.5 12c0 1.4-3.8 2.5-8.5 2.5S3.5 13.4 3.5 12M3.5 5v14c0 1.4 3.8 2.5 8.5 2.5s8.5-1.1 8.5-2.5V5" />
    </svg>
  ),
  truck: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M3.5 7.5h11v8h-11z" />
      <path d="M14.5 10.5h3.5l2.5 2.5V15.5H14.5z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  ),
  smartphone: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  'shield-camera': (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M2.5 12c1.2-3.6 4.6-6 8.8-6 4.1 0 7.5 2.4 8.7 6-1.2 3.6-4.6 6-8.7 6-4.2 0-7.6-2.4-8.8-6Z" />
      <circle cx="11.3" cy="12" r="2.7" />
    </svg>
  ),
  deals: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M11.5 3.5 4 11l8.5 9.5L20 13z" />
      <circle cx="9" cy="8" r="1.4" />
    </svg>
  ),
};

const FEATURE_TILES = [
  {
    title: 'Genuine Products',
    stat: '100% Verified',
    description: 'No guesswork. Check current availability before paying or traveling.',
    action: 'Shop verified stock',
    href: '/products',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3 7 3v5c0 4.4-2.9 8.3-7 10-4.1-1.7-7-5.6-7-10V6l7-3Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 11.5 2.2 2.2 4.8-4.8" />
      </svg>
    ),
  },
  {
    title: 'Fast Harare Delivery',
    stat: 'Same-Day in Harare',
    description: 'Same-day dispatch options in Harare and reliable courier nationwide.',
    action: 'View delivery options',
    href: '/delivery',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h11v10H3zM14 10h3l3 3v3h-6z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'WhatsApp Ordering',
    stat: 'Reply in Minutes',
    description: 'Get setup guidance, warranty direction, and product advice from a local team.',
    action: 'Chat now',
    href: `https://wa.me/${WA_NUMBER}`,
    external: true,
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.7 9.2c.2 2 2.1 4 4.1 4.2l1.2-1.1 1.8.8c.2.1.3.3.2.5-.3 1-1.2 1.5-2.2 1.3-3.3-.6-5.8-3.1-6-5.5-.1-.9.4-1.8 1.3-2.1.2-.1.4 0 .5.2l.8 1.8-1.1 1.2Z"
        />
      </svg>
    ),
  },
  {
    title: 'Bulk & Institution Pricing',
    stat: 'Custom Quotes',
    description:
      'Strong value pricing for offices and schools, without disappearing after checkout.',
    action: 'Get a quote',
    href: '/bulk-orders',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 21h18M5 21V5h9v16M14 9h5v12M8 8h3M8 12h3M8 16h3"
        />
      </svg>
    ),
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
    }),
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
      }),
    );
  }

  selected.push(
    ...takeFromPool({
      pool: sourcePool.filter((product) => isSaImportProduct(product)),
      count: HOMEPAGE_SA_IMPORT_COUNT,
      usedIds,
      dayKey,
      salt: 'sa-imports',
    }),
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
      }),
    );
  }

  const remainingCount = HOMEPAGE_FEATURED_COUNT - selected.length;
  if (remainingCount > 0) {
    selected.push(
      ...takeMixedByCategory({
        pool: sourcePool.filter(
          (product) =>
            !usedIds.has(product.id) && !isLaptopProduct(product) && !isSaImportProduct(product),
        ),
        count: remainingCount,
        usedIds,
        dayKey,
        salt: 'mixed-categories',
      }),
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
      }),
    );
  }

  return selected.slice(0, HOMEPAGE_FEATURED_COUNT);
}

export default async function HomePage() {
  const products = await readProducts();
  const featuredInsights = getFeaturedInsights(3);

  const homepageProducts = getDailyHomepageProducts(products);

  const heroSlideProducts = (() => {
    const seen = new Set<string>();
    const pool = [...homepageProducts, ...products.filter((product) => product.inStock)];
    const deduped: Product[] = [];

    for (const product of pool) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      deduped.push(product);
      if (deduped.length >= 5) break;
    }

    return deduped;
  })();

  const categoryShowcase = CATALOG_CATEGORIES.slice(0, 7);

  return (
    <div className="overflow-x-hidden bg-[#f7f7f7] text-zinc-900">
      <HeroProductSlider products={heroSlideProducts} />

      <section id="shop-categories" className="bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                Browse by category
              </p>
              <h2 className="mt-1 text-2xl font-bold text-zinc-900">Shop by category</h2>
            </div>
            <Link
              href="#shop-categories"
              className="text-sm font-semibold text-red-700 hover:text-red-800"
            >
              View all categories →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {categoryShowcase.map((category) => (
              <Link
                key={category.id}
                href={getCategoryHref(category.slug)}
                className="group min-w-36 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:min-w-40"
              >
                <span
                  aria-hidden="true"
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 transition group-hover:bg-red-600 group-hover:text-white"
                >
                  {CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS.deals}
                </span>
                <p className="mt-3 text-sm font-semibold text-zinc-800 transition group-hover:text-red-700">
                  {category.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto grid max-w-7xl gap-0 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURE_TILES.map((tile) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    {tile.icon}
                  </span>
                  <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700">
                    {tile.stat}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-zinc-900 sm:text-lg">
                  {tile.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-zinc-600">
                  {tile.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                  {tile.action}
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </>
            );

            return (
              <Link
                key={tile.title}
                href={tile.href}
                target={'external' in tile && tile.external ? '_blank' : undefined}
                rel={'external' in tile && tile.external ? 'noreferrer' : undefined}
                className="group flex min-h-[108px] flex-col border-zinc-200 px-2 py-4 transition duration-200 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 sm:px-5 sm:[&:not(:first-child)]:border-l"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section id="featured-products" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                New arrivals
              </p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">Fresh tech for every setup</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Daily-rotating mix: 2 laptops, 3 SA imports, plus 3 products from other categories
                for faster comparison.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-red-700 hover:text-red-800"
            >
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

      <section className="bg-zinc-50 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                Buying Guides
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                Guides for smarter buying
              </h2>
            </div>
            <Link
              href="/insights"
              className="text-sm font-semibold text-red-700 hover:text-red-800"
            >
              Read all guides
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredInsights.map((article) => (
              <article
                key={article.slug}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_8px_30px_rgba(24,24,27,0.05)] transition duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_16px_38px_rgba(220,38,38,0.10)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-red-600 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-transparent"
                />
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  {article.categoryLabel}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold text-zinc-900">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
                  {article.excerpt}
                </p>
                <p className="mt-5 inline-flex w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                  {formatInsightDate(article.publishedAt)}
                </p>
                <Link
                  href={getInsightHref(article.slug)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800"
                >
                  Read guide
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-16 items-center justify-between rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-red-500/60 hover:bg-red-600/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400"
            >
              <span>{item.label}</span>
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-red-400 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
