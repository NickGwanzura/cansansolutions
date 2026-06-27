import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatInsightDate, getFeaturedInsights, getInsightHref } from '@/lib/articles';
import { readProducts } from '@/lib/admin-data';
import { CATALOG_CATEGORIES, getCategoryHref, isSaImportProduct } from '@/lib/catalog';
import { buildAbsoluteMetadata } from '@/lib/seo';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Buy SSDs, Laptops & CCTV in Zimbabwe',
  description:
    'Shop SSDs, laptops, networking gear, CCTV, and accessories in Zimbabwe with fast delivery, secure payment options, and local support.',
  path: '/',
});

const KEY_CATEGORY_SLUGS = ['drives', 'sa-imports', 'laptops', 'networking', 'cctv', 'accessories'] as const;

const CATEGORY_CONTENT = {
  drives: {
    title: 'Storage',
    description: 'NVMe SSDs, external drives, and backup solutions for speed and reliability.',
    tone: 'from-red-50 via-white to-rose-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <ellipse cx="12" cy="5" rx="8.5" ry="2.5" />
        <path d="M20.5 12c0 1.4-3.8 2.5-8.5 2.5S3.5 13.4 3.5 12M3.5 5v14c0 1.4 3.8 2.5 8.5 2.5s8.5-1.1 8.5-2.5V5" />
      </svg>
    ),
  },
  'sa-imports': {
    title: 'SA Imports',
    description: 'Special-order products sourced from South Africa with a clear 5-day delivery lead time.',
    tone: 'from-rose-50 via-white to-red-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3.5 7.5h11v8h-11z" />
        <path d="M14.5 10.5h3.5l2.5 2.5V15.5H14.5z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  laptops: {
    title: 'Laptops',
    description: 'Work, school, and business laptops with local stock confirmation.',
    tone: 'from-zinc-50 via-white to-red-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="5" width="18" height="11" rx="1.5" />
        <path d="M2 19h20" />
      </svg>
    ),
  },
  networking: {
    title: 'Networking',
    description: 'Routers, switches, access points, and office-ready connectivity gear.',
    tone: 'from-orange-50 via-white to-red-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M4 9c4.8-4.7 11.2-4.7 16 0M7.5 12.5c2.9-2.8 6.1-2.8 9 0M11.2 16.2a1.1 1.1 0 1 1 1.6 1.6 1.1 1.1 0 0 1-1.6-1.6Z" />
      </svg>
    ),
  },
  cctv: {
    title: 'CCTV',
    description: 'Security cameras and surveillance kits for homes and businesses.',
    tone: 'from-red-50 via-white to-zinc-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M2.5 12c1.2-3.6 4.6-6 8.8-6 4.1 0 7.5 2.4 8.7 6-1.2 3.6-4.6 6-8.7 6-4.2 0-7.6-2.4-8.8-6Z" />
        <circle cx="11.3" cy="12" r="2.7" />
      </svg>
    ),
  },
  accessories: {
    title: 'Accessories',
    description: 'Adapters, keyboards, mice, cables, chargers, and practical add-ons.',
    tone: 'from-zinc-50 via-white to-red-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M8 4.5V7m8-2.5V7M12 7v4.5m0 0a3.5 3.5 0 1 0 3.5 3.5H12V11.5Zm0 0A3.5 3.5 0 1 1 8.5 15H12" />
      </svg>
    ),
  },
} as const;

const TRUST_BAR_ITEMS = [
  'Fast Delivery Zimbabwe',
  'Secure Payments',
  'Warranty Support',
  'Trusted Tech Supplier',
];

const WHY_CANSAN_ITEMS = [
  {
    title: 'Local Stock You Can Confirm',
    description: 'No guesswork. Check current availability before paying or traveling.',
  },
  {
    title: 'Fast Harare and Nationwide Delivery',
    description: 'Same-day dispatch options in Harare and reliable courier nationwide.',
  },
  {
    title: 'Competitive Pricing That Still Includes Support',
    description: 'Strong value pricing without disappearing after checkout.',
  },
  {
    title: 'Real Human Help Before and After Purchase',
    description: 'Get setup guidance, warranty direction, and product advice from a local team.',
  },
];

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

function getHeroSlideProducts(products: Product[], highlighted: Product[]): Product[] {
  const seen = new Set<string>();
  const withImages = [...highlighted, ...products]
    .filter((product) => {
      const image = (product.image || '').trim();
      return Boolean(image) && image !== '/images/products/placeholder.svg';
    })
    .filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });

  return withImages.slice(0, 14);
}

export default async function HomePage() {
  const products = await readProducts();
  const featuredInsights = getFeaturedInsights(3);

  const homepageProducts = getDailyHomepageProducts(products);

  const discountedProducts = products
    .filter((product) => product.inStock && product.originalPrice && product.originalPrice > product.price)
    .slice(0, 4);

  const trendingProducts = products
    .filter((product) => product.inStock && !discountedProducts.some((deal) => deal.id === product.id))
    .slice(0, 4);

  const heroProduct = discountedProducts[0] ?? homepageProducts[0];
  const heroSlideProducts = getHeroSlideProducts(products, homepageProducts);

  const homepageCategories = KEY_CATEGORY_SLUGS.map((slug) =>
    CATALOG_CATEGORIES.find((category) => category.slug === slug || category.id === slug)
  ).filter((category): category is (typeof CATALOG_CATEGORIES)[number] => Boolean(category));

  return (
    <div className="overflow-x-hidden bg-white text-zinc-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 px-6 py-18 text-white sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-orange-300/12 blur-3xl" />
          {heroSlideProducts.length > 0 ? (
            <>
              <div className="absolute -top-2 left-0 flex w-max gap-3 opacity-35 hero-slide-forward">
                {[...heroSlideProducts, ...heroSlideProducts].map((product, index) => (
                  <div
                    key={`hero-slide-a-${product.id}-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-lg sm:h-28 sm:w-28"
                  >
                    <Image
                      src={product.image || '/images/products/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 right-0 flex w-max gap-3 opacity-25 hero-slide-reverse">
                {[...heroSlideProducts.slice().reverse(), ...heroSlideProducts.slice().reverse()].map((product, index) => (
                  <div
                    key={`hero-slide-b-${product.id}-${index}`}
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-lg sm:h-24 sm:w-24"
                  >
                    <Image
                      src={product.image || '/images/products/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-red-300/30 bg-red-200/10 px-3 py-1 text-xs font-semibold tracking-wide text-red-100">
              Zimbabwe Tech Store
            </p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
              Trusted Zimbabwe Tech Store for SSDs, Laptops, Networking and CCTV
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-red-100 sm:text-lg">
              Buy genuine devices with fast delivery, secure payment options, and local support that stays available after you order.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-900 transition hover:-translate-y-0.5 hover:bg-red-50"
              >
                Shop Now
              </Link>
              <Link
                href="#shop-categories"
                className="inline-flex items-center justify-center rounded-full border border-red-200/40 bg-red-100/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-100/20"
              >
                Browse Categories
              </Link>
            </div>

            <ul className="mt-7 grid max-w-2xl gap-2 text-sm text-red-100 sm:grid-cols-2">
              <li>Fast Harare delivery and nationwide courier</li>
              <li>Pay with USD cash, swipe, bank transfer, EcoCash</li>
              <li>Warranty-backed products and post-sale support</li>
              <li>Bulk pricing available for offices and institutions</li>
            </ul>
          </div>

          {heroProduct ? (
            <Link
              href={`/products/${heroProduct.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-5 text-zinc-900 shadow-2xl shadow-red-950/30 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700">Featured Product</p>
              <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-zinc-900">{heroProduct.name}</h2>

              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                <Image
                  src={heroProduct.image || '/images/products/placeholder.svg'}
                  alt={heroProduct.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-contain p-4 transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">Today&apos;s price</p>
                  <p className="text-2xl font-extrabold text-zinc-950">
                    {formatCurrency(heroProduct.price, heroProduct.currency)}
                  </p>
                </div>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Fast selling
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BAR_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="shop-categories" className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Primary Categories</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">Shop by Tech Category in Zimbabwe</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-red-700 hover:text-red-800">
              View all products
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {homepageCategories.map((category) => {
              const content = CATEGORY_CONTENT[category.slug as keyof typeof CATEGORY_CONTENT];
              if (!content) {
                return null;
              }

              return (
                <Link
                  key={category.id}
                  href={getCategoryHref(category.slug)}
                  className={`group rounded-2xl border border-zinc-200 bg-gradient-to-br ${content.tone} p-5 transition hover:-translate-y-1 hover:shadow-lg`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-700 shadow-sm">
                    {content.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-zinc-900">{content.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{content.description}</p>
                  <span className="mt-4 inline-flex text-xs font-semibold text-red-700">Browse {content.title}</span>
                </Link>
              );
            })}
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
              Browse full catalog
            </Link>
          </div>

          {homepageProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Why Choose Cansan</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">Built for Zimbabwe Buyers Who Need Speed and Certainty</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {WHY_CANSAN_ITEMS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </article>
            ))}
          </div>
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
              See all live offers
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
