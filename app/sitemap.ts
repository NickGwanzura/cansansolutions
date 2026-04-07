import type { MetadataRoute } from 'next';
import { readProducts } from '@/lib/admin-data';
import { getAllInsights, getInsightHref } from '@/lib/articles';
import { CATALOG_CATEGORIES, getCategoryHref } from '@/lib/catalog';
import { STORE_BRANDS, getBrandHref } from '@/lib/brands';
import { getAllSolutions, getSolutionHref } from '@/lib/solutions';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await readProducts();
  const insights = getAllInsights();
  const solutions = getAllSolutions();
  const staticRoutes = ['/', '/products', '/brands', '/services', '/solutions', '/insights', '/about', '/contact', '/warranty', '/delivery', '/payments', '/bulk-orders'];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
  const categoryEntries: MetadataRoute.Sitemap = CATALOG_CATEGORIES.map((category) => ({
    url: absoluteUrl(getCategoryHref(category.slug)),
    changeFrequency: 'daily',
    priority: 0.85,
  }));
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  const brandEntries: MetadataRoute.Sitemap = STORE_BRANDS.map((brand) => ({
    url: absoluteUrl(getBrandHref(brand.slug)),
    changeFrequency: 'weekly',
    priority: 0.65,
  }));
  const insightEntries: MetadataRoute.Sitemap = insights.map((article) => ({
    url: absoluteUrl(getInsightHref(article.slug)),
    changeFrequency: 'monthly',
    priority: 0.65,
  }));
  const solutionEntries: MetadataRoute.Sitemap = solutions.map((solution) => ({
    url: absoluteUrl(getSolutionHref(solution.slug)),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...brandEntries,
    ...solutionEntries,
    ...insightEntries,
    ...productEntries,
  ];
}
