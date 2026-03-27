import { query } from './db';
import type { Product } from './types';

// Transform database row to Product type
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
  try {
    console.log('[readProducts] Starting...');
    const rows = await query('SELECT * FROM products ORDER BY created_at DESC');
    console.log('[readProducts] Got', rows.length, 'products');
    return rows.map(mapRow);
  } catch (error) {
    console.error('[readProducts] Failed:', error);
    throw error; // Re-throw to let API handle it
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const rows = await query('SELECT * FROM products WHERE id = $1', [id]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  } catch (error) {
    console.error('[getProductById] Failed:', error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await query('SELECT * FROM products WHERE slug = $1', [slug]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
  } catch (error) {
    console.error('[getProductBySlug] Failed:', error);
    throw error;
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  try {
    console.log('[createProduct] Starting with data:', JSON.stringify(data, null, 2));
    
    const products = await readProducts();
    const id = nextId(products);
    
    console.log('[createProduct] Generated ID:', id);
    
    // Validate required fields
    if (!data.slug) throw new Error('slug is required');
    if (!data.name) throw new Error('name is required');
    if (!data.category) throw new Error('category is required');
    if (data.price === undefined || data.price === null) throw new Error('price is required');
    if (!data.description) throw new Error('description is required');
    if (!data.image) throw new Error('image is required');
    
    await query(
      `INSERT INTO products (id, slug, name, category, condition, price, currency, description, image, in_stock, featured, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        data.slug,
        data.name,
        data.category,
        data.condition || null,
        data.price,
        data.currency || 'USD',
        data.description,
        data.image,
        data.inStock ?? true,
        data.featured ?? false,
        data.tags || [],
      ]
    );
    
    console.log('[createProduct] Insert successful');
    
    const product = await getProductById(id);
    if (!product) throw new Error('Failed to retrieve created product');
    
    console.log('[createProduct] Product created:', product);
    return product;
  } catch (error) {
    console.error('[createProduct] Error:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (data.slug) { fields.push(`slug = $${paramIndex++}`); values.push(data.slug); }
    if (data.name) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.category) { fields.push(`category = $${paramIndex++}`); values.push(data.category); }
    if (data.condition !== undefined) { fields.push(`condition = $${paramIndex++}`); values.push(data.condition); }
    if (data.price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(data.price); }
    if (data.currency) { fields.push(`currency = $${paramIndex++}`); values.push(data.currency); }
    if (data.description) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
    if (data.image) { fields.push(`image = $${paramIndex++}`); values.push(data.image); }
    if (data.inStock !== undefined) { fields.push(`in_stock = $${paramIndex++}`); values.push(data.inStock); }
    if (data.featured !== undefined) { fields.push(`featured = $${paramIndex++}`); values.push(data.featured); }
    if (data.tags) { fields.push(`tags = $${paramIndex++}`); values.push(data.tags); }
    
    if (fields.length === 0) return getProductById(id);
    
    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);
    
    await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    
    return getProductById(id);
  } catch (error) {
    console.error('[updateProduct] Failed:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await query('DELETE FROM products WHERE id = $1', [id]);
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
