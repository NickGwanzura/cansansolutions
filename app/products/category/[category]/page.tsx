import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductsClient } from '../../ProductsClient';
import { readProducts } from '@/lib/admin-data';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import {
  CATALOG_CATEGORIES,
  getCategoryBySlug,
  getCategoryDescription,
  getCategoryHref,
  getCategoryPageContent,
} from '@/lib/catalog';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 300;

type RouteParams = Promise<{ category: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { category } = await params;
  const matchedCategory = getCategoryBySlug(category);

  if (!matchedCategory) {
    return buildAbsoluteMetadata({
      title: 'Products',
      description: 'Browse quality tech products in Harare with fast WhatsApp ordering and local support.',
      path: '/products',
    });
  }

  const isLaptops = matchedCategory.slug === 'laptops';

  return buildAbsoluteMetadata({
    title: isLaptops
      ? 'Laptops for Sale in Harare | HP, Dell, Lenovo'
      : `${matchedCategory.label} in Harare | Buy from Cansan`,
    description: getCategoryDescription(matchedCategory.slug),
    path: getCategoryHref(matchedCategory.slug),
  });
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const [{ category }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const matchedCategory = getCategoryBySlug(category);

  if (!matchedCategory) {
    notFound();
  }

  const products = await readProducts();
  const categoryContent = getCategoryPageContent(matchedCategory.slug);
  const categoryTitle =
    matchedCategory.slug === 'laptops'
      ? 'Laptops for Sale in Harare'
      : `${matchedCategory.label} in Harare`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Products', url: absoluteUrl('/products') },
          { name: matchedCategory.label, url: absoluteUrl(getCategoryHref(matchedCategory.slug)) },
        ]}
      />
      <FaqJsonLd questions={categoryContent.faqs} />

      <ProductsClient
        initialProducts={products}
        categories={CATALOG_CATEGORIES}
        activeCategory={matchedCategory.slug}
        heading={categoryTitle}
        description={getCategoryDescription(matchedCategory.slug)}
        initialType={getSingleValue(resolvedSearchParams.type)}
        initialCondition={getSingleValue(resolvedSearchParams.condition)}
        initialSearchQuery={getSingleValue(resolvedSearchParams.q) ?? ''}
        initialSortBy={getSingleValue(resolvedSearchParams.sort)}
      />

      <section className="bg-zinc-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Why Buy From Cansan</p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">{matchedCategory.label} backed by local support</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{categoryContent.intro}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {categoryContent.trustPoints.map((point) => (
              <div key={point.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Buying Questions</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">Frequently asked about {matchedCategory.label.toLowerCase()}</h2>
              <div className="mt-6 space-y-4">
                {categoryContent.faqs.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-zinc-900">{item.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-zinc-950 p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">Ready To Buy</p>
              <h2 className="mt-2 text-2xl font-bold">{categoryContent.ctaTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{categoryContent.ctaBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={categoryContent.ctaHref}
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  {categoryContent.ctaLabel}
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Contact the Store
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
