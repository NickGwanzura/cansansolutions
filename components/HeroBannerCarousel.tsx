'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Banner } from '@/lib/types';

type HeroBannerCarouselProps = {
  banners: Banner[];
};

const AUTO_ADVANCE_MS = 6000;

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIndex((current) => (current + 1) % banners.length);
      }
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="relative w-full shrink-0" aria-hidden={index !== activeIndex}>
            <div className="relative flex min-h-[220px] flex-col justify-center gap-4 overflow-hidden px-6 py-10 sm:min-h-[260px] sm:px-12">
              {banner.image ? (
                <Image
                  src={banner.image}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover opacity-40"
                />
              ) : null}

              <div className="relative max-w-2xl">
                {banner.badge ? (
                  <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    {banner.badge}
                  </span>
                ) : null}
                <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{banner.title}</h2>
                {banner.subtitle ? (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">{banner.subtitle}</p>
                ) : null}
                {banner.buttonText && banner.buttonLink ? (
                  <Link
                    href={banner.buttonLink}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-100"
                  >
                    {banner.buttonText}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${banner.name}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
