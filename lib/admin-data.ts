import fs from 'fs/promises';
import path from 'path';
import type { Product } from './types';

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function readProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read products:', error);
    return [];
  }
}

export async function writeProducts(products: Product[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Failed to write products:', error);
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
