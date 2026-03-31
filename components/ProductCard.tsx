'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { getCategoryLabel, isBundleProduct } from '@/lib/catalog';

const CONDITION_STYLE: Record<string, string> = {
  new: 'bg-green-600 text-white',
  'pre-owned': 'bg-amber-500 text-white',
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-zinc-500">{count} review{count !== 1 ? 's' : ''}</span>
    </div>
  );
}

function StockStatus({ inStock, stockCount }: { inStock: boolean; stockCount?: number }) {
  if (!inStock) return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
      Out of stock
    </span>
  );
  if (stockCount === 1) return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
      Very low stock (1 unit)
    </span>
  );
  if (stockCount !== undefined && stockCount <= 3) return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Low stock ({stockCount} units)
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      In stock
    </span>
  );
}

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (p: Product) => void;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);
  const isBundle = isBundleProduct(product);

  const qtyInCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const specEntries = product.specs ? Object.entries(product.specs).slice(0, 5) : [];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative flex flex-col rounded-xl sm:rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden hover:shadow-xl hover:border-zinc-200 transition-all duration-300"
    >
      {/* Image area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100"
      >
        <div className="aspect-square p-5">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount !== null && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              ${discount.toLocaleString()} off
            </span>
          )}
          {!discount && product.featured && product.inStock && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Hot
            </span>
          )}
          {isBundle && (
            <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Bundle
            </span>
          )}
          {qtyInCart > 0 && (
            <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {qtyInCart} in cart
            </span>
          )}
        </div>

        {/* Condition badge — top right */}
        {product.condition && (
          <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${CONDITION_STYLE[product.condition] ?? 'bg-zinc-200 text-zinc-600'}`}>
            {product.condition === 'new' ? 'New' : 'Pre-owned'}
          </span>
        )}

        {/* Category chip — bottom right */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
            {getCategoryLabel(product.category)}
          </span>
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View overlay */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-md transition hover:bg-white hover:shadow-lg active:scale-95"
            >
              Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-sm font-semibold leading-snug text-zinc-900 line-clamp-2 hover:text-red-600 transition-colors"
        >
          {product.name}
        </Link>

        {/* Specs bullets */}
        {specEntries.length > 0 ? (
          <ul className="space-y-0.5">
            {specEntries.map(([key, val]) => (
              <li key={key} className="flex items-start gap-1.5 text-[11px] text-zinc-600">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                <span><span className="font-semibold text-zinc-700">{key}:</span> {val}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {isBundle && product.bundleItems.length > 0 && (
          <p className="text-[11px] font-medium text-zinc-500">
            Includes {product.bundleItems.length} item{product.bundleItems.length === 1 ? '' : 's'}
          </p>
        )}

        {/* Rating */}
        {product.reviewCount !== undefined && product.reviewCount > 0 && product.rating !== undefined && (
          <StarRating rating={product.rating} count={product.reviewCount} />
        )}

        {/* Stock status */}
        <StockStatus inStock={product.inStock} stockCount={product.stockCount} />

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-zinc-50">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base font-bold text-zinc-900">
              {formatCurrency(product.price, product.currency)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            )}
          </div>

          <motion.button
            disabled={!product.inStock}
            onClick={handleAdd}
            whileTap={product.inStock ? { scale: 0.92 } : {}}
            className={`relative w-full rounded-full px-3.5 py-2 text-xs font-bold shadow-sm transition-all duration-200 overflow-hidden
              ${added
                ? 'bg-green-500 text-white'
                : 'bg-amber-400 text-zinc-900 hover:bg-amber-300'
              }
              disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-1"
                >
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-1"
                >
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  {isBundle ? 'Add bundle' : 'Add to cart'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
