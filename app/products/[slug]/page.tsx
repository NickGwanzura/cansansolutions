'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import Link from 'next/link';
import { CATALOG_CATEGORIES, isBundleProduct } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    fetch('/api/products')
      .then(res => res.json())
      .then((products: Product[]) => {
        const found = products.find(p => p.slug === slug);
        if (!found) {
          notFound();
          return;
        }
        setProduct(found);
        
        const relatedProducts = products
          .filter(p => p.category === found.category && p.id !== found.id)
          .slice(0, 4);
        setRelated(relatedProducts);
        
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        notFound();
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const category = CATALOG_CATEGORIES.find((c) => c.id === product.category);
  const isBundle = isBundleProduct(product);
  
  const waText = encodeURIComponent(
    `Hi Cansan Solutions, I'd like to enquire about: ${product.name}${isBundle ? ' bundle' : ''} ($${product.price})`
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="hover:text-zinc-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-zinc-600">Products</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${category.slug}`} className="hover:text-zinc-600">
              {category.label}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-zinc-600">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-10">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-72 w-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {category && (
            <Link
              href={`/products?category=${category.slug}`}
              className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              {category.label}
            </Link>
          )}
          {isBundle && (
            <span className="w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
              Bundle Deal
            </span>
          )}
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.name}</h1>
          <p className="text-sm leading-relaxed text-zinc-500">{product.description}</p>

          {isBundle && product.bundleItems.length > 0 && (
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
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] text-zinc-500">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-zinc-900">{formatCurrency(product.price, product.currency)}</span>
            {!product.inStock && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">Out of stock</span>
            )}
          </div>

          <p className="text-xs text-zinc-400">Price indicative. Confirm via WhatsApp before ordering.</p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
            <a
              href={`https://wa.me/263773754747?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-lg font-bold text-zinc-900">More in {category?.label}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
              >
                <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-zinc-50 p-3">
                  <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 line-clamp-2 group-hover:underline">{p.name}</p>
                {isBundleProduct(p) && (
                  <p className="mt-1 text-[11px] font-medium text-zinc-500">
                    {p.bundleItems.length} item bundle
                  </p>
                )}
                <p className="mt-1 text-xs font-bold text-zinc-900">{formatCurrency(p.price, p.currency)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
