'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Brand } from '@/lib/types';
import { getBrandHref } from '@/lib/brands';

function AppleLogo() {
  return (
    <svg role="img" viewBox="0 0 814 1000" height="32" fill="#1d1d1f" aria-label="Apple">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.7-150.4-109.2S89 518.2 89 472.1c0-194.3 126.4-297.5 251.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99zM554.1 229.5C594 171.6 612.6 104.5 612.6 37.4c0-9.7-.6-19.4-2-28.5-57.3 2-124.9 38.4-165.9 97.3-35.1 48.7-61 116.9-61 185.4 0 10.3 1.3 20.7 2 24.1 3.9.6 10.3 1.3 16.6 1.3 51.1 0 114.9-34.5 152.8-107.5z"/>
    </svg>
  );
}

function SamsungLogo() {
  return (
    <svg role="img" viewBox="0 0 400 70" height="24" aria-label="Samsung">
      <text x="0" y="54" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="62" fontWeight="500" letterSpacing="3" fill="#1428A0">SAMSUNG</text>
    </svg>
  );
}

function HPLogo() {
  return (
    <svg role="img" viewBox="0 0 44 44" height="40" aria-label="HP">
      <circle cx="22" cy="22" r="22" fill="#0096D6"/>
      <text x="22" y="31" textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="18" fontWeight="700" fill="white" letterSpacing="0.5">hp</text>
    </svg>
  );
}

function DellLogo() {
  return (
    <svg role="img" viewBox="0 0 200 56" height="28" aria-label="Dell">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="800" letterSpacing="-1" fill="#007DB8">DELL</text>
    </svg>
  );
}

function SonyLogo() {
  return (
    <svg role="img" viewBox="0 0 210 56" height="26" aria-label="Sony">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="600" letterSpacing="4" fill="#000000">SONY</text>
    </svg>
  );
}

function LenovoLogo() {
  return (
    <svg role="img" viewBox="0 0 250 56" height="26" aria-label="Lenovo">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="46" fontWeight="600" letterSpacing="1" fill="#E2231A">Lenov</text>
      <text x="183" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="46" fontWeight="600" fill="#000000">o</text>
    </svg>
  );
}

function JBLLogo() {
  return (
    <svg role="img" viewBox="0 0 120 52" height="38" aria-label="JBL">
      <rect x="0" y="0" width="120" height="52" rx="5" fill="#F5A623"/>
      <text x="60" y="38" textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="30" fontWeight="900" fill="#1a1a1a" letterSpacing="3">JBL</text>
    </svg>
  );
}

function BoseLogo() {
  return (
    <svg role="img" viewBox="0 0 180 56" height="26" aria-label="Bose">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="800" letterSpacing="1" fill="#000000">Bose</text>
    </svg>
  );
}

function TPLinkLogo() {
  return (
    <svg role="img" viewBox="0 0 200 56" height="26" aria-label="TP-Link">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="44" fontWeight="700" letterSpacing="0" fill="#3FA52B">TP-Link</text>
    </svg>
  );
}

function EpsonLogo() {
  return (
    <svg role="img" viewBox="0 0 220 56" height="26" aria-label="Epson">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="50" fontWeight="600" letterSpacing="1" fill="#003087">EPSON</text>
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg role="img" viewBox="0 0 108 24" height="28" aria-label="Microsoft">
      <path d="M0 0h11.4v11.4H0z" fill="#F25022"/>
      <path d="M12.6 0H24v11.4H12.6z" fill="#7FBA00"/>
      <path d="M0 12.6h11.4V24H0z" fill="#00A4EF"/>
      <path d="M12.6 12.6H24V24H12.6z" fill="#FFB900"/>
      <text x="28" y="18" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fontWeight="400" fill="#737373">Microsoft</text>
    </svg>
  );
}

function XiaomiLogo() {
  return (
    <svg role="img" viewBox="0 0 24 24" height="34" fill="#FF6900" aria-label="Xiaomi">
      <path d="M12 0C8.935 0 6.445 2.486 6.445 5.555V24h3.388V8.333h4.334V24h3.388V5.555C17.555 2.486 15.065 0 12 0zm0 2.666c1.6 0 2.89 1.294 2.89 2.889v.39H9.11v-.39c0-1.595 1.29-2.889 2.89-2.889z"/>
    </svg>
  );
}

function AnkerLogo() {
  return (
    <svg role="img" viewBox="0 0 190 56" height="26" aria-label="Anker">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="50" fontWeight="700" letterSpacing="1" fill="#0066CC">Anker</text>
    </svg>
  );
}

function HikvisionLogo() {
  return (
    <svg role="img" viewBox="0 0 260 56" height="24" aria-label="Hikvision">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="42" fontWeight="700" letterSpacing="0" fill="#C8102E">HIKVISION</text>
    </svg>
  );
}

function GigabyteLogo() {
  return (
    <svg role="img" viewBox="0 0 250 56" height="24" aria-label="Gigabyte">
      <text x="0" y="42" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="38" fontWeight="700" letterSpacing="0" fill="#E2001A">GIGABYTE</text>
    </svg>
  );
}

function WesternDigitalLogo() {
  return (
    <svg role="img" viewBox="0 0 80 56" height="32" aria-label="Western Digital">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="900" letterSpacing="0" fill="#0067B9">WD</text>
    </svg>
  );
}

function LogitechLogo() {
  return (
    <svg role="img" viewBox="0 0 250 56" height="26" aria-label="Logitech">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="46" fontWeight="600" letterSpacing="0" fill="#00B8FC">Logitec</text>
      <text x="186" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="46" fontWeight="600" fill="#00B8FC">h</text>
    </svg>
  );
}

function AsusLogo() {
  return (
    <svg role="img" viewBox="0 0 160 56" height="26" aria-label="Asus">
      <text x="0" y="46" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="700" letterSpacing="0" fill="#00539B">ASUS</text>
    </svg>
  );
}

const brands = [
  { key: 'apple', Logo: AppleLogo },
  { key: 'samsung', Logo: SamsungLogo },
  { key: 'hp', Logo: HPLogo },
  { key: 'dell', Logo: DellLogo },
  { key: 'lenovo', Logo: LenovoLogo },
  { key: 'microsoft', Logo: MicrosoftLogo },
  { key: 'sony', Logo: SonyLogo },
  { key: 'epson', Logo: EpsonLogo },
  { key: 'tplink', Logo: TPLinkLogo },
  { key: 'jbl', Logo: JBLLogo },
  { key: 'bose', Logo: BoseLogo },
  { key: 'xiaomi', Logo: XiaomiLogo },
  { key: 'anker', Logo: AnkerLogo },
  { key: 'hikvision', Logo: HikvisionLogo },
  { key: 'gigabyte', Logo: GigabyteLogo },
  { key: 'wd', Logo: WesternDigitalLogo },
  { key: 'logitech', Logo: LogitechLogo },
  { key: 'asus', Logo: AsusLogo },
];

const brandHrefMap: Record<string, string> = {
  samsung: getBrandHref('samsung'),
  hp: getBrandHref('hp'),
  dell: getBrandHref('dell'),
  lenovo: getBrandHref('lenovo'),
  tplink: getBrandHref('tp-link'),
};

const allBrands = [...brands, ...brands, ...brands];

export function BrandsStrip() {
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      try {
        const res = await fetch('/api/brands', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as Brand[];
        if (!cancelled) {
          setDbBrands(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('[BrandsStrip] Failed to load brands from database:', error);
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  const repeatedDbBrands = [...dbBrands, ...dbBrands, ...dbBrands];

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
            {dbBrands.length > 0
              ? repeatedDbBrands.map((brand, i) => (
                  <div key={`${brand.id}-${i}`} className="logo-item">
                    <Image src={brand.logoUrl} alt={brand.name} width={180} height={48} className="brand-image" />
                  </div>
                ))
              : allBrands.map(({ key, Logo }, i) => (
                  <Link
                    key={`${key}-${i}`}
                    href={brandHrefMap[key] ?? '/brands'}
                    className="logo-item"
                    aria-label={`Browse ${key} products`}
                  >
                    <Logo />
                  </Link>
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
          min-width: 140px;
          height: 70px;
          margin: 0 20px;
          padding: 12px 24px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .logo-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .brand-image {
          max-width: 100%;
          max-height: 42px;
          width: 100%;
          object-fit: contain;
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
