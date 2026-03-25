'use client';

import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/types';

export function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <button
      disabled={!product.inStock}
      onClick={() => addToCart(product)}
      className="flex flex-1 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
    >
      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
    </button>
  );
}
