'use client';

import { useState } from 'react';
import { ProductImage } from './ProductImage';

type ProductGalleryProps = { name: string; images: string[] };

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const sources = images.length > 0 ? images : ['/images/products/placeholder.svg'];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-100 bg-[radial-gradient(circle_at_top,#fff1f2,#f8fafc_58%)] p-8 sm:min-h-[390px]">
        <ProductImage
          src={sources[active]}
          alt={`${name} image ${active + 1}`}
          width={760}
          height={760}
          className="h-full max-h-[330px] w-full object-contain mix-blend-multiply drop-shadow-[0_20px_28px_rgba(15,23,42,0.14)]"
        />
        {sources.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm">
            {active + 1} / {sources.length}
          </span>
        ) : null}
      </div>
      {sources.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {sources.map((source, index) => (
            <button
              key={`${source}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-white p-2 transition hover:-translate-y-0.5 hover:border-red-300 ${index === active ? 'border-red-600 ring-2 ring-red-100' : 'border-zinc-200'}`}
            >
              <ProductImage src={source} alt="" fill sizes="96px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
