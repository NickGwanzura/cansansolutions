import { query } from './db';
import type { Product } from './types';

function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    condition: row.condition,
    price: parseFloat(row.price),
    currency: row.currency,
    description: row.description,
    image: row.image,
    inStock: row.in_stock,
    featured: row.featured,
    tags: row.tags || [],
  };
}

export async function readProducts(): Promise<Product[]> {
  console.log('[readProducts] Entry');
  try {
    const rows = await query('SELECT * FROM products ORDER BY created_at DESC');
    console.log('[readProducts] Got', rows.length, 'rows');
    return rows.map(mapRow);
  } catch (error) {
    console.error('[readProducts] FAILED:', error);
    // Return empty array instead of throwing - prevents 500 errors
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const rows = await query('SELECT * FROM products WHERE id = $1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  } catch (error) {
    console.error('[getProductById] FAILED:', error);
    throw error;
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  console.log('[createProduct] Entry');
  try {
    const products = await readProducts();
    const id = nextId(products);
    
    // Validate
    if (!data.slug) throw new Error('slug required');
    if (!data.name) throw new Error('name required');
    if (!data.category) throw new Error('category required');
    if (data.price == null) throw new Error('price required');
    if (!data.description) throw new Error('description required');
    if (!data.image) throw new Error('image required');
    
    await query(
      `INSERT INTO products (id, slug, name, category, condition, price, currency, description, image, in_stock, featured, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id, data.slug, data.name, data.category, data.condition || null,
        data.price, data.currency || 'USD', data.description, data.image,
        data.inStock ?? true, data.featured ?? false, data.tags || [],
      ]
    );
    
    const product = await getProductById(id);
    if (!product) throw new Error('Failed to retrieve created product');
    return product;
  } catch (error) {
    console.error('[createProduct] FAILED:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    
    if (data.slug) { fields.push(`slug = $${i++}`); values.push(data.slug); }
    if (data.name) { fields.push(`name = $${i++}`); values.push(data.name); }
    if (data.category) { fields.push(`category = $${i++}`); values.push(data.category); }
    if (data.condition !== undefined) { fields.push(`condition = $${i++}`); values.push(data.condition); }
    if (data.price !== undefined) { fields.push(`price = $${i++}`); values.push(data.price); }
    if (data.currency) { fields.push(`currency = $${i++}`); values.push(data.currency); }
    if (data.description) { fields.push(`description = $${i++}`); values.push(data.description); }
    if (data.image) { fields.push(`image = $${i++}`); values.push(data.image); }
    if (data.inStock !== undefined) { fields.push(`in_stock = $${i++}`); values.push(data.inStock); }
    if (data.featured !== undefined) { fields.push(`featured = $${i++}`); values.push(data.featured); }
    if (data.tags) { fields.push(`tags = $${i++}`); values.push(data.tags); }
    
    if (fields.length === 0) return getProductById(id);
    
    fields.push(`updated_at = $${i++}`);
    values.push(new Date());
    values.push(id);
    
    await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${i}`,
      values
    );
    
    return getProductById(id);
  } catch (error) {
    console.error('[updateProduct] FAILED:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('[deleteProduct] FAILED:', error);
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

export async function seedCategories() {
  const categories = [
    { id: 'mobile', label: 'Mobile & Accessories', icon: 'smartphone', slug: 'mobile' },
    { id: 'laptops', label: 'Laptops & Computing', icon: 'laptop', slug: 'laptops' },
    { id: 'networking', label: 'Networking & Wi-Fi', icon: 'network', slug: 'networking' },
    { id: 'power', label: 'Power & Backup', icon: 'battery', slug: 'power' },
    { id: 'audio', label: 'Audio & Headphones', icon: 'headphones', slug: 'audio' },
    { id: 'gadgets', label: 'Gadgets & Devices', icon: 'gadget', slug: 'gadgets' },
    { id: 'accessories', label: 'Accessories & Cables', icon: 'plug', slug: 'accessories' },
    { id: 'printing', label: 'Printing & Office', icon: 'printer', slug: 'printing' },
  ];
  
  for (const cat of categories) {
    await query(
      `INSERT INTO categories (id, label, icon, slug) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (id) DO NOTHING`,
      [cat.id, cat.label, cat.icon, cat.slug]
    );
  }
}
