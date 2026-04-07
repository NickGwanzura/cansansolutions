import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { readProducts } from '@/lib/admin-data';
import { ProductCard } from '@/components/ProductCard';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { extractBrandSlugFromProduct, getBrandBySlug, getBrandHref, STORE_BRANDS } from '@/lib/brands';

export const revalidate = 300;

type RouteParams = Promise<{ brand: string }>;

export async function generateStaticParams() {
  return STORE_BRANDS.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { brand } = await params;
  const matchedBrand = getBrandBySlug(brand);

  if (!matchedBrand) {
    return {
      title: 'Brand Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildAbsoluteMetadata({
    title: `${matchedBrand.name} in Harare | Buy from Cansan`,
    description: matchedBrand.description,
    path: getBrandHref(matchedBrand.slug),
  });
}

export default async function BrandPage({ params }: { params: RouteParams }) {
  const { brand } = await params;
  const matchedBrand = getBrandBySlug(brand);

  if (!matchedBrand) {
    notFound();
  }

  const products = await readProducts();
  const brandProducts = products.filter((product) => extractBrandSlugFromProduct(product) === matchedBrand.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Brands', url: absoluteUrl('/brands') },
          { name: matchedBrand.name, url: absoluteUrl(getBrandHref(matchedBrand.slug)) },
        ]}
      />
      <FaqJsonLd questions={matchedBrand.faq} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Brand Collection</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{matchedBrand.name} products in Harare</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">{matchedBrand.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">What To Expect</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">{matchedBrand.ctaTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{matchedBrand.ctaBody}</p>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {brandProducts.length > 0 ? `${brandProducts.length} ${matchedBrand.name} product${brandProducts.length === 1 ? '' : 's'} available` : `No live ${matchedBrand.name} products are currently exposed`}
                </h3>

                {brandProducts.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {brandProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                    <p className="text-sm leading-relaxed text-zinc-600">
                      This brand page is live so buyers can enquire even when product visibility changes. Use WhatsApp if you need a current {matchedBrand.name} quote or want us to source a model not shown yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Brand FAQ</p>
                <div className="mt-4 space-y-4">
                  {matchedBrand.faq.map((item) => (
                    <div key={item.question}>
                      <h3 className="text-sm font-semibold text-zinc-900">{item.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-red-600 p-6 text-white">
                <h2 className="text-xl font-bold">Need a {matchedBrand.name} quote?</h2>
                <p className="mt-3 text-sm leading-relaxed text-red-100">
                  Send the model or the product links you want. We will confirm stock, pricing, and next steps.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                    Contact Cansan
                  </Link>
                  <Link href="/bulk-orders" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Bulk Quote
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
