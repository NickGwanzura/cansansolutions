export type Condition = 'new' | 'pre-owned';
export type ProductType = 'single' | 'bundle';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  productType: ProductType;
  bundleItems: string[];
  condition?: Condition;
  price: number;
  currency: string;
  description: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  originalPrice?: number;
  specs?: Record<string, string>;
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
  dealLabel?: string;
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
