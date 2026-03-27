import { Redis } from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

const REDIS_URL = process.env.REDIS_URL;
const DATA_FILE = '/app/data/products.json';

// Try Redis, but fallback to file if not available
let redis: Redis | null = null;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      retryStrategy: () => null, // Don't retry
    });
    
    redis.on('error', () => {
      redis = null;
    });
  } catch {
    redis = null;
  }
}

// Key prefixes
const KEYS = {
  PRODUCTS: 'products:',
  PRODUCT_LIST: 'products:list',
  CATEGORIES: 'categories:',
};

// File-based storage (fallback)
async function readDataFile(): Promise<any[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeDataFile(products: any[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

export async function getProducts(): Promise<any[]> {
  if (redis) {
    try {
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
    } catch {
      // Fall through to file
    }
  }
  
  // File fallback
  return readDataFile();
}

export async function getProduct(id: string): Promise<any | null> {
  if (redis) {
    try {
      const data = await redis.get(KEYS.PRODUCTS + id);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fall through
    }
  }
  
  const products = await readDataFile();
  return products.find((p: any) => p.id === id) || null;
}

export async function saveProduct(product: any): Promise<void> {
  const id = product.id || String(Date.now());
  const productWithId = { ...product, id, createdAt: product.createdAt || Date.now() };
  
  if (redis) {
    try {
      await redis.set(KEYS.PRODUCTS + id, JSON.stringify(productWithId));
      await redis.sadd(KEYS.PRODUCT_LIST, id);
      return;
    } catch {
      // Fall through to file
    }
  }
  
  // File fallback
  const products = await readDataFile();
  const existingIndex = products.findIndex((p: any) => p.id === id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = productWithId;
  } else {
    products.push(productWithId);
  }
  
  await writeDataFile(products);
}

export async function deleteProduct(id: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(KEYS.PRODUCTS + id);
      await redis.srem(KEYS.PRODUCT_LIST, id);
      return;
    } catch {
      // Fall through
    }
  }
  
  // File fallback
  const products = await readDataFile();
  const filtered = products.filter((p: any) => p.id !== id);
  await writeDataFile(filtered);
}

export async function getCategories(): Promise<any[]> {
  if (redis) {
    try {
      const data = await redis.get(KEYS.CATEGORIES + 'all');
      if (data) return JSON.parse(data);
    } catch {
      // Fall through
    }
  }
  
  return defaultCategories();
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
