import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from './types';

type CartState = {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, qty = 1) => {
        const existing = get().items.find((item) => item.id === product.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id
                ? { ...item, qty: item.qty + qty }
                : item
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              currency: product.currency,
              image: product.image,
              qty,
            },
          ],
        });
      },
      removeFromCart: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, qty } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      cartTotal: () =>
        get()
          .items.reduce((acc, item) => acc + item.price * item.qty, 0),
      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.qty, 0),
    }),
    {
      name: 'cansan-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
