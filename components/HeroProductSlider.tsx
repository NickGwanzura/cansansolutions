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

  if (products.length === 0) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-2 -right-6 left-10 rounded-[2rem] bg-gradient-to-br from-red-600 to-zinc-950 [clip-path:polygon(12%_0,100%_0,100%_100%,0%_100%)]"
      />

      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block w-full shrink-0 p-5"
              tabIndex={index === activeIndex ? 0 : -1}
              aria-hidden={index !== activeIndex}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700">Featured Product</p>
              <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-zinc-900">{product.name}</h2>

              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-50">
                <Image
                  src={product.image || '/images/products/placeholder.svg'}
                  alt={product.name}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-contain p-4 transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">Today&apos;s price</p>
                  <p className="text-2xl font-extrabold text-zinc-950">
                    {formatCurrency(product.price, product.currency)}
                  </p>
                </div>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Fast selling
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {products.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${product.name}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? 'w-6 bg-red-600' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
