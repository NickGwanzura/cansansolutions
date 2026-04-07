import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProductsClient } from './ProductsClient';
import { readProducts } from '@/lib/admin-data';
import { CATALOG_CATEGORIES, getCategoryHref, isValidCategorySlug } from '@/lib/catalog';
import { buildAbsoluteMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Tech Store in Harare | Laptops, Printers, CCTV & Networking',
  description:
    'Browse laptops, printers, networking gear, CCTV, phones, and accessories in Harare. Compare products, confirm stock, and order via WhatsApp.',
  path: '/products',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const category = getSingleValue(resolvedSearchParams.category);

  if (category && isValidCategorySlug(category)) {
    const params = new URLSearchParams();

    for (const [key, rawValue] of Object.entries(resolvedSearchParams)) {
      if (key === 'category') {
        continue;
      }

      const values = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
      for (const value of values) {
        params.append(key, value);
      }
    }

    const queryString = params.toString();
    redirect(`${getCategoryHref(category)}${queryString ? `?${queryString}` : ''}`);
  }

  const products = await readProducts();

  return (
    <ProductsClient
      initialProducts={products}
      categories={CATALOG_CATEGORIES}
      activeCategory="all"
      heading="All Tech Products"
      description="Shop laptops, phones, printers, CCTV, networking gear, and accessories in Harare with quick WhatsApp ordering and local support."
      initialType={getSingleValue(resolvedSearchParams.type)}
      initialCondition={getSingleValue(resolvedSearchParams.condition)}
      initialSearchQuery={getSingleValue(resolvedSearchParams.q) ?? ''}
      initialSortBy={getSingleValue(resolvedSearchParams.sort)}
    />
  );
}
