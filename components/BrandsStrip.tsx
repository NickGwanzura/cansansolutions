'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, type SyntheticEvent } from 'react';
import type { Brand } from '@/lib/types';

type LogoMode = 'wordmark' | 'standard' | 'badge';

const BRAND_LOGO_MODE_HINTS: Record<string, LogoMode> = {
  samsung: 'wordmark',
  lenovo: 'wordmark',
  'tp link': 'wordmark',
  tplink: 'wordmark',
  playstation: 'wordmark',
  'play station': 'wordmark',
  ryzen: 'badge',
  hp: 'badge',
  lg: 'badge',
};

function normalizeBrandName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getLogoMode(name: string, ratio: number | null) {
  const normalizedName = normalizeBrandName(name);

  if (BRAND_LOGO_MODE_HINTS[normalizedName]) {
    return BRAND_LOGO_MODE_HINTS[normalizedName];
  }

  if (ratio !== null) {
    if (ratio >= 2.35) return 'wordmark';
    if (ratio <= 1.15) return 'badge';
  }

  return 'standard';
}

export function BrandsStrip() {
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);
  const [logoModes, setLogoModes] = useState<Record<string, LogoMode>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      try {
        const res = await fetch('/api/brands', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Brand[];
        if (!cancelled) {
          setDbBrands(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('[BrandsStrip] Failed to load brands from database:', error);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeBrands = dbBrands.filter((brand) => brand.active && brand.logoUrl);
  const repeatedBrands = [...activeBrands, ...activeBrands, ...activeBrands];

  const handleUploadedLogoLoad = (brand: Brand, event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (!image.naturalWidth || !image.naturalHeight) return;

    const mode = getLogoMode(brand.name, image.naturalWidth / image.naturalHeight);
    setLogoModes((current) => (current[brand.id] === mode ? current : { ...current, [brand.id]: mode }));
  };

  if (!loaded || activeBrands.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-gradient-to-b from-white to-zinc-50 py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
          Authorized Partner
        </p>
        <h3 className="mt-2 text-2xl font-light text-zinc-800">
          Trusted <span className="font-semibold text-red-600">Brands</span> We Carry
        </h3>
        <div className="mt-3">
          <Link href="/brands" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
            Browse brand collections
          </Link>
        </div>
      </div>

      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-zinc-50 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-zinc-50 to-transparent" />

        <div className="logo-scroll-container">
          <div className="logo-scroll-track">
            {repeatedBrands.map((brand, i) => (
              <div
                key={`${brand.id}-${i}`}
                className={`logo-item logo-item--${logoModes[brand.id] ?? getLogoMode(brand.name, null)}`}
              >
                <div className="logo-media">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={320}
                    height={120}
                    className={`brand-image brand-image--${logoModes[brand.id] ?? getLogoMode(brand.name, null)}`}
                    onLoad={(event) => handleUploadedLogoLoad(brand, event)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .logo-scroll-container {
          overflow: hidden;
          width: 100%;
        }
        .logo-scroll-track {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .logo-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 152px;
          height: 78px;
          margin: 0 20px;
          padding: 14px 18px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .logo-item--badge {
          min-width: 126px;
        }
        .logo-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .logo-media {
          display: flex;
          height: 100%;
          width: 100%;
          align-items: center;
          justify-content: center;
        }
        .brand-image {
          display: block;
          height: auto;
          width: auto;
          max-width: 124px;
          max-height: 42px;
          object-fit: contain;
          object-position: center;
        }
        .brand-image--wordmark {
          max-width: 152px;
          max-height: 34px;
        }
        .brand-image--standard {
          max-width: 122px;
          max-height: 44px;
        }
        .brand-image--badge {
          max-width: 58px;
          max-height: 58px;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .logo-scroll-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
