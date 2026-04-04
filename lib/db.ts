import { Redis } from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

const REDIS_URL = process.env.REDIS_URL;

// Data file path configuration
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

// Try Redis, but fallback to file if not available
let redis: Redis | null = null;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      retryStrategy: () => null,
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

// File-based storage - NEVER creates file, only reads existing
async function readDataFile(): Promise<any[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    // File doesn't exist or unreadable - return empty, DON'T CREATE
    if (err.code === 'ENOENT') {
      console.log(`[DB] No products.json found at ${DATA_FILE}, returning empty`);
    } else {
      console.error(`[DB] Read error: ${err.message}`);
    }
    return [];
  }
}

// Write only when explicitly saving products
async function writeDataFile(products: any[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
  } catch (err: any) {
    console.error(`[DB] Write failed: ${err.message}`);
    throw err;
  }
}

export async function getProducts(): Promise<any[]> {
  const fileProducts = await readDataFile();
  
  if (redis) {
    try {
      const ids = await redis.smembers(KEYS.PRODUCT_LIST);
      if (ids.length > 0) {
        const pipeline = redis.pipeline();
        ids.forEach(id => pipeline.get(KEYS.PRODUCTS + id));
        const results = await pipeline.exec();
        
        const redisProducts = results
          ?.map(([err, data]) => {
            if (err || !data) return null;
            try { return JSON.parse(data as string); } catch { return null; }
          })
          .filter(Boolean) || [];
        
        const fileIds = new Set(fileProducts.map((p: any) => p.id));
        const missingFromFile = redisProducts.filter((p: any) => p && !fileIds.has(p.id));
        
        if (missingFromFile.length > 0) {
          fileProducts.push(...missingFromFile);
          await writeDataFile(fileProducts);
        }
      }
    } catch (err) {
      console.error('[getProducts] Redis sync error:', err);
    }
  }
  
  return fileProducts.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getProduct(id: string): Promise<any | null> {
  const products = await readDataFile();
  const product = products.find((p: any) => p.id === id);
  
  if (!product && redis) {
    try {
      const data = await redis.get(KEYS.PRODUCTS + id);
      if (data) {
        const redisProduct = JSON.parse(data);
        products.push(redisProduct);
        await writeDataFile(products);
        return redisProduct;
      }
    } catch (err) {
      console.error('[getProduct] Redis read error:', err);
    }
  }
  
  return product || null;
}

export async function saveProduct(product: any): Promise<void> {
  const id = product.id || String(Date.now());
  const productWithId = { ...product, id, createdAt: product.createdAt || Date.now() };
  
  const products = await readDataFile();
  const existingIndex = products.findIndex((p: any) => p.id === id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = productWithId;
  } else {
    products.push(productWithId);
  }
  
  await writeDataFile(products);
  
  if (redis) {
    try {
      await redis.set(KEYS.PRODUCTS + id, JSON.stringify(productWithId));
      await redis.sadd(KEYS.PRODUCT_LIST, id);
    } catch (err) {
      console.error('[saveProduct] Redis write failed:', err);
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await readDataFile();
  const filtered = products.filter((p: any) => p.id !== id);
  await writeDataFile(filtered);
  
  if (redis) {
    try {
      await redis.del(KEYS.PRODUCTS + id);
      await redis.srem(KEYS.PRODUCT_LIST, id);
    } catch (err) {
      console.error('[deleteProduct] Redis delete failed:', err);
    }
  }
}

export async function replaceProducts(products: any[]): Promise<void> {
  await writeDataFile(products);

  if (redis) {
    try {
      const existingIds = await redis.smembers(KEYS.PRODUCT_LIST);
      const pipeline = redis.pipeline();

      existingIds.forEach((id) => {
        pipeline.del(KEYS.PRODUCTS + id);
      });

      pipeline.del(KEYS.PRODUCT_LIST);

      products.forEach((product) => {
        pipeline.set(KEYS.PRODUCTS + product.id, JSON.stringify(product));
        pipeline.sadd(KEYS.PRODUCT_LIST, product.id);
      });

      await pipeline.exec();
    } catch (err) {
      console.error('[replaceProducts] Redis sync failed:', err);
    }
  }
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
    { id: 'desktops', label: 'Desktops & All-in-Ones', icon: 'desktop', slug: 'desktops' },
    { id: 'networking', label: 'Networking & Wi-Fi', icon: 'network', slug: 'networking' },
    { id: 'cctv', label: 'CCTV & Security', icon: 'shield-camera', slug: 'cctv' },
    { id: 'power', label: 'Power & Backup', icon: 'battery', slug: 'power' },
    { id: 'audio', label: 'Audio & Headphones', icon: 'headphones', slug: 'audio' },
    { id: 'gadgets', label: 'Gadgets & Devices', icon: 'gadget', slug: 'gadgets' },
    { id: 'accessories', label: 'Accessories & Cables', icon: 'plug', slug: 'accessories' },
    { id: 'printing', label: 'Printing & Office', icon: 'printer', slug: 'printing' },
    { id: 'bundles', label: 'Bundles & Deals', icon: 'bundle', slug: 'bundles' },
  ];
}

export { redis, KEYS };
