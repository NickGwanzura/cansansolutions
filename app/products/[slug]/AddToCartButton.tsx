'use client';

import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/types';
import { isBundleProduct } from '@/lib/catalog';

type AddToCartButtonProps = {
  product: Product;
  label?: string;
  className?: string;
};

export function AddToCartButton({ product, label, className }: AddToCartButtonProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const isBundle = isBundleProduct(product);
  const buttonLabel = label ?? (isBundle ? 'Add Bundle to Cart' : 'Add to Cart');

  return (
    <button
      disabled={!product.inStock}
      onClick={() => addToCart(product)}
      className={`flex flex-1 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 ${className ?? ''}`}
    >
      {product.inStock ? buttonLabel : 'Out of Stock'}
    </button>
  );
}
