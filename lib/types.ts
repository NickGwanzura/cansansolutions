export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  condition?: 'new' | 'pre-owned';
  price: number;
  currency: string;
  description: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  slug: string;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  qty: number;
};
