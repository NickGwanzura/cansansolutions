import { prisma } from './prisma';
import type { Product } from './types';

// All operations now use PostgreSQL via Prisma

export async function readProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    console.error('Failed to read products from DB:', error);
    return [];
  }
}

export async function writeProducts(products: Product[]): Promise<void> {
  // This function is kept for compatibility but not used
  // Individual create/update/delete should be used instead
  console.warn('writeProducts is deprecated, use createProduct/updateProduct/deleteProduct');
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    return product;
  } catch (error) {
    console.error('Failed to get product:', error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug }
    });
    return product;
  } catch (error) {
    console.error('Failed to get product by slug:', error);
    return null;
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await readProducts();
  const id = nextId(products);
  
  const product = await prisma.product.create({
    data: {
      id,
      ...data,
    }
  });
  
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
    return product;
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
}

export function nextId(products: Product[]): string {
  const max = products.reduce((m, p) => {
    const n = parseInt(p.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1).padStart(3, '0');
}
