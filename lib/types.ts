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

export type Banner = {
  id: string;
  name: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  position: string;
  createdAt?: string;
};

export type Brand = {
  id: string;
  name: string;
  logoUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
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

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'other';

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  customer: CustomerInfo;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  issueDate: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Quote = {
  id: string;
  number: string;
  status: QuoteStatus;
  customer: CustomerInfo;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  validUntil: string;
  issueDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Receipt = {
  id: string;
  number: string;
  invoiceId?: string;
  customer: CustomerInfo;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  paidAt: string;
  createdAt?: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  logoUrl: string;
  updatedAt?: string;
};

export type ExpenseCategory =
  | 'rent' | 'utilities' | 'salaries' | 'inventory' | 'marketing'
  | 'transport' | 'equipment' | 'maintenance' | 'taxes' | 'other';

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  vendor: string;
  notes?: string;
  createdAt?: string;
};

export type Client = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
