'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';

type HeroProductSliderProps = {
  products: Product[];
};

const AUTO_ADVANCE_MS = 6000;

const TRUST_POINTS = ['Genuine stock', 'Harare delivery', 'Local warranty support'];

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
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
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <Image
          src="/images/hero-tech-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(9,9,11,0.96),rgba(9,9,11,0.72)_55%,rgba(9,9,11,0.38)),linear-gradient(0deg,rgba(9,9,11,0.72),transparent_55%)]"
        />
        <div className="relative mx-auto flex min-h-[560px] max-w-[1920px] items-center px-5 py-16 sm:min-h-[680px] sm:px-8 sm:py-24 lg:min-h-[720px] lg:px-12 xl:px-16">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
              Cansan Electronics
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Technology that keeps moving.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/76">
              Laptops, storage, CCTV and networking gear, backed by clear local support.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400"
            >
              Browse the store <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-zinc-950 text-white"
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
        className="pointer-events-none object-cover object-center opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(9,9,11,0.97)_0%,rgba(9,9,11,0.9)_43%,rgba(9,9,11,0.5)_72%,rgba(9,9,11,0.7)_100%),linear-gradient(0deg,rgba(9,9,11,0.8),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="absolute right-[-12%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-red-600/20 blur-[130px]"
      />

      <div className="relative mx-auto min-h-[650px] max-w-[1920px] px-5 pb-24 pt-8 sm:min-h-[810px] sm:px-8 sm:pb-40 sm:pt-14 lg:min-h-[720px] lg:px-12 lg:pb-28 lg:pt-16 xl:px-16">
        <div
          className="flex min-h-[550px] overflow-hidden sm:min-h-[590px] lg:min-h-[570px]"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {slides.map((product, index) => (
            <article
              key={product.id}
              aria-hidden={index !== activeIndex}
              className="grid min-w-full grid-cols-1 items-center gap-3 sm:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:gap-12 xl:gap-20"
            >
              <div className="max-w-2xl pt-0 sm:pt-4 lg:pt-0">
                <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm sm:min-h-10 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Featured technology
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-400 sm:mt-8 sm:text-sm sm:tracking-[0.18em]">
                  {product.category}
                </p>
                <h1 className="mt-2 font-heading text-[clamp(2.35rem,11vw,3.2rem)] font-extrabold leading-[0.9] tracking-[-0.055em] text-white sm:mt-3 sm:text-[clamp(3rem,6.3vw,6.7rem)] sm:tracking-[-0.065em]">
                  {product.name}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
                  The equipment you need, with transparent pricing and a local team to help you
                  choose the right setup.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                  <Link
                    href={`/products/${product.slug}`}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 sm:w-auto"
                  >
                    Shop this product <ArrowIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/products"
                    tabIndex={index === activeIndex ? 0 : -1}
                    className="hidden min-h-12 items-center justify-center rounded-full border border-white/18 px-6 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:inline-flex"
                  >
                    Explore all products
                  </Link>
                </div>

                <ul className="mt-6 hidden flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-white/72 sm:flex">
                  {TRUST_POINTS.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mx-auto -mt-1 flex w-full max-w-[17rem] items-center justify-center sm:mt-0 sm:max-w-2xl lg:justify-end">
                <div
                  aria-hidden="true"
                  className="absolute inset-6 hidden rounded-full border border-white/10 bg-white/[0.035] sm:block"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-14 hidden rounded-full border border-white/10 sm:block"
                />
                <div className="relative w-full max-w-[34rem]">
                  <div className="relative aspect-[1.6] overflow-hidden sm:aspect-[1.08]">
                    <Image
                      src={product.image || '/images/products/placeholder.svg'}
                      alt={product.name}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 90vw, 620px"
                      className="object-contain p-0 drop-shadow-[0_24px_32px_rgba(0,0,0,0.4)] transition duration-500 sm:p-4 sm:drop-shadow-[0_34px_44px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-white/15 bg-zinc-950/85 p-3 shadow-xl backdrop-blur-xl transition hover:border-red-400/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 sm:rounded-2xl sm:p-5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                        Available now
                      </p>
                      <p className="mt-1 truncate text-lg font-extrabold text-white sm:text-2xl">
                        {formatCurrency(product.price, product.currency)}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 sm:h-11 sm:w-11">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-8 sm:right-8 lg:bottom-9 lg:left-12 lg:right-12 xl:left-16 xl:right-16">
          <div className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/52 sm:block">
            Discover Cansan
          </div>
          <div
            className="ml-auto flex items-center gap-2"
            role="tablist"
            aria-label="Featured products"
          >
            {slides.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show ${product.name}`}
                onClick={() => setActiveIndex(index)}
                className={`flex min-h-11 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 ${index === activeIndex ? 'gap-2 bg-white px-4 text-zinc-950' : 'w-11 justify-center border border-white/15 bg-white/5 text-white hover:bg-white/15'}`}
              >
                <span
                  className={`h-2 rounded-full ${index === activeIndex ? 'w-2 bg-red-600' : 'w-2 bg-white/60'}`}
                />
                {index === activeIndex ? (
                  <span className="hidden text-xs font-bold sm:inline">
                    {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
