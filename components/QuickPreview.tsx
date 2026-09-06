'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { getCategoryLabel, isBundleProduct } from '@/lib/catalog';
import { ProductImage } from './ProductImage';

const WA_NUMBER = '263773754747';

const CONDITION_LABEL: Record<string, { label: string; color: string }> = {
  new: { label: 'Brand New', color: 'bg-green-100 text-green-700' },
  'pre-owned': { label: 'Pre-owned', color: 'bg-amber-100 text-amber-700' },
};

type Props = { product: Product | null; onClose: () => void };

export function QuickPreview({ product, onClose }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isBundle = product ? isBundleProduct(product) : false;

  const qtyInCart = product ? (items.find((i) => i.id === product.id)?.qty ?? 0) : 0;

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [product]);

  // Reset added state when product changes
  useEffect(() => {
    queueMicrotask(() => setAdded(false));
  }, [product?.id]);

  const handleAdd = () => {
    if (!product || !product.inStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const waText = product
    ? encodeURIComponent(
        `Hi Cansan Solutions, I'd like to enquire about: ${product.name}${isBundle ? ' bundle' : ''} ($${product.price})`,
      )
    : '';

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="qp-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed inset-x-3 bottom-3 top-auto z-50 mx-auto w-auto max-h-[85dvh] overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-4 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-y-1/2 sm:bottom-auto"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-preview-title"
            aria-describedby="quick-preview-description"
          >
            <div className="grid max-h-[85dvh] overflow-y-auto sm:grid-cols-2 sm:overflow-hidden">
              {/* Image pane */}
              <div className="relative flex min-h-[220px] items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-6 sm:min-h-[240px] sm:p-8">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  width={640}
                  height={480}
                  className="max-h-44 w-full object-contain sm:max-h-48"
                />
                {/* Condition badge on image */}
                {product.condition && (
                  <span
                    className={`absolute left-4 top-4 inline-flex min-h-9 items-center rounded-full px-3 py-1 text-xs font-bold ${CONDITION_LABEL[product.condition]?.color ?? ''}`}
                  >
                    {CONDITION_LABEL[product.condition]?.label}
                  </span>
                )}
                {isBundle && (
                  <span className="absolute right-4 top-4 inline-flex min-h-9 items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
                    Bundle
                  </span>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info pane */}
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                {/* Close button */}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-zinc-100"
                  aria-label="Close product preview"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-500">
                    {getCategoryLabel(product.category)}
                  </p>
                  <h2 id="quick-preview-title" className="pr-10 font-heading text-lg font-bold leading-snug text-zinc-900">
                    {product.name}
                  </h2>
                </div>

                <div
                  id="quick-preview-description"
                  className="text-sm leading-relaxed text-zinc-500 line-clamp-3 prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                {isBundle && product.bundleItems.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Bundle includes
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                      {product.bundleItems.slice(0, 4).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price row */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-heading text-2xl font-extrabold text-zinc-900">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                  {qtyInCart > 0 && (
                    <span className="text-sm font-semibold text-green-600">
                      {qtyInCart} in cart
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500">Price indicative - confirm via WhatsApp.</p>

                {/* CTA buttons */}
                <div className="mt-auto flex flex-col gap-2 pt-1">
                  <motion.button
                    disabled={!product.inStock || added}
                    onClick={handleAdd}
                    whileTap={product.inStock ? { scale: 0.97 } : {}}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all
                      ${added ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700'}
                      disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400`}
                  >
                    {added ? (
                      <>
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        Added to cart!
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                        {isBundle ? 'Add Bundle to Cart' : 'Add to Cart'}
                      </>
                    )}
                  </motion.button>

                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-green-600 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Enquire on WhatsApp
                  </a>

                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
                  >
                    View full details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
