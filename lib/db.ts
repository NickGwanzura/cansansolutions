import { Redis } from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

const REDIS_URL = process.env.REDIS_URL;

// DEBUG: Log environment on startup
console.log('[DB] Environment check:');
console.log('[DB]   DATA_DIR env:', process.env.DATA_DIR);
console.log('[DB]   process.cwd():', process.cwd());

// Data file path: use env var or fallback to project-relative path
// In Docker: DATA_DIR=/app/data
// Local dev: defaults to ./data relative to project root
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

console.log('[DB]   DATA_DIR resolved:', DATA_DIR);
console.log('[DB]   DATA_FILE resolved:', DATA_FILE);

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
    const parsed = JSON.parse(data);
    console.log(`[DB] Read ${parsed.length} products from ${DATA_FILE}`);
    return parsed;
  } catch (err: any) {
    // CRITICAL: Log the actual error instead of silently returning []
    if (err.code === 'ENOENT') {
      console.log(`[DB] File not found: ${DATA_FILE}, returning empty array`);
      // Initialize with empty array
      try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, '[]');
        console.log(`[DB] Created empty products.json at ${DATA_FILE}`);
      } catch (writeErr: any) {
        console.error(`[DB] CRITICAL: Failed to create file: ${writeErr.message}`);
      }
    } else {
      console.error(`[DB] CRITICAL: Read error: ${err.message}`);
    }
    return [];
  }
}

async function writeDataFile(products: any[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    console.log(`[DB] Saved ${products.length} products to ${DATA_FILE}`);
  } catch (err: any) {
    console.error(`[DB] CRITICAL: Write failed: ${err.message}`);
    throw err; // Re-throw so API returns 500
  }
}

export async function getProducts(): Promise<any[]> {
  // ALWAYS read from file (source of truth)
  const fileProducts = await readDataFile();
  
  // If Redis available, try to sync any Redis-only products back to file
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
        
        // Merge: File products take precedence, add any Redis-only products
        const fileIds = new Set(fileProducts.map((p: any) => p.id));
        const missingFromFile = redisProducts.filter((p: any) => p && !fileIds.has(p.id));
        
        if (missingFromFile.length > 0) {
          console.log(`[getProducts] Found ${missingFromFile.length} products in Redis not in file, syncing...`);
          fileProducts.push(...missingFromFile);
          // Save merged list back to file
          await writeDataFile(fileProducts);
        }
      }
    } catch (err) {
      console.error('[getProducts] Redis sync error:', err);
      // Continue with file data
    }
  }
  
  return fileProducts.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getProduct(id: string): Promise<any | null> {
  // ALWAYS read from file (source of truth)
  const products = await readDataFile();
  const product = products.find((p: any) => p.id === id);
  
  // If not in file but in Redis, sync it back
  if (!product && redis) {
    try {
      const data = await redis.get(KEYS.PRODUCTS + id);
      if (data) {
        const redisProduct = JSON.parse(data);
        console.log(`[getProduct] Found product ${id} in Redis but not file, syncing...`);
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
  
  // ALWAYS write to file (source of truth)
  const products = await readDataFile();
  const existingIndex = products.findIndex((p: any) => p.id === id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = productWithId;
    console.log(`[DB] Updated product ${id}`);
  } else {
    products.push(productWithId);
    console.log(`[DB] Added new product ${id}`);
  }
  
  await writeDataFile(products);
  
  // Also write to Redis if available (for performance)
  if (redis) {
    try {
      await redis.set(KEYS.PRODUCTS + id, JSON.stringify(productWithId));
      await redis.sadd(KEYS.PRODUCT_LIST, id);
    } catch (err) {
      console.error('[saveProduct] Redis write failed, but file saved:', err);
      // Don't throw - file is source of truth
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  // ALWAYS delete from file (source of truth)
  const products = await readDataFile();
  const filtered = products.filter((p: any) => p.id !== id);
  await writeDataFile(filtered);
  
  // Also delete from Redis if available
  if (redis) {
    try {
      await redis.del(KEYS.PRODUCTS + id);
      await redis.srem(KEYS.PRODUCT_LIST, id);
    } catch (err) {
      console.error('[deleteProduct] Redis delete failed, but file updated:', err);
      // Don't throw - file is source of truth
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
      console.error('[replaceProducts] Redis sync failed, but file updated:', err);
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
