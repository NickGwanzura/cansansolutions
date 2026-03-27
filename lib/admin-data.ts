import { prisma } from './prisma';
import type { Product, Condition } from './types';

// Transform Prisma product to app Product type
function mapPrismaToProduct(p: {
  id: string;
  slug: string;
  name: string;
  category: string;
  condition: 'new' | 'pre_owned' | null;
  price: number;
  currency: string;
  description: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
}): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    condition: p.condition === 'pre_owned' ? 'pre-owned' : p.condition ?? undefined,
    price: p.price,
    currency: p.currency,
    description: p.description,
    image: p.image,
    inStock: p.inStock,
    featured: p.featured,
    tags: p.tags,
  };
}

// Transform app Product condition to Prisma enum
function mapConditionToPrisma(condition?: Condition): 'new' | 'pre_owned' | null {
  if (condition === 'new') return 'new';
  if (condition === 'pre-owned') return 'pre_owned';
  return null;
}

// All operations now use PostgreSQL via Prisma

export async function readProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return products.map(mapPrismaToProduct);
  } catch (error) {
    console.error('[readProducts] Failed to read products from DB:', error);
    throw error;
  }
}

export async function writeProducts(products: Product[]): Promise<void> {
  console.warn('writeProducts is deprecated, use createProduct/updateProduct/deleteProduct');
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    return product ? mapPrismaToProduct(product) : null;
  } catch (error) {
    console.error('[getProductById] Failed:', error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug }
    });
    return product ? mapPrismaToProduct(product) : null;
  } catch (error) {
    console.error('[getProductBySlug] Failed:', error);
    throw error;
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const products = await readProducts();
    const id = nextId(products);
    
    console.log('[createProduct] Creating with data:', { ...data, id });
    
    const product = await prisma.product.create({
      data: {
        id,
        slug: data.slug,
        name: data.name,
        category: data.category,
        condition: mapConditionToPrisma(data.condition),
        price: data.price,
        currency: data.currency,
        description: data.description,
        image: data.image,
        inStock: data.inStock,
        featured: data.featured,
        tags: data.tags,
      }
    });
    
    console.log('[createProduct] Created:', product);
    return mapPrismaToProduct(product);
  } catch (error) {
    console.error('[createProduct] Failed:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    
    if ('condition' in data) {
      updateData.condition = mapConditionToPrisma(data.condition);
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    return mapPrismaToProduct(product);
  } catch (error) {
    console.error('[updateProduct] Failed:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('[deleteProduct] Failed:', error);
    throw error;
  }
}

export function nextId(products: Product[]): string {
  const max = products.reduce((m, p) => {
    const n = parseInt(p.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1).padStart(3, '0');
}
