import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProductJsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { AddToCartButton } from './AddToCartButton';
import { getProductBySlug, readProducts } from '@/lib/admin-data';
import { getCategoryBySlug, getCategoryHref, isBundleProduct, isSaImportProduct } from '@/lib/catalog';
import { truncateText, stripHtml, buildAbsoluteMetadata } from '@/lib/seo';
import { formatCurrency } from '@/lib/utils';
import { getBrandForProduct, getBrandHref } from '@/lib/brands';
import type { Product } from '@/lib/types';
import { SITE_PHONE_E164 } from '@/lib/site';

export const revalidate = 300;

type RouteParams = Promise<{ slug: string }>;

function getProductImage(productImage: string) {
  return productImage || '/images/products/placeholder.svg';
}

function getCorpus(product: Pick<Product, 'name' | 'description' | 'tags' | 'specs' | 'category'>) {
  const specsText = Object.entries(product.specs ?? {})
    .map(([key, value]) => `${key} ${value}`)
    .join(' ');
  return `${product.name} ${stripHtml(product.description)} ${product.tags.join(' ')} ${specsText} ${product.category}`.toLowerCase();
}

function isLikelyExternalSsd(product: Pick<Product, 'name' | 'description' | 'tags' | 'specs' | 'category'>) {
  const corpus = getCorpus(product);
  const hasSsd = corpus.includes('ssd');
  const hasExternalSignal =
    corpus.includes('external') ||
    corpus.includes('pocket') ||
    corpus.includes('usb 3.2') ||
    corpus.includes('usb-c') ||
    corpus.includes('drives');

  return hasSsd && hasExternalSignal;
}

function getSpecValue(product: Pick<Product, 'specs'>, keywords: string[]) {
  const entries = Object.entries(product.specs ?? {});
  for (const [key, value] of entries) {
    const normalizedKey = key.toLowerCase();
    if (keywords.some((keyword) => normalizedKey.includes(keyword))) {
      return String(value);
    }
  }
  return undefined;
}

function formatSpecLabel(label: string) {
  return label
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type UseCaseItem = {
  title: string;
  body: string;
};

const CATEGORY_USE_CASES: Record<string, UseCaseItem[]> = {
  drives: [
    { title: 'Gamers', body: 'Move large game libraries and updates faster with portable high-speed storage.' },
    { title: 'Video Editors', body: 'Transfer footage and project files quickly for smoother client handoffs.' },
    { title: 'Businesses', body: 'Keep reliable backup workflows for teams, branches, and off-site data copy.' },
    { title: 'Everyday Users', body: 'Store photos, documents, and laptop backups in a compact daily-carry format.' },
  ],
  'sa-imports': [
    { title: 'Gamers', body: 'Order higher-spec gear from South Africa when local options are limited.' },
    { title: 'Creators', body: 'Access niche storage and performance products with a clear 5-day lead time.' },
    { title: 'Businesses', body: 'Source specific models through a managed SA import route without procurement delays.' },
    { title: 'Everyday Users', body: 'Buy trusted products not always available locally with transparent delivery expectations.' },
  ],
  laptops: [
    { title: 'Students', body: 'Handle classes, assignments, and research with dependable day-to-day performance.' },
    { title: 'Professionals', body: 'Run office tools, meetings, and multitasking workflows without unnecessary slowdown.' },
    { title: 'Businesses', body: 'Standardize team devices with clear specs, predictable support, and easier replacements.' },
    { title: 'Home Users', body: 'Cover browsing, streaming, documents, and communication on one reliable machine.' },
  ],
  networking: [
    { title: 'Home Users', body: 'Improve Wi-Fi stability for streaming, browsing, and smart-home connections.' },
    { title: 'Small Offices', body: 'Support more users and devices with consistent network uptime.' },
    { title: 'Retail & SMB', body: 'Keep POS, CCTV, and cloud systems connected with stronger network reliability.' },
    { title: 'Installers', body: 'Deploy practical networking solutions with clear compatibility and expansion paths.' },
  ],
  cctv: [
    { title: 'Homeowners', body: 'Increase visibility around gates, driveways, and key entry points.' },
    { title: 'Shops', body: 'Monitor customer and stock areas with better incident traceability.' },
    { title: 'Offices', body: 'Strengthen internal and perimeter security with scalable surveillance coverage.' },
    { title: 'Schools & Sites', body: 'Support broader monitoring needs where safety and coverage consistency matter.' },
  ],
  accessories: [
    { title: 'Remote Workers', body: 'Upgrade productivity with reliable everyday peripherals and adapters.' },
    { title: 'Students', body: 'Add practical accessories for study, classes, and better device usability.' },
    { title: 'Creators', body: 'Improve workflows with the right connectors, storage, and support gear.' },
    { title: 'Businesses', body: 'Equip teams with dependable accessories that reduce setup and compatibility issues.' },
  ],
  printing: [
    { title: 'Home Offices', body: 'Handle routine printing and scanning with stable output quality.' },
    { title: 'Schools', body: 'Support assignment and admin printing with practical consumable planning.' },
    { title: 'SMBs', body: 'Keep daily document workflows moving with predictable operation costs.' },
    { title: 'Teams', body: 'Add reliable print capacity for finance, admin, and front-office operations.' },
  ],
  mobile: [
    { title: 'Everyday Users', body: 'Manage calls, messaging, media, and apps with reliable daily performance.' },
    { title: 'Professionals', body: 'Stay productive on the move with dependable speed and battery support.' },
    { title: 'Content Users', body: 'Capture and share photos, video, and social content more smoothly.' },
    { title: 'Businesses', body: 'Equip field teams with practical devices backed by local support.' },
  ],
  desktops: [
    { title: 'Office Teams', body: 'Run core business applications on stable desktop hardware.' },
    { title: 'Schools', body: 'Support labs and admin desks with value-focused, durable setups.' },
    { title: 'Power Users', body: 'Handle heavier multitasking and workstation-style usage.' },
    { title: 'Home Workspaces', body: 'Build dependable desk setups for consistent day-to-day productivity.' },
  ],
  monitors: [
    { title: 'Office Users', body: 'Increase productivity with clearer, larger workspace layouts.' },
    { title: 'Design & Content Teams', body: 'Work with better visibility and improved visual consistency.' },
    { title: 'Traders & Analysts', body: 'Support multi-window workflows and longer screen-on usage.' },
    { title: 'Home Setups', body: 'Improve comfort for study, entertainment, and remote work sessions.' },
  ],
};

function getUseCasesForCategory(categorySlug: string): UseCaseItem[] {
  return (
    CATEGORY_USE_CASES[categorySlug] ?? [
      { title: 'Businesses', body: 'Deploy dependable technology with local support and predictable availability.' },
      { title: 'Teams', body: 'Improve productivity with practical specs and clearer purchasing decisions.' },
      { title: 'Home Users', body: 'Choose reliable products that solve everyday tech needs without overpaying.' },
      { title: 'Students', body: 'Get balanced value for learning, assignments, and daily digital use.' },
    ]
  );
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const category = getCategoryBySlug(product.category);
  const shortDescription = truncateText(stripHtml(product.description), 155);
  const isExternalSsd = isLikelyExternalSsd(product);
  const isVerbatimPocketSsd = isExternalSsd && /verbatim/i.test(product.name) && /1tb/i.test(product.name);

  const readSpeed = getSpecValue(product, ['read speed']) ?? '1000 MB/s';
  const connector = getSpecValue(product, ['connector', 'usb']) ?? 'USB-C';
  const transferRate = getSpecValue(product, ['data transfer rate', 'transfer rate']) ?? '10Gbps';

  const title =
    isVerbatimPocketSsd
      ? 'Verbatim 1TB Pocket SSD USB-C 10Gbps | Cansan Zimbabwe'
      : category?.slug === 'mobile'
        ? `${product.name} Price in Zimbabwe | Buy in Harare`
        : `${product.name} | ${category?.label ?? 'Tech'} | Cansan`;

  const description = isExternalSsd
    ? truncateText(
        `Buy ${product.name} in Zimbabwe. Up to ${readSpeed} speed, ${connector} connectivity, ${transferRate} transfer rate, Harare delivery, and USD/EcoCash payment support.`,
        155
      )
    : shortDescription;

  return buildAbsoluteMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    image: getProductImage(product.image),
  });
}

export default async function ProductPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.category);
  const related = (await readProducts())
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const isBundle = isBundleProduct(product);
  const isExternalSsd = isLikelyExternalSsd(product);
  const imageSrc = getProductImage(product.image);
  const brand = getBrandForProduct(product);
  const specEntries = Object.entries(product.specs ?? {});

  const readSpeed = getSpecValue(product, ['read speed']) ?? (isExternalSsd ? '1000 MB/s' : undefined);
  const writeSpeed = getSpecValue(product, ['write speed']) ?? (isExternalSsd ? '1000 MB/s' : undefined);
  const transferRate = getSpecValue(product, ['data transfer rate', 'transfer rate']) ?? (isExternalSsd ? '10 Gbps' : undefined);
  const connector = getSpecValue(product, ['connector', 'usb connector']) ?? (isExternalSsd ? 'USB-C' : undefined);
  const interfaceVersion = getSpecValue(product, ['usb version', 'interface']) ?? (isExternalSsd ? 'USB 3.2 Gen 2' : undefined);
  const capacity = getSpecValue(product, ['capacity']) ?? (/\b1tb\b/i.test(product.name) ? '1TB' : undefined);
  const formFactor = getSpecValue(product, ['form factor']) ?? (isExternalSsd ? 'M.2' : undefined);
  const weight = getSpecValue(product, ['weight']) ?? (isExternalSsd ? '58g' : undefined);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const savingAmount = hasDiscount && product.originalPrice ? product.originalPrice - product.price : 0;
  const savingPercent = hasDiscount && product.originalPrice ? Math.round((savingAmount / product.originalPrice) * 100) : 0;

  const stockCount = typeof product.stockCount === 'number' ? product.stockCount : undefined;
  const lowStock = product.inStock && stockCount !== undefined && stockCount <= 5;
  const criticallyLowStock = product.inStock && stockCount !== undefined && stockCount <= 2;
  const isSaImport = isSaImportProduct(product);

  const seoHeadline = isExternalSsd
    ? `${product.name} External SSD ${connector} ${interfaceVersion} in Zimbabwe`
    : product.name;

  const heroSummary = isExternalSsd
    ? `Transfer large files faster with up to ${readSpeed} read speed and ${writeSpeed} write speed in a compact ${weight} pocket-friendly SSD. Built for creators, gamers, and business backups in Zimbabwe.`
    : stripHtml(product.description);

  const benefitBullets = isExternalSsd
    ? [
        `Up to ${readSpeed} read and ${writeSpeed} write performance`,
        `${interfaceVersion} with ${connector} for modern laptops and desktops`,
        `${formFactor} SSD architecture with no moving parts for better reliability`,
        `${weight} compact design for daily carry and off-site backups`,
      ]
    : [
        'Genuine product sourced from verified suppliers',
        isSaImport ? 'Imported from South Africa with a clear 5-day lead time' : 'Live stock confirmation before payment',
        isSaImport ? 'Delivery target is about 5 days after order confirmation' : 'Harare delivery and nationwide courier support',
        'Warranty and after-sales guidance from Cansan',
      ];

  const processor = getSpecValue(product, ['processor', 'cpu', 'chipset']);
  const memory = getSpecValue(product, ['ram', 'memory']);
  const storage = getSpecValue(product, ['storage', 'ssd', 'hdd', 'capacity']);
  const display = getSpecValue(product, ['display', 'screen', 'resolution']);
  const connectivity = getSpecValue(product, ['connectivity', 'wifi', 'bluetooth', 'ethernet']);
  const dimensions = getSpecValue(product, ['dimensions', 'size']);
  const battery = getSpecValue(product, ['battery']);
  const categoryKey = category?.slug ?? product.category;
  const useCases = getUseCasesForCategory(categoryKey);

  const performanceDetail = isExternalSsd
    ? `Built for speed with up to ${readSpeed} read and ${writeSpeed} write performance.`
    : [processor, memory, storage, display]
        .filter(Boolean)
        .slice(0, 3)
        .join(' • ') || 'Balanced everyday performance for practical work, study, and daily use.';

  const portabilityDetail = [weight, dimensions, battery]
    .filter(Boolean)
    .slice(0, 2)
    .join(' • ');

  const compatibilityDetail = [connector, interfaceVersion, connectivity]
    .filter(Boolean)
    .slice(0, 3)
    .join(' • ');

  const featureBlocks = [
    {
      title: 'Performance',
      body: performanceDetail,
    },
    {
      title: 'Durability',
      body:
        product.condition === 'pre-owned'
          ? 'Quality-checked pre-owned condition with local support guidance and clear stock confirmation.'
          : 'Genuine hardware supply backed by local warranty support and practical after-sales help.',
    },
    {
      title: 'Portability',
      body:
        portabilityDetail ||
        'Practical form factor for daily transport, desk setups, or branch-to-branch deployment needs.',
    },
    {
      title: 'Compatibility',
      body:
        compatibilityDetail ||
        'Designed to fit common local business and home setups with straightforward integration support.',
    },
  ];

  const comparisonOptionLabel =
    category?.label ? `Low-cost ${category.label.toLowerCase()} alternative` : 'Low-cost alternative option';

  const quickSpecChips = [
    capacity,
    readSpeed ? `Read ${readSpeed}` : null,
    writeSpeed ? `Write ${writeSpeed}` : null,
    interfaceVersion,
    connector,
    transferRate ? `Up to ${transferRate}` : null,
  ].filter(Boolean) as string[];

  const waNumber = SITE_PHONE_E164.replace('+', '');
  const waText = encodeURIComponent(
    `Hi Cansan Solutions, I'd like to order: ${product.name}${isBundle ? ' bundle' : ''} (${formatCurrency(product.price, product.currency)}). Please confirm live stock, delivery options, and payment methods.`
  );

  return (
    <>
      <ProductJsonLd product={product} categoryName={category?.label} />
      <PageHero
        eyebrow={category?.label ?? 'Product Details'}
        title={seoHeadline}
        description={heroSummary}
        backgroundImage={imageSrc}
        breadcrumbs={
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/products" className="hover:text-white">
              Products
            </Link>
            {category ? (
              <>
                <span className="text-white/30">/</span>
                <Link href={getCategoryHref(category.slug)} className="hover:text-white">
                  {category.label}
                </Link>
              </>
            ) : null}
            <span className="text-white/30">/</span>
            <span className="font-medium text-white">{product.name}</span>
          </nav>
        }
        meta={[
          <div key="price" className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-200">Price</p>
            <p className="mt-1 text-lg font-bold text-white">{formatCurrency(product.price, product.currency)}</p>
          </div>,
          <div key="stock" className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-200">Stock</p>
            <p className="mt-1 text-lg font-bold text-white">{product.inStock ? 'Available' : 'Check ETA'}</p>
          </div>,
        ]}
        actions={
          <>
            <a
              href={`https://wa.me/${waNumber}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-50"
            >
              Order on WhatsApp
            </a>
            <Link
              href="/delivery"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Delivery and warranty
            </Link>
          </>
        }
      >
        {quickSpecChips.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                {quickSpecChips.slice(0, 4).map((chip) => (
              <span key={chip} className="inline-flex min-h-10 items-center rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                    {chip}
                  </span>
                ))}
              </div>
        ) : null}
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 pb-32 sm:px-6 sm:pb-10">

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(254,226,226,0.95),transparent_70%)]" />
              <div className="relative flex items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-10">
              <Image
                src={imageSrc}
                alt={product.name}
                width={720}
                height={720}
                className="max-h-72 w-full object-contain"
              />
              </div>
            </div>
            {quickSpecChips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {quickSpecChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <Link
                  href={getCategoryHref(category.slug)}
                  className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  {category.label}
                </Link>
              ) : null}
              {brand ? (
                <Link
                  href={getBrandHref(brand.slug)}
                  className="inline-flex min-h-10 items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  {brand.name}
                </Link>
              ) : null}
              {isBundle ? (
                <span className="w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                  Bundle Deal
                </span>
              ) : null}
              {hasDiscount ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Save {formatCurrency(savingAmount, product.currency)} ({savingPercent}% Off)
                </span>
              ) : null}
              {lowStock ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Fast Selling
                </span>
              ) : null}
              {isSaImport ? (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  5-Day Delivery from SA
                </span>
              ) : null}
            </div>

            <h2 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">{seoHeadline}</h2>

            <p className="text-sm leading-relaxed text-zinc-600">{heroSummary}</p>

            {isBundle && product.bundleItems.length > 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">What&apos;s included</p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {product.bundleItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-900">{formatCurrency(product.price, product.currency)}</span>
              {hasDiscount && product.originalPrice ? (
                <span className="text-lg text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 ${
                product.inStock
                  ? criticallyLowStock
                    ? 'border-red-200 bg-red-50'
                    : lowStock
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-emerald-200 bg-emerald-50'
                  : 'border-zinc-200 bg-zinc-50'
              }`}
            >
              {product.inStock ? (
                <p
                  className={`text-sm font-semibold ${
                    criticallyLowStock ? 'text-red-700' : lowStock ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {stockCount !== undefined
                    ? criticallyLowStock
                      ? `Only ${stockCount} left. Reserve now before restock delays.`
                      : lowStock
                        ? `Only ${stockCount} left in Harare stock.`
                        : `${stockCount} units currently available.`
                    : 'In stock and available for fast order confirmation.'}
                </p>
              ) : (
                <p className="text-sm font-semibold text-zinc-700">
                  Currently out of stock. Send a WhatsApp enquiry for next shipment ETA.
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-600">
                Price indicative. Confirm final stock, delivery, and quote on WhatsApp before checkout.
              </p>
              {isSaImport ? (
                <p className="mt-1 text-xs font-semibold text-red-700">
                  This item is sourced from South Africa and usually arrives within 5 days after confirmation.
                </p>
              ) : null}
            </div>

            <ul className="space-y-1">
              {benefitBullets.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-zinc-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton product={product} label="Buy Now" />
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Order on WhatsApp
              </a>
            </div>

            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              {[
                {
                  title: 'Zimbabwe Delivery',
                  body: isSaImport
                    ? 'Imported from South Africa with an expected 5-day delivery lead time in Zimbabwe.'
                    : 'Harare same-day options plus nationwide courier coordination for stocked items.',
                },
                {
                  title: 'Payment Options',
                  body: 'USD cash, bank transfer, and EcoCash routes confirmed before payment.',
                },
                {
                  title: 'Warranty Support',
                  body: 'Clear warranty process and post-purchase support directly with Cansan.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              {[
                { href: '/warranty', label: 'Warranty Info' },
                { href: '/delivery', label: 'Delivery Info' },
                { href: '/payments', label: 'Payment Options' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-xs font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="inline-flex min-h-9 items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-zinc-900">Who This Product Is For</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-zinc-900">Performance, Durability, Portability & Compatibility</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featureBlocks.map((item) => (
              <article key={item.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {specEntries.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-zinc-900">Technical Specifications</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <tbody className="divide-y divide-zinc-100">
                  {specEntries.map(([key, value]) => (
                    <tr key={key}>
                      <th className="w-1/3 bg-zinc-50 px-4 py-3 text-left font-semibold text-zinc-700">
                        {formatSpecLabel(key)}
                      </th>
                      <td className="px-4 py-3 text-zinc-600">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-zinc-900">Why This Product Beats Cheaper Alternatives</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Option</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Performance</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Support & Reliability</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {isExternalSsd
                      ? `Up to ${readSpeed} / ${writeSpeed}`
                      : [processor, memory, storage].filter(Boolean).slice(0, 2).join(' • ') || 'Balanced daily performance'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.condition === 'pre-owned'
                      ? 'Tested pre-owned condition with local support guidance'
                      : 'Genuine stock backed by local warranty support'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {isBundle ? 'Buyers needing a ready-to-deploy package' : 'Buyers who need dependable long-term value'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-zinc-700">{comparisonOptionLabel}</td>
                  <td className="px-4 py-3 text-zinc-600">Basic baseline performance</td>
                  <td className="px-4 py-3 text-zinc-600">Limited quality assurance or after-sales certainty</td>
                  <td className="px-4 py-3 text-zinc-600">Price-first buying with trade-offs</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-zinc-700">Older / Unknown Condition Option</td>
                  <td className="px-4 py-3 text-zinc-600">Inconsistent output under daily load</td>
                  <td className="px-4 py-3 text-zinc-600">Higher risk of hidden wear or short lifespan</td>
                  <td className="px-4 py-3 text-zinc-600">Short-term or temporary usage only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            When uptime, speed, and support matter, this option reduces replacement risk and post-purchase friction.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-zinc-900">Delivery, Payment & Warranty in Zimbabwe</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Harare & Nationwide Delivery',
                body: isSaImport
                  ? 'South Africa import route with around 5-day delivery after order confirmation.'
                  : 'Same-day delivery options in Harare and nationwide courier for confirmed stock.',
              },
              {
                title: 'Local Payment Flexibility',
                body: 'Pay via USD cash, bank transfer, or EcoCash after stock and quote confirmation.',
              },
              {
                title: 'Warranty Handling Support',
                body: 'Cansan helps with warranty guidance and post-purchase support steps when needed.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-5 text-lg font-bold text-zinc-900">
              {isExternalSsd ? 'Related Products & Upsells' : `More in ${category?.label ?? 'this category'}`}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
                >
                  <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-zinc-50 p-3">
                    <Image
                      src={getProductImage(relatedProduct.image)}
                      alt={relatedProduct.name}
                      width={220}
                      height={220}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-zinc-800 group-hover:underline">
                    {relatedProduct.name}
                  </p>
                  {isBundleProduct(relatedProduct) ? (
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                      {relatedProduct.bundleItems.length} item bundle
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-bold text-zinc-900">
                    {formatCurrency(relatedProduct.price, relatedProduct.currency)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <AddToCartButton product={product} label="Buy Now" className="min-h-12 rounded-xl px-4 py-3 text-sm" />
          <a
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-700"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
