export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { importProducts } from '@/lib/admin-data';

const DEFAULT_BASE_URL = 'https://www.firstshop.co.za';
const DEFAULT_COLLECTION_HANDLE = 'external-solid-state-drive-ssd';
const DEFAULT_LIMIT = 40;
const DEFAULT_MARKUP_PERCENT = 35;
const MAX_LIMIT = 120;
const SA_IMPORT_CATEGORY = 'sa-imports';
const PAGE_SIZE = 250;
const FX_RATE_ENDPOINT = 'https://api.frankfurter.app/latest?from=USD&to=ZAR';

type ImportMode = 'append' | 'replace';

type FirstShopVariant = {
  price?: number | string | null;
  compare_at_price?: number | string | null;
  available?: boolean;
  sku?: string | null;
};

type FirstShopImage = {
  src?: string | null;
};

type FirstShopProduct = {
  id?: number | string;
  title?: string;
  handle?: string;
  body_html?: string;
  description?: string;
  tags?: string[] | string;
  variants?: FirstShopVariant[];
  images?: Array<FirstShopImage | string>;
  featured_image?: FirstShopImage | string | null;
  available?: boolean;
};

type FirstShopProductsResponse = {
  products?: FirstShopProduct[];
};

type ImportRequestPayload = {
  mode?: ImportMode;
  limit?: number;
  baseUrl?: string;
  collectionHandle?: string;
  productLinks?: string[] | string;
  bankRate?: number;
  markupPercent?: number;
};

type ConversionOptions = {
  usdToZarRate: number;
  markupPercent: number;
};

function toHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function normalizeBaseUrl(value?: string): string {
  const fallback = DEFAULT_BASE_URL;
  if (!value || !value.trim()) return fallback;

  try {
    const parsed = new URL(value.trim());
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return fallback;
  }
}

function resolveCollectionHandle(value?: string): string {
  if (!value || !value.trim()) {
    return DEFAULT_COLLECTION_HANDLE;
  }

  const raw = value.trim();

  try {
    const parsed = new URL(raw);
    const matched = parsed.pathname.match(/\/collections\/([^/]+)/i);
    if (matched?.[1]) {
      return matched[1];
    }
  } catch {
    // Not a URL. Continue with string cleanup.
  }

  const fromPath = raw.match(/collections\/([^/]+)/i)?.[1];
  if (fromPath) {
    return fromPath;
  }

  return raw.replace(/^\/+|\/+$/g, '');
}

function normalizeLimit(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(value)));
}

function normalizeMarkupPercent(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_MARKUP_PERCENT;
  }
  return Math.max(0, Math.min(300, value));
}

function parseEnvBankRate(): number | null {
  const raw = process.env.SA_BANK_USD_ZAR_RATE;
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeBankRate(value?: number): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value <= 0) return null;
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toRateTag(rate: number): string {
  return `fx-usdzar-${rate.toFixed(4).replace('.', '_')}`;
}

function parseProductLinks(value: string[] | string | undefined): string[] {
  if (!value) return [];

  const entries = Array.isArray(value) ? value : [value];
  const links = entries
    .flatMap((entry) => String(entry).split(/[\n,]+/))
    .map((entry) => entry.trim())
    .filter(Boolean);

  const handles: string[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    let handle = '';

    try {
      const parsed = new URL(link);
      const fromPath = parsed.pathname.match(/\/products\/([^/?#]+)/i)?.[1];
      handle = fromPath ? decodeURIComponent(fromPath) : '';
    } catch {
      const direct = link.match(/products\/([^/?#]+)/i)?.[1];
      handle = direct ? decodeURIComponent(direct) : link;
    }

    handle = handle.trim().replace(/^\/+|\/+$/g, '');
    if (!handle) continue;

    if (!seen.has(handle)) {
      seen.add(handle);
      handles.push(handle);
    }
  }

  return handles;
}

function normalizeTags(value: string[] | string | undefined): string[] {
  if (!value) return [];
  const base = Array.isArray(value) ? value : value.split(',');
  return base
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 100000 ? value / 100 : value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (!cleaned) return undefined;
    const parsed = Number.parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return undefined;
    return parsed > 100000 ? parsed / 100 : parsed;
  }

  return undefined;
}

function normalizeSpecLabel(label: string): string {
  return label
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeSpecValue(value: string): string {
  return value.replace(/;/g, ',').replace(/\s+/g, ' ').trim();
}

function parseSpecsFromTags(tags: string[], sku?: string | null): Record<string, string> | undefined {
  const specs: Record<string, string> = {};

  for (const rawTag of tags) {
    const separatorIndex = rawTag.indexOf('_');
    if (separatorIndex <= 0) continue;

    const left = rawTag.slice(0, separatorIndex).trim();
    const right = rawTag.slice(separatorIndex + 1).trim();
    if (!left || !right) continue;

    const skip = ['availability', 'brand', 'category'];
    if (skip.includes(left.toLowerCase())) continue;

    specs[normalizeSpecLabel(left)] = normalizeSpecValue(right);
  }

  if (sku) {
    specs.SKU = sku;
  }

  return Object.keys(specs).length > 0 ? specs : undefined;
}

function pickImage(product: FirstShopProduct): string {
  const candidates: string[] = [];

  if (typeof product.featured_image === 'string') {
    candidates.push(product.featured_image);
  } else if (product.featured_image && typeof product.featured_image === 'object' && typeof product.featured_image.src === 'string') {
    candidates.push(product.featured_image.src);
  }

  for (const image of product.images ?? []) {
    if (typeof image === 'string') {
      candidates.push(image);
      continue;
    }
    if (image && typeof image === 'object' && typeof image.src === 'string') {
      candidates.push(image.src);
    }
  }

  const selected = candidates.find((item) => item && item.trim());
  return selected ? toHttps(selected) : '/images/products/placeholder.svg';
}

function buildDescription(sourceDescription: string | undefined, sourceUrl: string): string {
  const base = (sourceDescription || '').trim() || '<p>Imported product listing from FirstShop South Africa.</p>';
  const importNote =
    '<p><strong>Delivery:</strong> This SA Import item is delivered in about 5 days after order confirmation.</p>';
  const sourceNote = `<p><strong>Source:</strong> <a href="${sourceUrl}" target="_blank" rel="nofollow noopener noreferrer">FirstShop South Africa listing</a></p>`;

  return `${base}\n${importNote}\n${sourceNote}`;
}

function mapFirstShopProduct(product: FirstShopProduct, baseUrl: string, conversion: ConversionOptions) {
  const title = (product.title || '').trim();
  const handle = (product.handle || '').trim();
  const productId = String(product.id || '').trim();

  if (!title || !handle || !productId) {
    return null;
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants.find((variant) => variant.available) ?? variants[0];

  const price = parsePrice(selectedVariant?.price);
  if (!price || price <= 0) {
    return null;
  }

  const compareAtPrice = parsePrice(selectedVariant?.compare_at_price);
  const markupMultiplier = 1 + conversion.markupPercent / 100;
  const convertedPrice = roundMoney((price * markupMultiplier) / conversion.usdToZarRate);
  if (!Number.isFinite(convertedPrice) || convertedPrice <= 0) {
    return null;
  }

  const convertedCompareAtPrice =
    compareAtPrice && compareAtPrice > price
      ? roundMoney((compareAtPrice * markupMultiplier) / conversion.usdToZarRate)
      : undefined;
  const sourceTags = normalizeTags(product.tags);
  const normalizedTags = Array.from(
    new Set([
      ...sourceTags,
      'sa-import',
      'firstshop',
      'delivery-5-days',
      'source-south-africa',
      `sa-markup-${Math.round(conversion.markupPercent)}`,
      toRateTag(conversion.usdToZarRate),
      'sa-bank-rate-converted',
    ])
  );

  const sourceUrl = `${baseUrl}/products/${handle}`;

  return {
    id: `firstshop-${productId}`,
    slug: `sa-${handle}`,
    name: title,
    category: SA_IMPORT_CATEGORY,
    productType: 'single',
    bundleItems: [],
    condition: 'new',
    price: convertedPrice,
    currency: 'USD',
    description: buildDescription(product.body_html ?? product.description, sourceUrl),
    image: pickImage(product),
    inStock: Boolean(selectedVariant?.available ?? product.available ?? true),
    featured: false,
    tags: normalizedTags,
    originalPrice:
      convertedCompareAtPrice && convertedCompareAtPrice > convertedPrice
        ? convertedCompareAtPrice
        : undefined,
    specs: parseSpecsFromTags(sourceTags, selectedVariant?.sku),
    dealLabel: '5-Day Delivery from SA',
  };
}

async function fetchCollectionProducts(baseUrl: string, collectionHandle: string, limit: number): Promise<FirstShopProduct[]> {
  const collected: FirstShopProduct[] = [];
  const maxPages = 6;
  let page = 1;

  while (collected.length < limit && page <= maxPages) {
    const url = `${baseUrl}/collections/${collectionHandle}/products.json?limit=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Cansan Importer/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (page === 1) {
        throw new Error(`Failed to fetch collection feed from FirstShop (${response.status})`);
      }
      break;
    }

    const payload = (await response.json()) as FirstShopProductsResponse;
    const pageProducts = Array.isArray(payload.products) ? payload.products : [];

    if (pageProducts.length === 0) {
      break;
    }

    collected.push(...pageProducts);

    if (pageProducts.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  const uniqueProducts: FirstShopProduct[] = [];
  const seen = new Set<string>();

  for (const product of collected) {
    const key = String(product.id || product.handle || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueProducts.push(product);
    if (uniqueProducts.length >= limit) break;
  }

  return uniqueProducts;
}

async function fetchProductByHandle(baseUrl: string, handle: string): Promise<FirstShopProduct | null> {
  const endpoints = [
    `${baseUrl}/products/${handle}.js`,
    `${baseUrl}/products/${handle}.json`,
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Cansan Importer/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json().catch(() => null)) as
      | (FirstShopProduct & { product?: FirstShopProduct })
      | null;

    if (!payload || typeof payload !== 'object') {
      continue;
    }

    const product = payload.product && typeof payload.product === 'object' ? payload.product : payload;

    return {
      ...product,
      handle: product.handle || handle,
    };
  }

  return null;
}

async function fetchSpecificProducts(baseUrl: string, handles: string[], limit: number): Promise<FirstShopProduct[]> {
  const limitedHandles = Array.from(new Set(handles)).slice(0, limit);
  const products = await Promise.all(
    limitedHandles.map((handle) => fetchProductByHandle(baseUrl, handle))
  );

  return products.filter((product): product is FirstShopProduct => Boolean(product));
}

async function fetchUsdToZarRate(): Promise<number | null> {
  try {
    const response = await fetch(FX_RATE_ENDPOINT, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Cansan Importer/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as
      | { rates?: Record<string, number>; amount?: number }
      | null;
    const rate = payload?.rates?.ZAR;

    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return null;
    }

    return rate;
  } catch {
    return null;
  }
}

async function resolveUsdToZarRate(payloadRate?: number): Promise<number> {
  const provided = normalizeBankRate(payloadRate);
  if (provided) return provided;

  const fromEnv = parseEnvBankRate();
  if (fromEnv) return fromEnv;

  const fromFeed = await fetchUsdToZarRate();
  if (fromFeed) return fromFeed;

  throw new Error('Unable to resolve USD/ZAR bank rate. Provide `bankRate` in request or set SA_BANK_USD_ZAR_RATE.');
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await checkAdminAuth(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await req.json().catch(() => ({}))) as ImportRequestPayload;
    const mode: ImportMode = payload.mode === 'replace' ? 'replace' : 'append';
    const limit = normalizeLimit(payload.limit);
    const baseUrl = normalizeBaseUrl(payload.baseUrl);
    const collectionHandle = resolveCollectionHandle(payload.collectionHandle);
    const productHandles = parseProductLinks(payload.productLinks);
    const usdToZarRate = await resolveUsdToZarRate(payload.bankRate);
    const markupPercent = normalizeMarkupPercent(payload.markupPercent);

    const sourceProducts =
      productHandles.length > 0
        ? await fetchSpecificProducts(baseUrl, productHandles, limit)
        : await fetchCollectionProducts(baseUrl, collectionHandle, limit);

    if (sourceProducts.length === 0) {
      return NextResponse.json(
        {
          error:
            productHandles.length > 0
              ? 'No valid products found from the provided FirstShop product links'
              : 'No products found from FirstShop collection feed',
        },
        { status: 404 }
      );
    }

    const mappedProducts = sourceProducts
      .map((product) => mapFirstShopProduct(product, baseUrl, { usdToZarRate, markupPercent }))
      .filter((product): product is NonNullable<ReturnType<typeof mapFirstShopProduct>> => Boolean(product));

    if (mappedProducts.length === 0) {
      return NextResponse.json(
        { error: 'No valid products were mapped from FirstShop feed' },
        { status: 422 }
      );
    }

    const catalog = await importProducts(mappedProducts, mode);

    return NextResponse.json({
      success: true,
      imported: mappedProducts.length,
      mode,
      sourceCount: sourceProducts.length,
      catalogSize: catalog.length,
      category: SA_IMPORT_CATEGORY,
      deliveryLabel: '5-Day Delivery from SA',
      conversion: {
        currency: 'USD',
        usdToZarRate,
        markupPercent,
      },
      source: {
        baseUrl,
        type: productHandles.length > 0 ? 'product-links' : 'collection',
        collectionHandle: productHandles.length > 0 ? undefined : collectionHandle,
        productHandles: productHandles.length > 0 ? productHandles : undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import FirstShop products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
