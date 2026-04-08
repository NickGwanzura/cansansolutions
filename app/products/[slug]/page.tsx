import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProductJsonLd } from '@/components/JsonLd';
import { AddToCartButton } from './AddToCartButton';
import { getProductBySlug, readProducts } from '@/lib/admin-data';
import { getCategoryBySlug, getCategoryHref, isBundleProduct } from '@/lib/catalog';
import { truncateText, stripHtml, buildAbsoluteMetadata } from '@/lib/seo';
import { formatCurrency } from '@/lib/utils';
import { getBrandForProduct, getBrandHref } from '@/lib/brands';

export const revalidate = 300;

type RouteParams = Promise<{ slug: string }>;

function getProductImage(productImage: string) {
  return productImage || '/images/products/placeholder.svg';
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const category = getCategoryBySlug(product.category);
  const shortDescription = truncateText(stripHtml(product.description), 155);
  const title =
    category?.slug === 'mobile'
      ? `${product.name} Price in Zimbabwe | Buy in Harare`
      : `${product.name} | ${category?.label ?? 'Tech'} | Cansan`;

  return buildAbsoluteMetadata({
    title,
    description: shortDescription,
    path: `/products/${product.slug}`,
    image: getProductImage(product.image),
  });
}

export default async function ProductPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.category);
  const related = (await readProducts())
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const isBundle = isBundleProduct(product);
  const imageSrc = getProductImage(product.image);
  const brand = getBrandForProduct(product);
  const waText = encodeURIComponent(
    `Hi Cansan Solutions, I'd like to enquire about: ${product.name}${isBundle ? ' bundle' : ''} (${formatCurrency(product.price, product.currency)})`
  );

  return (
    <>
      <ProductJsonLd product={product} categoryName={category?.label} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-600">
            Products
          </Link>
          {category ? (
            <>
              <span>/</span>
              <Link href={getCategoryHref(category.slug)} className="hover:text-zinc-600">
                {category.label}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-zinc-600">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-10">
            <Image
              src={imageSrc}
              alt={product.name}
              width={720}
              height={720}
              className="max-h-72 w-full object-contain"
            />
          </div>

          <div className="flex flex-col gap-4">
            {category ? (
              <Link
                href={getCategoryHref(category.slug)}
                className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                {category.label}
              </Link>
            ) : null}

            {isBundle ? (
              <span className="w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                Bundle Deal
              </span>
            ) : null}

            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.name}</h1>

            {product.specs && Object.keys(product.specs).length > 0 ? (
              <ul className="space-y-1">
                {Object.entries(product.specs).map(([key, val]) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                    <span>
                      <span className="font-semibold text-zinc-700">{key}:</span> {val}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {isBundle && product.bundleItems.length > 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">What&apos;s included</p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {product.bundleItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {brand ? (
                <Link
                  href={getBrandHref(brand.slug)}
                  className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                >
                  {brand.name}
                </Link>
              ) : null}
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] text-zinc-500">
                  {tag}
                </span>
              ))}
            </div>

            {product.description ? (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed text-zinc-600 prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : null}

            <div className="my-2 h-px bg-zinc-200" />

            <div className="flex items-center gap-2">
              {product.inStock ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  In stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Out of stock
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-900">{formatCurrency(product.price, product.currency)}</span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-lg text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>

            <p className="text-xs text-zinc-400">
              Price indicative. Confirm stock, delivery, and final quote on WhatsApp before ordering.
            </p>

            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              {[
                {
                  title: 'Stock confirmed fast',
                  body: 'Send the product on WhatsApp and get a live stock check before you pay.',
                },
                {
                  title: 'Delivery or collection',
                  body: 'Harare delivery and in-store collection are confirmed with the order.',
                },
                {
                  title: 'Support after purchase',
                  body: 'Warranty, payment, and next-step guidance stay clear before checkout.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton product={product} />
              <a
                href={`https://wa.me/263773754747?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Enquire on WhatsApp
              </a>
            </div>

            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              {[
                { href: '/warranty', label: 'Warranty Info' },
                { href: '/delivery', label: 'Delivery Info' },
                { href: '/payments', label: 'Payment Options' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-xs font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-5 text-lg font-bold text-zinc-900">More in {category?.label ?? 'this category'}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
                >
                  <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-zinc-50 p-3">
                    <Image
                      src={getProductImage(relatedProduct.image)}
                      alt={relatedProduct.name}
                      width={220}
                      height={220}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-zinc-800 group-hover:underline">
                    {relatedProduct.name}
                  </p>
                  {isBundleProduct(relatedProduct) ? (
                    <p className="mt-1 text-[11px] font-medium text-zinc-500">
                      {relatedProduct.bundleItems.length} item bundle
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs font-bold text-zinc-900">
                    {formatCurrency(relatedProduct.price, relatedProduct.currency)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
