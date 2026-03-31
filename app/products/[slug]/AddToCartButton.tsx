'use client';

import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/types';
import { isBundleProduct } from '@/lib/catalog';

export function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const isBundle = isBundleProduct(product);

  return (
    <button
      disabled={!product.inStock}
      onClick={() => addToCart(product)}
      className="flex flex-1 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
    >
      {product.inStock ? (isBundle ? 'Add Bundle to Cart' : 'Add to Cart') : 'Out of Stock'}
    </button>
  );
}
