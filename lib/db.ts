import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || process.env.DATABASE_URL?.replace('postgresql://', 'redis://');

if (!REDIS_URL) {
  console.error('[DB] CRITICAL: REDIS_URL is not set!');
}

const redis = REDIS_URL ? new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
}) : null;

redis?.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

redis?.on('connect', () => {
  console.log('[Redis] Connected');
});

// Key prefixes
const KEYS = {
  PRODUCTS: 'products:',
  PRODUCT_LIST: 'products:list',
  CATEGORIES: 'categories:',
};

export async function getProducts(): Promise<any[]> {
  if (!redis) throw new Error('Redis not connected');
  
  const ids = await redis.smembers(KEYS.PRODUCT_LIST);
  if (!ids.length) return [];
  
  const pipeline = redis.pipeline();
  ids.forEach(id => pipeline.get(KEYS.PRODUCTS + id));
  const results = await pipeline.exec();
  
  return results
    ?.map(([err, data]) => {
      if (err || !data) return null;
      try { return JSON.parse(data as string); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) || [];
}

export async function getProduct(id: string): Promise<any | null> {
  if (!redis) throw new Error('Redis not connected');
  const data = await redis.get(KEYS.PRODUCTS + id);
  return data ? JSON.parse(data) : null;
}

export async function saveProduct(product: any): Promise<void> {
  if (!redis) throw new Error('Redis not connected');
  
  const id = product.id || String(Date.now());
  const productWithId = { ...product, id, createdAt: product.createdAt || Date.now() };
  
  await redis.set(KEYS.PRODUCTS + id, JSON.stringify(productWithId));
  await redis.sadd(KEYS.PRODUCT_LIST, id);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!redis) throw new Error('Redis not connected');
  
  await redis.del(KEYS.PRODUCTS + id);
  await redis.srem(KEYS.PRODUCT_LIST, id);
}

export async function getCategories(): Promise<any[]> {
  if (!redis) return defaultCategories();
  
  const data = await redis.get(KEYS.CATEGORIES + 'all');
  if (data) return JSON.parse(data);
  
  const cats = defaultCategories();
  await redis.set(KEYS.CATEGORIES + 'all', JSON.stringify(cats));
  return cats;
}

function defaultCategories() {
  return [
    { id: 'mobile', label: 'Mobile & Accessories', icon: 'smartphone', slug: 'mobile' },
    { id: 'laptops', label: 'Laptops & Computing', icon: 'laptop', slug: 'laptops' },
    { id: 'networking', label: 'Networking & Wi-Fi', icon: 'network', slug: 'networking' },
    { id: 'power', label: 'Power & Backup', icon: 'battery', slug: 'power' },
    { id: 'audio', label: 'Audio & Headphones', icon: 'headphones', slug: 'audio' },
    { id: 'gadgets', label: 'Gadgets & Devices', icon: 'gadget', slug: 'gadgets' },
    { id: 'accessories', label: 'Accessories & Cables', icon: 'plug', slug: 'accessories' },
    { id: 'printing', label: 'Printing & Office', icon: 'printer', slug: 'printing' },
  ];
}

export { redis, KEYS };
