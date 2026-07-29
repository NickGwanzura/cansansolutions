'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { getCategoryLabel, isBundleProduct, isSaImportProduct } from '@/lib/catalog';
import { getBrandForProduct } from '@/lib/brands';
import { useToast } from './Toast';

type ProductCardProps = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

const TYPE_BY_CATEGORY: Record<string, string> = {
  drives: 'External SSD',
  'sa-imports': 'Imported Tech Product',
  laptops: 'Laptop',
  networking: 'Networking Device',
  cctv: 'Security System',
  accessories: 'Accessory',
  mobile: 'Smartphone',
  monitors: 'Monitor',
  desktops: 'Desktop PC',
  printing: 'Printer',
  bundles: 'Tech Bundle',
};

const USE_CASE_BY_CATEGORY: Record<string, string> = {
  drives: 'Fast Backup',
  'sa-imports': 'Special-Order Performance',
  laptops: 'Work and Study',
  networking: 'Stable Home and Office WiFi',
  cctv: 'Home and Business Security',
  accessories: 'Daily Productivity',
  mobile: 'Everyday Productivity',
  monitors: 'Office Productivity',
  desktops: 'Business Performance',
  printing: 'Office Printing',
  bundles: 'Value Savings',
};

const SPEC_PRIORITY_KEYS = [
  'capacity',
  'processor',
  'cpu',
  'read speed',
  'write speed',
  'memory',
  'ram',
  'storage',
  'connector',
  'interface',
  'resolution',
  'screen',
];

function normalizeLabel(label: string) {
  return label
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function compactSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractNameSpec(name: string): string | null {
  const patterns = [
    /\b\d+\s?TB\b/i,
    /\b\d+\s?GB\b/i,
    /\bCore\s+i[3579]\b/i,
    /\bRyzen\s+\d\b/i,
    /\bUltra\s+\d\b/i,
    /\bUSB[-\s]?C\b/i,
    /\b\d{2,4}\s?MB\/s\b/i,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      return compactSpaces(match[0]);
    }
  }

  return null;
}

function getPrimarySpec(product: Product): string {
  const entries = Object.entries(product.specs ?? {});

  for (const priority of SPEC_PRIORITY_KEYS) {
    const found = entries.find(([key]) => key.toLowerCase().includes(priority));
    if (found) {
      return compactSpaces(String(found[1]));
    }
  }

  return extractNameSpec(product.name) ?? 'High Performance';
}

function getMicroSpecs(product: Product): string[] {
  const entries = Object.entries(product.specs ?? {});
  const preferred = entries
    .filter(([key]) => SPEC_PRIORITY_KEYS.some((priority) => key.toLowerCase().includes(priority)))
    .slice(0, 3)
    .map(([key, value]) => `${normalizeLabel(key)}: ${value}`);

  if (preferred.length >= 2) {
    return preferred;
  }

  const fallbackFromName = [
    /\b\d+\s?TB\b/i,
    /\bUSB[-\s]?C\b/i,
    /\b\d{2,4}\s?MB\/s\b/i,
    /\b\d+\s?GB\s?RAM\b/i,
    /\bCore\s+i[3579]\b/i,
  ]
    .map((pattern) => product.name.match(pattern)?.[0])
    .filter(Boolean)
    .slice(0, 3) as string[];

  const merged = [...preferred, ...fallbackFromName].slice(0, 3);

  return merged.length > 0 ? merged : ['Genuine product', 'Local support'];
}

function buildSeoTitle(product: Product): string {
  const brand = getBrandForProduct(product)?.name ?? product.name.split(' ')[0] ?? 'Cansan';
  const keySpec = getPrimarySpec(product);
  const type = TYPE_BY_CATEGORY[product.category] ?? getCategoryLabel(product.category);
  const useCase = USE_CASE_BY_CATEGORY[product.category] ?? 'Everyday Use';

  return compactSpaces(`${brand} ${keySpec} ${type} for ${useCase}`);
}

function getStockText(product: Product): { label: string; tone: string } {
  if (!product.inStock) {
    return { label: 'Out of stock', tone: 'text-red-600 bg-red-50 border-red-200' };
  }

  if (typeof product.stockCount === 'number' && product.stockCount <= 5) {
    return { label: `Only ${product.stockCount} left`, tone: 'text-amber-700 bg-amber-50 border-amber-200' };
  }

  if (typeof product.stockCount === 'number' && product.stockCount <= 12) {
    return { label: 'Low Stock', tone: 'text-orange-700 bg-orange-50 border-orange-200' };
  }

  return { label: 'In Stock', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const isBundle = isBundleProduct(product);

  const seoTitle = useMemo(() => buildSeoTitle(product), [product]);
  const microSpecs = useMemo(() => getMicroSpecs(product), [product]);
  const stock = useMemo(() => getStockText(product), [product]);
  const saImport = useMemo(() => isSaImportProduct(product), [product]);
  const urgencyMicrocopy = saImport
    ? '5-day delivery from SA after order confirmation'
    : product.inStock && typeof product.stockCount === 'number' && product.stockCount <= 5
      ? 'Fast selling today in Zimbabwe'
      : 'Fast delivery available in Zimbabwe';

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent =
    hasDiscount && product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const imageSrc = product.image || '/images/products/placeholder.svg';

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product.inStock) {
      return;
    }

    addToCart(product);
    setAdding(true);
    showToast(`${product.name} added to cart`);
    window.setTimeout(() => setAdding(false), 1000);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="relative aspect-[4/3] overflow-hidden bg-white p-5">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-105"
          />

          {hasDiscount || product.dealLabel ? (
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {hasDiscount ? (
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                  -{discountPercent}%
                </span>
              ) : null}
              {product.dealLabel ? (
                <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                  {product.dealLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <span className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${stock.tone}`}>
            {stock.label}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setWishlisted((current) => !current);
            }}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wishlisted}
            className={`absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${wishlisted ? 'border-red-200 bg-red-50 text-red-600' : 'border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-600'}`}
          >
            <svg aria-hidden="true" className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          </button>

          {onQuickView ? (
            <button
              onClick={(event) => {
                event.preventDefault();
                onQuickView(product);
              }}
              className="absolute bottom-3 right-3 inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            >
              Quick View
            </button>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="text-sm font-semibold leading-snug text-zinc-900 transition hover:text-red-700">
          <h3 className="line-clamp-2">{seoTitle}</h3>
        </Link>

        <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
          {microSpecs.slice(0, 3).map((spec) => (
            <li key={spec} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-red-500" />
              <span className="line-clamp-1">{spec}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-end gap-2">
          <p className="text-lg font-bold text-zinc-950">{formatCurrency(product.price, product.currency)}</p>
          {hasDiscount && product.originalPrice ? (
            <p className="text-sm text-zinc-400 line-through">{formatCurrency(product.originalPrice, product.currency)}</p>
          ) : null}
        </div>

        <p className={`mt-1 text-sm ${saImport ? 'font-semibold text-red-600' : 'text-zinc-500'}`}>
          {urgencyMicrocopy}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-700"
          >
            View Product
          </Link>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="min-h-11 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
          >
            {product.inStock ? (adding ? 'Added' : isBundle ? 'Add Bundle' : 'Add') : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}
