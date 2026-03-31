import { getProducts, getProduct, saveProduct, deleteProduct, getCategories, replaceProducts } from './db';
import type { Product } from './types';

function mapRow(data: any): Product {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    category: data.category,
    condition: data.condition,
    price: typeof data.price === 'number' ? data.price : parseFloat(data.price),
    currency: data.currency || 'USD',
    description: data.description,
    image: data.image,
    inStock: data.inStock ?? data.in_stock ?? true,
    featured: data.featured ?? data.featured ?? false,
    tags: data.tags || [],
  };
}

export async function readProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.map(mapRow);
  } catch (error) {
    console.error('[readProducts] Failed:', error);
    return []; // Return empty on error
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
    const products = await getProducts();
    const found = products.find((p: any) => p.slug === slug);
    return found ? mapRow(found) : null;
  } catch (error) {
    console.error('[getProductBySlug] Failed:', error);
    return null;
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  try {
    const products = await readProducts();
    const id = nextId(products);
    
    if (!data.slug) throw new Error('slug required');
    if (!data.name) throw new Error('name required');
    if (!data.category) throw new Error('category required');
    if (data.price == null) throw new Error('price required');
    if (!data.description) throw new Error('description required');
    if (!data.image) throw new Error('image required');
    
    const product = {
      id,
      ...data,
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
    
    const updated = { ...existing, ...data, updatedAt: Date.now() };
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

function sanitizeImportedProduct(data: any, fallbackId: string, existingId?: string): Product {
  const name = String(data.name || '').trim();
  const slug = slugify(String(data.slug || name));
  const category = String(data.category || '').trim();
  const description = String(data.description || '').trim();
  const image = String(data.image || '').trim();
  const price = typeof data.price === 'number' ? data.price : parseFloat(String(data.price));
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
  if (!image) throw new Error(`Product "${name}" needs an image path`);

  return {
    id: existingId || fallbackId,
    slug,
    name,
    category,
    condition,
    price,
    currency: String(data.currency || 'USD').trim() || 'USD',
    description,
    image,
    inStock: data.inStock ?? data.in_stock ?? true,
    featured: data.featured ?? false,
    tags,
  };
}

export async function importProducts(data: any[], mode: 'append' | 'replace' = 'replace'): Promise<Product[]> {
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
