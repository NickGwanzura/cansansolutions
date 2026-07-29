import { getProducts, getProduct, getProductBySlug as dbGetProductBySlug, saveProduct, deleteProduct, getCategories, replaceProducts, getActiveBanners } from './db';
import fallbackProducts from '@/data/products.template.json';
import type { Banner, Product } from './types';
import { normalizeBundleItems, normalizeProductType } from './catalog';

type ProductRecord = {
  id?: string;
  slug?: string;
  name?: string;
  category?: string;
  productType?: unknown;
  bundleItems?: unknown;
  condition?: unknown;
  price?: number | string;
  originalPrice?: number | string;
  currency?: string;
  description?: string;
  image?: string;
  inStock?: boolean;
  in_stock?: boolean;
  featured?: boolean;
  tags?: unknown;
  specs?: unknown;
  stockCount?: number | string;
  rating?: number | string;
  reviewCount?: number | string;
  dealLabel?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
} & Record<string, unknown>;

function mapRow(data: ProductRecord): Product {
  const productType = normalizeProductType(data.productType);
  const bundleItems = normalizeBundleItems(data.bundleItems);
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  return {
    id: String(data.id || ''),
    slug: String(data.slug || ''),
    name: String(data.name || ''),
    category: String(data.category || ''),
    productType,
    bundleItems,
    condition:
      productType === 'bundle' || (data.condition !== 'new' && data.condition !== 'pre-owned')
        ? undefined
        : data.condition,
    price: typeof data.price === 'number' ? data.price : parseFloat(String(data.price)),
    currency: String(data.currency || 'USD'),
    description: String(data.description || ''),
    image: String(data.image || ''),
    inStock: Boolean(data.inStock ?? data.in_stock ?? true),
    featured: Boolean(data.featured ?? false),
    tags,
    originalPrice: data.originalPrice != null ? Number(data.originalPrice) : undefined,
    specs: data.specs && typeof data.specs === 'object' ? data.specs as Record<string, string> : undefined,
    stockCount: data.stockCount != null ? Number(data.stockCount) : undefined,
    rating: data.rating != null ? Number(data.rating) : undefined,
    reviewCount: data.reviewCount != null ? Number(data.reviewCount) : undefined,
    dealLabel: data.dealLabel ? String(data.dealLabel) : undefined,
  };
}

export async function readProducts(): Promise<Product[]> {
  // A local catalogue keeps the storefront usable in development and preview
  // environments where DATABASE_URL has not been configured. A configured
  // database remains the only source used in production inventory workflows.
  if (!process.env.DATABASE_URL) {
    return fallbackProducts.map((product) => mapRow(product));
  }

  try {
    const products = await getProducts();
    return products.map(mapRow);
  } catch (error) {
    console.error('[readProducts] Failed:', error);
    return []; // Return empty on error
  }
}

export async function getHomepageBanners(): Promise<Banner[]> {
  try {
    const banners = await getActiveBanners();
    return banners.filter((banner) => banner.position === 'homepage-hero');
  } catch (error) {
    console.error('[getHomepageBanners] Failed:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const data = await getProduct(id);
    return data ? mapRow(data) : null;
  } catch (error) {
    console.error('[getProductById] Failed:', error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await dbGetProductBySlug(slug);
    return data ? mapRow(data as unknown as ProductRecord) : null;
  } catch (error) {
    console.error('[getProductBySlug] Failed:', error);
    return null;
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  try {
    const products = await readProducts();
    const id = nextId(products);
    const productType = normalizeProductType(data.productType);
    const bundleItems = normalizeBundleItems(data.bundleItems);
    
    if (!data.slug) throw new Error('slug required');
    if (!data.name) throw new Error('name required');
    if (!data.category) throw new Error('category required');
    if (data.price == null) throw new Error('price required');
    if (!data.description) throw new Error('description required');
    // Image is optional - can be added later via admin panel
    if (productType === 'bundle' && bundleItems.length === 0) throw new Error('bundle items required');
    
    const product = {
      id,
      ...data,
      productType,
      bundleItems,
      condition: productType === 'bundle' ? undefined : data.condition,
      currency: data.currency || 'USD',
      inStock: data.inStock ?? true,
      featured: data.featured ?? false,
      tags: data.tags || [],
      createdAt: Date.now(),
    };
    
    await saveProduct(product);
    
    return mapRow(product);
  } catch (error) {
    console.error('[createProduct] Failed:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const existing = await getProduct(id);
    if (!existing) return null;

    const productType = normalizeProductType(data.productType ?? existing.productType);
    const bundleItems = normalizeBundleItems(data.bundleItems ?? existing.bundleItems);

    if (productType === 'bundle' && bundleItems.length === 0) {
      throw new Error('bundle items required');
    }
    
    const updated = {
      ...existing,
      ...data,
      productType,
      bundleItems,
      condition: productType === 'bundle' ? undefined : (data.condition ?? existing.condition),
      updatedAt: Date.now(),
    };
    await saveProduct(updated);
    
    return mapRow(updated);
  } catch (error) {
    console.error('[updateProduct] Failed:', error);
    throw error;
  }
}

export async function deleteProductById(id: string): Promise<boolean> {
  try {
    await deleteProduct(id);
    return true;
  } catch (error) {
    console.error('[deleteProductById] Failed:', error);
    return false;
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sanitizeImportedProduct(data: ProductRecord, fallbackId: string, existingId?: string): Product {
  const name = String(data.name || '').trim();
  const slug = slugify(String(data.slug || name));
  const category = String(data.category || '').trim();
  const description = String(data.description || '').trim();
  const image = String(data.image || '').trim();
  const price = typeof data.price === 'number' ? data.price : parseFloat(String(data.price));
  const productType = normalizeProductType(data.productType);
  const bundleItems = normalizeBundleItems(data.bundleItems);
  const condition = data.condition === 'new' || data.condition === 'pre-owned' ? data.condition : undefined;
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : String(data.tags || '')
        .split(',')
        .map((tag: string) => tag.trim())
        .filter(Boolean);

  if (!name) throw new Error('Each imported product needs a name');
  if (!slug) throw new Error(`Product "${name}" needs a valid slug or name`);
  if (!category) throw new Error(`Product "${name}" needs a category`);
  if (!Number.isFinite(price)) throw new Error(`Product "${name}" needs a valid price`);
  if (!description) throw new Error(`Product "${name}" needs a description`);
  // Image is optional during import - can be added later
  if (productType === 'bundle' && bundleItems.length === 0) {
    throw new Error(`Bundle "${name}" needs at least one bundled item`);
  }

  return {
    id: existingId || fallbackId,
    slug,
    name,
    category,
    productType,
    bundleItems,
    condition: productType === 'bundle' ? undefined : condition,
    price,
    currency: String(data.currency || 'USD').trim() || 'USD',
    description,
    image,
    inStock: data.inStock ?? data.in_stock ?? true,
    featured: data.featured ?? false,
    tags,
  };
}

export async function importProducts(data: ProductRecord[], mode: 'append' | 'replace' = 'replace'): Promise<Product[]> {
  const baseProducts = mode === 'append' ? await readProducts() : [];
  const importedProducts = [...baseProducts];

  const usedIds = new Set(importedProducts.map((product) => product.id));
  let nextNumericId = importedProducts.reduce((max, product) => {
    const parsed = parseInt(product.id, 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 0);

  const findNextId = () => {
    do {
      nextNumericId += 1;
    } while (usedIds.has(String(nextNumericId).padStart(3, '0')));

    return String(nextNumericId).padStart(3, '0');
  };

  for (const item of data) {
    const slug = slugify(String(item?.slug || item?.name || ''));
    const existingIndex = importedProducts.findIndex((product) => product.slug === slug || product.id === String(item?.id || ''));
    const fallbackId = existingIndex >= 0 ? importedProducts[existingIndex].id : findNextId();
    const normalized = sanitizeImportedProduct(item, fallbackId, existingIndex >= 0 ? importedProducts[existingIndex].id : undefined);

    usedIds.add(normalized.id);

    if (existingIndex >= 0) {
      importedProducts[existingIndex] = normalized;
    } else {
      importedProducts.push(normalized);
    }
  }

  await replaceProducts(importedProducts);
  return importedProducts;
}

export function nextId(products: Product[]): string {
  const max = products.reduce((m, p) => {
    const n = parseInt(p.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1).padStart(3, '0');
}

export async function seedCategories() {
  return getCategories();
}

export { getCategories };


export async function updateProducts(ids: string[], changes: Partial<Record<string, unknown>>): Promise<number> {
  const products = await readProducts();
  let updated = 0;
  
  const updatedProducts = products.map((p) => {
    if (ids.includes(p.id)) {
      updated++;
      return { ...p, ...changes } as Product;
    }
    return p;
  });
  
  if (updated > 0) {
    await replaceProducts(updatedProducts);
  }
  
  return updated;
}
