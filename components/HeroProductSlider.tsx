'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ProductImage as SafeProductImage } from './ProductImage';

type HeroProductSliderProps = { products: Product[] };
const AUTO_ADVANCE_MS = 6000;
const FALLBACK_BY_CATEGORY: Record<string, string> = {
  laptops: '/images/products/laptop-new.svg',
  desktops: '/images/products/desktop-new.svg',
  monitors: '/images/products/imac.svg',
  'sa-imports': '/images/products/laptop-used.svg',
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ProductImage({ product, sizes }: { product: Product; sizes: string }) {
  return (
    <SafeProductImage
      src={product.image || '/images/products/placeholder.svg'}
      fallbackSrc={FALLBACK_BY_CATEGORY[product.category] || '/images/products/placeholder.svg'}
      alt={product.name}
      fill
      sizes={sizes}
      className="object-contain p-6 mix-blend-multiply drop-shadow-[0_18px_28px_rgba(15,23,42,0.2)] transition duration-500 sm:p-8"
    />
  );
}

export function HeroProductSlider({ products }: HeroProductSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);
  const slides = products.slice(0, 6);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = window.setInterval(() => {
      if (!pausedRef.current) setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="bg-zinc-950 px-4 py-8 text-white sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,rgba(220,38,38,0.35),transparent_45%),#09090b] px-6 py-14 sm:px-12">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              Cansan Electronics
            </p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] sm:text-6xl">
              Tech that keeps your day moving.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              Laptops, storage, CCTV and networking gear with local support.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Browse the store <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const active = slides[activeIndex];
  const secondary = slides[(activeIndex + 1) % slides.length];
  const tertiary = slides[(activeIndex + 2) % slides.length];

  return (
    <section
      className="bg-white px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <article className="relative min-h-[430px] overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_78%_32%,rgba(239,68,68,0.26),transparent_35%),linear-gradient(135deg,#07070a,#17131a)] px-6 py-8 text-white sm:min-h-[520px] sm:px-10 sm:py-12">
            <div className="relative z-10 max-w-[44%] sm:max-w-[44%]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                Featured technology
              </p>
              <h1 className="mt-4 line-clamp-3 font-heading text-3xl font-extrabold leading-[0.94] tracking-[-0.055em] sm:text-5xl lg:text-5xl">
                {active.name}
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
                Reliable technology, clear pricing, and local support for the way you work, learn,
                and connect.
              </p>
              <Link
                href={`/products/${active.slug}`}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300"
              >
                Shop now <ArrowIcon />
              </Link>
            </div>
            <div className="absolute inset-y-4 right-[2%] w-[54%] sm:right-[3%] sm:w-[52%]">
              <ProductImage product={active} sizes="(max-width: 640px) 62vw, 560px" />
            </div>
            <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-10">
              {slides.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${product.name}`}
                  aria-current={index === activeIndex}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                >
                  <span
                    className={`block rounded-full transition-all ${index === activeIndex ? 'h-2 w-8 bg-red-500' : 'h-2 w-2 bg-white/45 hover:bg-white/80'}`}
                  />
                </button>
              ))}
            </div>
          </article>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[secondary, tertiary].map((product, index) => (
              <Link
                key={`${product.id}-${index}`}
                href={`/products/${product.slug}`}
                className={`group relative flex min-h-[205px] items-center overflow-hidden rounded-[1.75rem] px-6 py-6 pr-[46%] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 ${index === 0 ? 'bg-red-50' : 'bg-zinc-100'}`}
              >
                <div className="relative z-10 min-w-0 max-w-full">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    {index === 0 ? 'Popular this week' : 'Ready for your setup'}
                  </p>
                  <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-xl">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-sm font-semibold text-red-700">
                    From {formatCurrency(product.price, product.currency)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 transition group-hover:text-red-700">
                    View product
                    <ArrowIcon />
                  </span>
                </div>
                <div className="absolute inset-y-4 right-4 z-0 w-[40%] overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-sm transition-transform duration-300 group-hover:scale-105 sm:right-5 sm:w-[39%]">
                  <ProductImage product={product} sizes="(max-width: 1024px) 48vw, 300px" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 sm:grid-cols-4 sm:px-6">
          {[
            ['Free local delivery', 'Harare orders'],
            ['Genuine stock', 'Verified products'],
            ['WhatsApp support', 'Fast replies'],
            ['Secure checkout', 'Clear pricing'],
          ].map(([title, detail]) => (
            <div
              key={title}
              className="flex items-start gap-2.5 border-zinc-200 py-1 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-5"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-600" />
              <div>
                <p className="text-xs font-bold text-zinc-900 sm:text-sm">{title}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
