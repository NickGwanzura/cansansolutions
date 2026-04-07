import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { readProducts } from '@/lib/admin-data';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { extractBrandSlugFromProduct, getBrandHref, getBrandsWithProducts, STORE_BRANDS } from '@/lib/brands';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Shop by Brand | HP, Dell, Lenovo, Samsung, TP-Link',
  description:
    'Browse Cansan collections by brand, including HP, Dell, Lenovo, Samsung, and TP-Link, with local support in Harare.',
  path: '/brands',
});

export default async function BrandsPage() {
  const products = await readProducts();
  const availableBrands = getBrandsWithProducts(products);
  const brandsToShow = availableBrands.length > 0 ? availableBrands : STORE_BRANDS;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Brands', url: absoluteUrl('/brands') },
        ]}
      />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Collections</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Shop by brand</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Some buyers already know the brand they trust. These collection pages make it easier to browse by brand before confirming price and stock with the store.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandsToShow.map((brand) => {
              const brandCount = products.filter((product) => extractBrandSlugFromProduct(product) === brand.slug).length;

              return (
                <Link
                  key={brand.slug}
                  href={getBrandHref(brand.slug)}
                  className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Brand Collection</p>
                  <h2 className="mt-3 text-2xl font-bold text-zinc-900">{brand.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">{brand.description}</p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-500">
                      {brandCount > 0 ? `${brandCount} matching product${brandCount === 1 ? '' : 's'}` : 'Browse collection'}
                    </span>
                    <span className="font-semibold text-red-600 group-hover:underline">View brand</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
