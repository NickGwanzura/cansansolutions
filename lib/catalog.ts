import categoriesData from '@/data/categories.json';
import type { Category, ProductType } from './types';

export const CATALOG_CATEGORIES = categoriesData as Category[];

export const CATEGORY_LABELS = Object.fromEntries(
  CATALOG_CATEGORIES.map((category) => [category.slug, category.label])
) as Record<string, string>;

function titleizeSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? titleizeSlug(category);
}

export function normalizeProductType(value: unknown): ProductType {
  return value === 'bundle' ? 'bundle' : 'single';
}

export function normalizeBundleItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function isBundleProduct(product: { productType?: unknown }): boolean {
  return normalizeProductType(product.productType) === 'bundle';
}
