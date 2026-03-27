import { db } from '@/drizzle/db';
import { products, type Product, type NewProduct } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

// Transform database product to app Product type (condition mapping)
function mapProduct(p: Product): Product {
  return {
    ...p,
    condition: p.condition as 'new' | 'pre-owned' | null,
  };
}

// All operations now use Drizzle ORM

export async function readProducts(): Promise<Product[]> {
  try {
    const result = await db.query.products.findMany({
      orderBy: desc(products.createdAt),
    });
    return result.map(mapProduct);
  } catch (error) {
    console.error('[readProducts] Failed to read products from DB:', error);
    return [];
  }
}

export async function writeProducts(productsData: Product[]): Promise<void> {
  console.warn('writeProducts is deprecated, use createProduct/updateProduct/deleteProduct');
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    return result ? mapProduct(result) : null;
  } catch (error) {
    console.error('[getProductById] Failed:', error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    return result ? mapProduct(result) : null;
  } catch (error) {
    console.error('[getProductBySlug] Failed:', error);
    return null;
  }
}

export async function createProduct(data: Omit<NewProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const allProducts = await readProducts();
    const id = nextId(allProducts);
    
    console.log('[createProduct] Creating with data:', { ...data, id });
    
    const newProduct: NewProduct = {
      id,
      slug: data.slug!,
      name: data.name!,
      category: data.category!,
      condition: data.condition as 'new' | 'pre-owned' | null,
      price: data.price!,
      currency: data.currency || 'USD',
      description: data.description!,
      image: data.image!,
      inStock: data.inStock ?? true,
      featured: data.featured ?? false,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(products).values(newProduct).returning();
    
    console.log('[createProduct] Created:', result[0]);
    return mapProduct(result[0]);
  } catch (error) {
    console.error('[createProduct] Failed:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<NewProduct>): Promise<Product | null> {
  try {
    const updateData: Partial<NewProduct> = {
      ...data,
      updatedAt: new Date(),
    };
    
    if (data.condition) {
      updateData.condition = data.condition as 'new' | 'pre-owned' | null;
    }
    
    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    
    return result.length > 0 ? mapProduct(result[0]) : null;
  } catch (error) {
    console.error('[updateProduct] Failed:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const result = await db.delete(products)
      .where(eq(products.id, id))
      .returning();
    return result.length > 0;
  } catch (error) {
    console.error('[deleteProduct] Failed:', error);
    return false;
  }
}

export function nextId(productsList: Product[]): string {
  const max = productsList.reduce((m, p) => {
    const n = parseInt(p.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1).padStart(3, '0');
}
