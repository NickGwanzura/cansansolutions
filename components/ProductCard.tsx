'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  laptops: 'Laptops',
  desktops: 'Desktops',
  networking: 'Networking',
  power: 'Power & UPS',
  audio: 'Audio',
  gadgets: 'Gadgets',
  accessories: 'Accessories',
  printing: 'Printing',
};

const CONDITION_STYLE: Record<string, string> = {
  new: 'bg-green-600 text-white',
  'pre-owned': 'bg-amber-500 text-white',
};

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

  const qtyInCart = items.find((i) => i.id === product.id)?.qty ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden hover:shadow-xl hover:border-zinc-200 transition-all duration-300"
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
          {product.featured && product.inStock && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Hot
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
            {CATEGORY_LABELS[product.category] ?? product.category}
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

        {/* Quick View overlay — appears on hover */}
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
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-sm font-semibold leading-snug text-zinc-900 line-clamp-2 hover:text-red-600 transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-50">
          <span className="font-heading text-base font-bold text-zinc-900">
            {formatCurrency(product.price, product.currency)}
          </span>

          <motion.button
            disabled={!product.inStock}
            onClick={handleAdd}
            whileTap={product.inStock ? { scale: 0.92 } : {}}
            className={`relative min-w-[88px] rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 overflow-hidden
              ${added ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700'}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
