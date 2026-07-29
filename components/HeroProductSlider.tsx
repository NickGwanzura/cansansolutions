'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';

type HeroProductSliderProps = {
  products: Product[];
};

const AUTO_ADVANCE_MS = 5000;

const HERO_METRICS = [
  { value: '500+', label: 'Tech products listed' },
  { value: '24/7', label: 'WhatsApp enquiry flow' },
  { value: 'Same Day', label: 'Harare delivery options' },
  { value: '100%', label: 'Local support guidance' },
];

const FALLBACK_SEARCHES = ['Laptop deals', 'Portable SSD', 'CCTV kits', 'WiFi routers'];

export function HeroProductSlider({ products }: HeroProductSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIndex((current) => (current + 1) % products.length);
      }
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [products.length]);

  const slides = products.length > 0 ? products : [];

  return (
    <section
      className="relative min-h-[820px] overflow-hidden bg-zinc-950 text-white sm:min-h-[900px] lg:h-[100svh] lg:max-h-[1080px] lg:min-h-[760px]"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <Image
        src="/images/hero-tech-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center opacity-35 mix-blend-screen"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,20,0.65),rgba(7,10,18,0.9)),radial-gradient(circle_at_center,rgba(220,38,38,0.16),transparent_34%)]" />

      {slides.length > 0 ? (
        <div
          className="relative z-10 flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((product, index) => (
            <div key={product.id} className="flex h-full w-full shrink-0 flex-col justify-between">
              <div className="mx-auto flex w-full max-w-[1920px] flex-1 items-center px-4 pb-64 pt-12 sm:px-6 sm:pb-72 lg:px-10 lg:pb-60">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                  <div className="mx-auto max-w-4xl text-left lg:mx-0">
                    <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/92 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Featured technology product
                    </div>

                    <h1 className="mt-6 max-w-3xl font-heading text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:mt-8 sm:text-5xl lg:text-7xl lg:leading-[0.96] lg:tracking-[-0.05em]">
                      Shop <span className="text-red-500">{product.name}</span> with fast local support.
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
                      Genuine stock, clear pricing, and a faster way to buy laptops, SSDs, CCTV, networking gear and office technology in Zimbabwe.
                    </p>

                    <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-50"
                        tabIndex={index === activeIndex ? 0 : -1}
                      >
                        View Product
                      </Link>
                      <Link
                        href="/products"
                        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/18 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                        tabIndex={index === activeIndex ? 0 : -1}
                      >
                        Explore Store
                      </Link>
                    </div>

                    <div className="mt-5 hidden flex-wrap items-center gap-2 sm:flex lg:justify-start">
                      {(product.tags.length > 0 ? product.tags.slice(0, 4) : FALLBACK_SEARCHES).map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="inline-flex min-h-10 items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-white/92"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mx-auto flex w-full max-w-xl justify-center lg:justify-end">
                    <Link
                      href={`/products/${product.slug}`}
                      className="group relative block w-full max-w-[26rem] overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-md sm:max-w-[32rem] sm:p-8"
                      tabIndex={index === activeIndex ? 0 : -1}
                    >
                      <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/25 blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-bold uppercase tracking-[0.15em] text-red-400">Featured today</p>
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/88">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Ready to order
                          </span>
                        </div>

                        <div className="relative mt-6 aspect-square overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))]">
                          <Image
                            src={product.image || '/images/products/placeholder.svg'}
                            alt={product.name}
                            fill
                            priority={index === 0}
                            sizes="(max-width: 1024px) 100vw, 512px"
                            className="object-contain p-8 transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="mt-6 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-sm text-white/88">Today&apos;s price</p>
                            <p className="text-3xl font-extrabold text-white">
                              {formatCurrency(product.price, product.currency)}
                            </p>
                          </div>
                          <span className="inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors group-hover:bg-red-50">
                            Buy now
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 flex h-full items-center justify-center px-4 pb-64 pt-12 sm:px-6 sm:pb-72 lg:px-10 lg:pb-60">
          <div className="mx-auto max-w-4xl text-left sm:text-center">
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/92 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Trusted Zimbabwe tech supply
            </div>
            <h1 className="mt-6 font-heading text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:mt-8 sm:text-5xl lg:text-7xl lg:leading-[0.96] lg:tracking-[-0.05em]">
              Technology products that perform for work, school and business.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
              Browse the latest laptops, SSDs, CCTV, networking gear and more through a faster local storefront.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-50">
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-56 z-20 px-4 sm:bottom-60 sm:px-6 lg:bottom-48 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          {slides.length > 1 ? (
            <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
              {slides.map((product, index) => (
                <button
                  key={`${product.id}-chip`}
                  onClick={() => setActiveIndex(index)}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    index === activeIndex
                      ? 'border-white/20 bg-white/16 text-white'
                      : 'border-white/10 bg-white/5 text-white/82 hover:bg-white/10'
                  }`}
                >
                  {product.name.split(' ').slice(0, 3).join(' ')}
                </button>
              ))}
            </div>
          ) : null}

          {slides.length > 1 ? (
            <div className="flex items-center justify-center gap-3">
              {slides.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${product.name}`}
                  aria-current={index === activeIndex}
                  className={`flex min-h-11 min-w-11 items-center justify-center rounded-full transition-all ${
                    index === activeIndex ? 'bg-white/10' : 'bg-transparent hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all ${
                      index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/60'
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-zinc-950/45 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-[1920px] grid-cols-2 gap-0 md:grid-cols-4">
          {HERO_METRICS.map((metric) => (
            <div key={metric.label} className="border-white/10 px-4 py-5 text-center even:border-l md:border-l first:md:border-l-0 md:px-6 md:py-7">
              <p className="text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">{metric.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/88">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
