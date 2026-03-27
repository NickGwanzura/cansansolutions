export type Condition = 'new' | 'pre-owned';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  condition?: Condition;
  price: number;
  currency: string;
  description: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
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
