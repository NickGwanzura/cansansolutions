import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { promises as fs } from 'fs';
import path from 'path';
import type { Banner, Brand, Client, CompanyProfile, Expense, Invoice, Quote, Receipt } from './types';

// Lazy-initialize so the module can be imported during build without DATABASE_URL
let _sql: NeonQueryFunction<false, false> | null = null;

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

let schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await sql()`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT PRIMARY KEY,
      slug          TEXT UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      category      TEXT NOT NULL,
      product_type  TEXT NOT NULL DEFAULT 'single',
      bundle_items  TEXT[] NOT NULL DEFAULT '{}',
      condition     TEXT,
      price         NUMERIC(10, 2) NOT NULL,
      currency      TEXT NOT NULL DEFAULT 'USD',
      description   TEXT NOT NULL DEFAULT '',
      image         TEXT NOT NULL DEFAULT '',
      in_stock      BOOLEAN NOT NULL DEFAULT true,
      featured      BOOLEAN NOT NULL DEFAULT false,
      tags          TEXT[] NOT NULL DEFAULT '{}',
      original_price NUMERIC(10, 2),
      specs         JSONB,
      stock_count   INTEGER,
      rating        NUMERIC(3, 2),
      review_count  INTEGER,
      deal_label    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS banners (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      image        TEXT NOT NULL DEFAULT '',
      title        TEXT NOT NULL DEFAULT '',
      subtitle     TEXT NOT NULL DEFAULT '',
      badge        TEXT NOT NULL DEFAULT '',
      button_text  TEXT NOT NULL DEFAULT 'Shop Now',
      button_link  TEXT NOT NULL DEFAULT '/products',
      active       BOOLEAN NOT NULL DEFAULT true,
      position     TEXT NOT NULL DEFAULT 'homepage-hero',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS brands (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      logo_url    TEXT NOT NULL DEFAULT '',
      active      BOOLEAN NOT NULL DEFAULT true,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS invoices (
      id           TEXT PRIMARY KEY,
      number       TEXT UNIQUE NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
      customer     JSONB NOT NULL DEFAULT '{}',
      line_items   JSONB NOT NULL DEFAULT '[]',
      subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0,
      tax_rate     NUMERIC(5,2) NOT NULL DEFAULT 0,
      tax_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
      total        NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency     TEXT NOT NULL DEFAULT 'USD',
      notes        TEXT,
      issue_date   DATE NOT NULL,
      due_date     DATE NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS quotes (
      id           TEXT PRIMARY KEY,
      number       TEXT UNIQUE NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
      customer     JSONB NOT NULL DEFAULT '{}',
      line_items   JSONB NOT NULL DEFAULT '[]',
      subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0,
      tax_rate     NUMERIC(5,2) NOT NULL DEFAULT 0,
      tax_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
      total        NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency     TEXT NOT NULL DEFAULT 'USD',
      notes        TEXT,
      issue_date   DATE NOT NULL,
      valid_until  DATE NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS receipts (
      id             TEXT PRIMARY KEY,
      number         TEXT UNIQUE NOT NULL,
      invoice_id     TEXT,
      customer       JSONB NOT NULL DEFAULT '{}',
      line_items     JSONB NOT NULL DEFAULT '[]',
      subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
      tax_rate       NUMERIC(5,2) NOT NULL DEFAULT 0,
      tax_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount       NUMERIC(12,2) NOT NULL DEFAULT 0,
      total          NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency       TEXT NOT NULL DEFAULT 'USD',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      notes          TEXT,
      paid_at        DATE NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS company_profile (
      id            TEXT PRIMARY KEY DEFAULT 'default',
      name          TEXT NOT NULL DEFAULT 'Cansan Solutions',
      tagline       TEXT NOT NULL DEFAULT 'Technology Solutions',
      address_line1 TEXT NOT NULL DEFAULT '',
      address_line2 TEXT NOT NULL DEFAULT '',
      city          TEXT NOT NULL DEFAULT '',
      country       TEXT NOT NULL DEFAULT '',
      phone         TEXT NOT NULL DEFAULT '',
      email         TEXT NOT NULL DEFAULT '',
      website       TEXT NOT NULL DEFAULT '',
      vat_number    TEXT NOT NULL DEFAULT '',
      logo_url      TEXT NOT NULL DEFAULT '/images/brand/cansan-logo.png',
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    INSERT INTO company_profile (id, name, tagline, address_line1, address_line2, city, country, phone, email, website, vat_number, logo_url)
    VALUES ('default', 'Cansan Solutions', 'Technology Solutions', 'Shop 7, ZB House, Corner Speke & 1st Street', '', 'Harare', 'Zimbabwe', '+263 77 375 4747', 'info@cansansolutions.co.zw', 'https://cansansolutions.shop', '', '/images/brand/cansan-logo.png')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY,
      date        DATE NOT NULL,
      category    TEXT NOT NULL DEFAULT 'other',
      description TEXT NOT NULL,
      amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency    TEXT NOT NULL DEFAULT 'USD',
      vendor      TEXT NOT NULL DEFAULT '',
      notes       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql()`
    CREATE TABLE IF NOT EXISTS clients (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      company    TEXT NOT NULL DEFAULT '',
      email      TEXT NOT NULL DEFAULT '',
      phone      TEXT NOT NULL DEFAULT '',
      address    TEXT NOT NULL DEFAULT '',
      notes      TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await seedBannersFromFile();
  schemaReady = true;
}

function rowToProduct(row: Record<string, unknown>) {
  return {
    id:            row.id as string,
    slug:          row.slug as string,
    name:          row.name as string,
    category:      row.category as string,
    productType:   row.product_type as string,
    bundleItems:   (row.bundle_items as string[]) || [],
    condition:     row.condition as string | undefined,
    price:         parseFloat(row.price as string),
    currency:      row.currency as string,
    description:   row.description as string,
    image:         row.image as string,
    inStock:       row.in_stock as boolean,
    featured:      row.featured as boolean,
    tags:          (row.tags as string[]) || [],
    originalPrice: row.original_price != null ? parseFloat(row.original_price as string) : undefined,
    specs:         row.specs as Record<string, string> | undefined,
    stockCount:    row.stock_count as number | undefined,
    rating:        row.rating != null ? parseFloat(row.rating as string) : undefined,
    reviewCount:   row.review_count as number | undefined,
    dealLabel:     row.deal_label as string | undefined,
    createdAt:     row.created_at as Date,
    updatedAt:     row.updated_at as Date,
  };
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function rowToBanner(row: Record<string, unknown>): Banner {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    image: String(row.image ?? ''),
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    badge: String(row.badge ?? ''),
    buttonText: String(row.button_text ?? 'Shop Now'),
    buttonLink: String(row.button_link ?? '/products'),
    active: Boolean(row.active ?? true),
    position: String(row.position ?? 'homepage-hero'),
    createdAt: toIsoString(row.created_at),
  };
}

function rowToBrand(row: Record<string, unknown>): Brand {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    logoUrl: String(row.logo_url ?? ''),
    active: Boolean(row.active ?? true),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: toIsoString(row.created_at),
  };
}

async function seedBannersFromFile(): Promise<void> {
  const rows = await sql()`SELECT COUNT(*)::int AS count FROM banners`;
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) return;

  const seedPath = path.join(process.cwd(), 'data', 'banners.json');

  try {
    const raw = await fs.readFile(seedPath, 'utf-8');
    const banners = JSON.parse(raw) as Banner[];

    for (const banner of banners) {
      const now = new Date();
      const createdAt = toIsoString(banner.createdAt) ?? now.toISOString();

      await sql()`
        INSERT INTO banners (
          id, name, image, title, subtitle, badge, button_text, button_link,
          active, position, created_at, updated_at
        ) VALUES (
          ${banner.id || `banner-${Date.now()}`},
          ${banner.name || 'Homepage Banner'},
          ${banner.image || ''},
          ${banner.title || ''},
          ${banner.subtitle || ''},
          ${banner.badge || ''},
          ${banner.buttonText || 'Shop Now'},
          ${banner.buttonLink || '/products'},
          ${banner.active ?? true},
          ${banner.position || 'homepage-hero'},
          ${new Date(createdAt)},
          ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    if (code !== 'ENOENT') {
      console.error('[db] Failed to seed banners from file:', error);
    }
  }
}

export async function getProducts(): Promise<ReturnType<typeof rowToProduct>[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM products ORDER BY created_at DESC`;
  return rows.map(rowToProduct);
}

export async function getBanners(): Promise<Banner[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM banners ORDER BY created_at DESC`;
  return rows.map(rowToBanner);
}

export async function getActiveBanners(): Promise<Banner[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM banners WHERE active = true ORDER BY created_at DESC`;
  return rows.map(rowToBanner);
}

export async function getBanner(id: string): Promise<Banner | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM banners WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToBanner(rows[0]) : null;
}

export async function saveBanner(banner: Banner): Promise<Banner> {
  await ensureSchema();
  const now = new Date();
  const createdAt = toIsoString(banner.createdAt) ?? now.toISOString();

  const rows = await sql()`
    INSERT INTO banners (
      id, name, image, title, subtitle, badge, button_text, button_link,
      active, position, created_at, updated_at
    ) VALUES (
      ${banner.id || `banner-${Date.now()}`},
      ${banner.name || 'Homepage Banner'},
      ${banner.image || ''},
      ${banner.title || ''},
      ${banner.subtitle || ''},
      ${banner.badge || ''},
      ${banner.buttonText || 'Shop Now'},
      ${banner.buttonLink || '/products'},
      ${banner.active ?? true},
      ${banner.position || 'homepage-hero'},
      ${new Date(createdAt)},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      name        = EXCLUDED.name,
      image       = EXCLUDED.image,
      title       = EXCLUDED.title,
      subtitle    = EXCLUDED.subtitle,
      badge       = EXCLUDED.badge,
      button_text = EXCLUDED.button_text,
      button_link = EXCLUDED.button_link,
      active      = EXCLUDED.active,
      position    = EXCLUDED.position,
      updated_at  = ${now}
    RETURNING *
  `;

  return rowToBanner(rows[0]);
}

export async function deleteBanner(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM banners WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getBrands(): Promise<Brand[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM brands ORDER BY sort_order ASC, created_at ASC`;
  return rows.map(rowToBrand);
}

export async function getActiveBrands(): Promise<Brand[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM brands WHERE active = true ORDER BY sort_order ASC, created_at ASC`;
  return rows.map(rowToBrand);
}

export async function getBrand(id: string): Promise<Brand | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM brands WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToBrand(rows[0]) : null;
}

export async function saveBrand(brand: Brand): Promise<Brand> {
  await ensureSchema();
  const now = new Date();
  const createdAt = toIsoString(brand.createdAt) ?? now.toISOString();

  const rows = await sql()`
    INSERT INTO brands (
      id, name, logo_url, active, sort_order, created_at, updated_at
    ) VALUES (
      ${brand.id || `brand-${Date.now()}`},
      ${brand.name || 'Brand'},
      ${brand.logoUrl || ''},
      ${brand.active ?? true},
      ${brand.sortOrder ?? 0},
      ${new Date(createdAt)},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      name       = EXCLUDED.name,
      logo_url   = EXCLUDED.logo_url,
      active     = EXCLUDED.active,
      sort_order = EXCLUDED.sort_order,
      updated_at = ${now}
    RETURNING *
  `;

  return rowToBrand(rows[0]);
}

export async function deleteBrand(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM brands WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getProduct(id: string): Promise<ReturnType<typeof rowToProduct> | null> {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToProduct(rows[0]) : null;
}

export async function saveProduct(product: Record<string, unknown>): Promise<void> {
  await ensureSchema();
  const id  = (product.id as string) || String(Date.now());
  const now = new Date();

  await sql()`
    INSERT INTO products (
      id, slug, name, category, product_type, bundle_items, condition,
      price, currency, description, image, in_stock, featured, tags,
      original_price, specs, stock_count, rating, review_count, deal_label,
      created_at, updated_at
    ) VALUES (
      ${id},
      ${product.slug as string},
      ${product.name as string},
      ${product.category as string},
      ${(product.productType as string) || 'single'},
      ${(product.bundleItems as string[]) || []},
      ${(product.condition as string) ?? null},
      ${product.price as number},
      ${(product.currency as string) || 'USD'},
      ${(product.description as string) || ''},
      ${(product.image as string) || ''},
      ${(product.inStock as boolean) ?? true},
      ${(product.featured as boolean) ?? false},
      ${(product.tags as string[]) || []},
      ${(product.originalPrice as number) ?? null},
      ${product.specs ? JSON.stringify(product.specs) : null},
      ${(product.stockCount as number) ?? null},
      ${(product.rating as number) ?? null},
      ${(product.reviewCount as number) ?? null},
      ${(product.dealLabel as string) ?? null},
      ${product.createdAt ? new Date(product.createdAt as string | number | Date) : now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      slug           = EXCLUDED.slug,
      name           = EXCLUDED.name,
      category       = EXCLUDED.category,
      product_type   = EXCLUDED.product_type,
      bundle_items   = EXCLUDED.bundle_items,
      condition      = EXCLUDED.condition,
      price          = EXCLUDED.price,
      currency       = EXCLUDED.currency,
      description    = EXCLUDED.description,
      image          = EXCLUDED.image,
      in_stock       = EXCLUDED.in_stock,
      featured       = EXCLUDED.featured,
      tags           = EXCLUDED.tags,
      original_price = EXCLUDED.original_price,
      specs          = EXCLUDED.specs,
      stock_count    = EXCLUDED.stock_count,
      rating         = EXCLUDED.rating,
      review_count   = EXCLUDED.review_count,
      deal_label     = EXCLUDED.deal_label,
      updated_at     = ${now}
  `;
}

export async function deleteProduct(id: string): Promise<void> {
  await ensureSchema();
  await sql()`DELETE FROM products WHERE id = ${id}`;
}

export async function replaceProducts(products: Record<string, unknown>[]): Promise<void> {
  await ensureSchema();
  await sql()`TRUNCATE TABLE products`;
  for (const product of products) {
    await saveProduct(product);
  }
}

export async function getCategories(): Promise<Category[]> {
  return defaultCategories();
}

type Category = { id: string; label: string; icon: string; slug: string };

function defaultCategories(): Category[] {
  return [
    { id: 'mobile',       label: 'Mobile & Accessories',    icon: 'smartphone',    slug: 'mobile' },
    { id: 'laptops',      label: 'Laptops & Computing',     icon: 'laptop',        slug: 'laptops' },
    { id: 'desktops',     label: 'Desktops & All-in-Ones',  icon: 'desktop',       slug: 'desktops' },
    { id: 'networking',   label: 'Networking & Wi-Fi',      icon: 'network',       slug: 'networking' },
    { id: 'cctv',         label: 'CCTV & Security',         icon: 'shield-camera', slug: 'cctv' },
    { id: 'power',        label: 'Power & Backup',          icon: 'battery',       slug: 'power' },
    { id: 'audio',        label: 'Audio & Headphones',      icon: 'headphones',    slug: 'audio' },
    { id: 'gadgets',      label: 'Gadgets & Devices',       icon: 'gadget',        slug: 'gadgets' },
    { id: 'accessories',  label: 'Accessories & Cables',    icon: 'plug',          slug: 'accessories' },
    { id: 'printing',     label: 'Printing & Office',       icon: 'printer',       slug: 'printing' },
    { id: 'bundles',      label: 'Bundles & Deals',         icon: 'bundle',        slug: 'bundles' },
  ];
}

// ─── Invoices ───

function parseJsonb<T>(value: unknown): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id ?? ''),
    number: String(row.number ?? ''),
    status: String(row.status ?? 'draft') as Invoice['status'],
    customer: parseJsonb(row.customer),
    lineItems: parseJsonb(row.line_items),
    subtotal: parseFloat(String(row.subtotal ?? '0')),
    taxRate: parseFloat(String(row.tax_rate ?? '0')),
    taxAmount: parseFloat(String(row.tax_amount ?? '0')),
    discount: parseFloat(String(row.discount ?? '0')),
    total: parseFloat(String(row.total ?? '0')),
    currency: String(row.currency ?? 'USD'),
    notes: row.notes ? String(row.notes) : undefined,
    issueDate: String(row.issue_date ?? ''),
    dueDate: String(row.due_date ?? ''),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function getInvoices(): Promise<Invoice[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM invoices ORDER BY created_at DESC`;
  return rows.map(rowToInvoice);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToInvoice(rows[0]) : null;
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO invoices (
      id, number, status, customer, line_items, subtotal, tax_rate, tax_amount,
      discount, total, currency, notes, issue_date, due_date, created_at, updated_at
    ) VALUES (
      ${invoice.id},
      ${invoice.number},
      ${invoice.status},
      ${JSON.stringify(invoice.customer)},
      ${JSON.stringify(invoice.lineItems)},
      ${invoice.subtotal},
      ${invoice.taxRate},
      ${invoice.taxAmount},
      ${invoice.discount},
      ${invoice.total},
      ${invoice.currency},
      ${invoice.notes ?? null},
      ${invoice.issueDate},
      ${invoice.dueDate},
      ${invoice.createdAt ? new Date(invoice.createdAt) : now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      number     = EXCLUDED.number,
      status     = EXCLUDED.status,
      customer   = EXCLUDED.customer,
      line_items = EXCLUDED.line_items,
      subtotal   = EXCLUDED.subtotal,
      tax_rate   = EXCLUDED.tax_rate,
      tax_amount = EXCLUDED.tax_amount,
      discount   = EXCLUDED.discount,
      total      = EXCLUDED.total,
      currency   = EXCLUDED.currency,
      notes      = EXCLUDED.notes,
      issue_date = EXCLUDED.issue_date,
      due_date   = EXCLUDED.due_date,
      updated_at = ${now}
    RETURNING *
  `;
  return rowToInvoice(rows[0]);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM invoices WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getNextInvoiceNumber(): Promise<string> {
  await ensureSchema();
  const rows = await sql()`SELECT number FROM invoices ORDER BY created_at DESC LIMIT 1`;
  if (rows.length === 0) return 'INV-0001';
  const last = String(rows[0].number ?? 'INV-0000');
  const num = parseInt(last.replace('INV-', ''), 10) || 0;
  return `INV-${String(num + 1).padStart(4, '0')}`;
}

// ─── Quotes ───

function rowToQuote(row: Record<string, unknown>): Quote {
  return {
    id: String(row.id ?? ''),
    number: String(row.number ?? ''),
    status: String(row.status ?? 'draft') as Quote['status'],
    customer: parseJsonb(row.customer),
    lineItems: parseJsonb(row.line_items),
    subtotal: parseFloat(String(row.subtotal ?? '0')),
    taxRate: parseFloat(String(row.tax_rate ?? '0')),
    taxAmount: parseFloat(String(row.tax_amount ?? '0')),
    discount: parseFloat(String(row.discount ?? '0')),
    total: parseFloat(String(row.total ?? '0')),
    currency: String(row.currency ?? 'USD'),
    notes: row.notes ? String(row.notes) : undefined,
    validUntil: String(row.valid_until ?? ''),
    issueDate: String(row.issue_date ?? ''),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function getQuotes(): Promise<Quote[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM quotes ORDER BY created_at DESC`;
  return rows.map(rowToQuote);
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM quotes WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToQuote(rows[0]) : null;
}

export async function saveQuote(quote: Quote): Promise<Quote> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO quotes (
      id, number, status, customer, line_items, subtotal, tax_rate, tax_amount,
      discount, total, currency, notes, issue_date, valid_until, created_at, updated_at
    ) VALUES (
      ${quote.id},
      ${quote.number},
      ${quote.status},
      ${JSON.stringify(quote.customer)},
      ${JSON.stringify(quote.lineItems)},
      ${quote.subtotal},
      ${quote.taxRate},
      ${quote.taxAmount},
      ${quote.discount},
      ${quote.total},
      ${quote.currency},
      ${quote.notes ?? null},
      ${quote.issueDate},
      ${quote.validUntil},
      ${quote.createdAt ? new Date(quote.createdAt) : now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      number      = EXCLUDED.number,
      status      = EXCLUDED.status,
      customer    = EXCLUDED.customer,
      line_items  = EXCLUDED.line_items,
      subtotal    = EXCLUDED.subtotal,
      tax_rate    = EXCLUDED.tax_rate,
      tax_amount  = EXCLUDED.tax_amount,
      discount    = EXCLUDED.discount,
      total       = EXCLUDED.total,
      currency    = EXCLUDED.currency,
      notes       = EXCLUDED.notes,
      issue_date  = EXCLUDED.issue_date,
      valid_until = EXCLUDED.valid_until,
      updated_at  = ${now}
    RETURNING *
  `;
  return rowToQuote(rows[0]);
}

export async function deleteQuote(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM quotes WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getNextQuoteNumber(): Promise<string> {
  await ensureSchema();
  const rows = await sql()`SELECT number FROM quotes ORDER BY created_at DESC LIMIT 1`;
  if (rows.length === 0) return 'QUO-0001';
  const last = String(rows[0].number ?? 'QUO-0000');
  const num = parseInt(last.replace('QUO-', ''), 10) || 0;
  return `QUO-${String(num + 1).padStart(4, '0')}`;
}

// ─── Receipts ───

function rowToReceipt(row: Record<string, unknown>): Receipt {
  return {
    id: String(row.id ?? ''),
    number: String(row.number ?? ''),
    invoiceId: row.invoice_id ? String(row.invoice_id) : undefined,
    customer: parseJsonb(row.customer),
    lineItems: parseJsonb(row.line_items),
    subtotal: parseFloat(String(row.subtotal ?? '0')),
    taxRate: parseFloat(String(row.tax_rate ?? '0')),
    taxAmount: parseFloat(String(row.tax_amount ?? '0')),
    discount: parseFloat(String(row.discount ?? '0')),
    total: parseFloat(String(row.total ?? '0')),
    currency: String(row.currency ?? 'USD'),
    paymentMethod: String(row.payment_method ?? 'cash') as Receipt['paymentMethod'],
    notes: row.notes ? String(row.notes) : undefined,
    paidAt: String(row.paid_at ?? ''),
    createdAt: toIsoString(row.created_at),
  };
}

export async function getReceipts(): Promise<Receipt[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM receipts ORDER BY created_at DESC`;
  return rows.map(rowToReceipt);
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM receipts WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToReceipt(rows[0]) : null;
}

export async function saveReceipt(receipt: Receipt): Promise<Receipt> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO receipts (
      id, number, invoice_id, customer, line_items, subtotal, tax_rate, tax_amount,
      discount, total, currency, payment_method, notes, paid_at, created_at
    ) VALUES (
      ${receipt.id},
      ${receipt.number},
      ${receipt.invoiceId ?? null},
      ${JSON.stringify(receipt.customer)},
      ${JSON.stringify(receipt.lineItems)},
      ${receipt.subtotal},
      ${receipt.taxRate},
      ${receipt.taxAmount},
      ${receipt.discount},
      ${receipt.total},
      ${receipt.currency},
      ${receipt.paymentMethod},
      ${receipt.notes ?? null},
      ${receipt.paidAt},
      ${receipt.createdAt ? new Date(receipt.createdAt) : now}
    )
    ON CONFLICT (id) DO UPDATE SET
      number         = EXCLUDED.number,
      invoice_id     = EXCLUDED.invoice_id,
      customer       = EXCLUDED.customer,
      line_items     = EXCLUDED.line_items,
      subtotal       = EXCLUDED.subtotal,
      tax_rate       = EXCLUDED.tax_rate,
      tax_amount     = EXCLUDED.tax_amount,
      discount       = EXCLUDED.discount,
      total          = EXCLUDED.total,
      currency       = EXCLUDED.currency,
      payment_method = EXCLUDED.payment_method,
      notes          = EXCLUDED.notes,
      paid_at        = EXCLUDED.paid_at
    RETURNING *
  `;
  return rowToReceipt(rows[0]);
}

export async function deleteReceipt(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM receipts WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getNextReceiptNumber(): Promise<string> {
  await ensureSchema();
  const rows = await sql()`SELECT number FROM receipts ORDER BY created_at DESC LIMIT 1`;
  if (rows.length === 0) return 'REC-0001';
  const last = String(rows[0].number ?? 'REC-0000');
  const num = parseInt(last.replace('REC-', ''), 10) || 0;
  return `REC-${String(num + 1).padStart(4, '0')}`;
}

// ─── Company Profile ───

function rowToCompanyProfile(row: Record<string, unknown>): CompanyProfile {
  return {
    id: String(row.id ?? 'default'),
    name: String(row.name ?? ''),
    tagline: String(row.tagline ?? ''),
    addressLine1: String(row.address_line1 ?? ''),
    addressLine2: String(row.address_line2 ?? ''),
    city: String(row.city ?? ''),
    country: String(row.country ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    website: String(row.website ?? ''),
    vatNumber: String(row.vat_number ?? ''),
    logoUrl: String(row.logo_url ?? '/images/brand/cansan-logo.png'),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM company_profile WHERE id = 'default' LIMIT 1`;
  if (rows.length > 0) return rowToCompanyProfile(rows[0]);
  // Seed default if missing
  const inserted = await sql()`
    INSERT INTO company_profile (id, name, tagline, address_line1, city, country, phone, email, website, logo_url)
    VALUES ('default', 'Cansan Solutions', 'Technology Solutions', 'Shop 7, ZB House, Corner Speke & 1st Street', 'Harare', 'Zimbabwe', '+263 77 375 4747', 'info@cansansolutions.co.zw', 'https://cansansolutions.shop', '/images/brand/cansan-logo.png')
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `;
  if (inserted.length > 0) return rowToCompanyProfile(inserted[0]);
  const refetch = await sql()`SELECT * FROM company_profile WHERE id = 'default' LIMIT 1`;
  return rowToCompanyProfile(refetch[0]);
}

export async function saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO company_profile (
      id, name, tagline, address_line1, address_line2, city, country, phone, email, website, vat_number, logo_url, updated_at
    ) VALUES (
      'default',
      ${profile.name},
      ${profile.tagline},
      ${profile.addressLine1},
      ${profile.addressLine2},
      ${profile.city},
      ${profile.country},
      ${profile.phone},
      ${profile.email},
      ${profile.website},
      ${profile.vatNumber},
      ${profile.logoUrl},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      name          = EXCLUDED.name,
      tagline       = EXCLUDED.tagline,
      address_line1 = EXCLUDED.address_line1,
      address_line2 = EXCLUDED.address_line2,
      city          = EXCLUDED.city,
      country       = EXCLUDED.country,
      phone         = EXCLUDED.phone,
      email         = EXCLUDED.email,
      website       = EXCLUDED.website,
      vat_number    = EXCLUDED.vat_number,
      logo_url      = EXCLUDED.logo_url,
      updated_at    = ${now}
    RETURNING *
  `;
  return rowToCompanyProfile(rows[0]);
}

// ─── Expenses ───

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id ?? ''),
    date: String(row.date ?? ''),
    category: String(row.category ?? 'other') as Expense['category'],
    description: String(row.description ?? ''),
    amount: parseFloat(String(row.amount ?? '0')),
    currency: String(row.currency ?? 'USD'),
    vendor: String(row.vendor ?? ''),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: toIsoString(row.created_at),
  };
}

export async function getExpenses(): Promise<Expense[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM expenses ORDER BY date DESC, created_at DESC`;
  return rows.map(rowToExpense);
}

export async function getExpense(id: string): Promise<Expense | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM expenses WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToExpense(rows[0]) : null;
}

export async function saveExpense(expense: Expense): Promise<Expense> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO expenses (
      id, date, category, description, amount, currency, vendor, notes, created_at, updated_at
    ) VALUES (
      ${expense.id || `exp-${Date.now()}`},
      ${expense.date},
      ${expense.category},
      ${expense.description},
      ${expense.amount},
      ${expense.currency || 'USD'},
      ${expense.vendor || ''},
      ${expense.notes ?? null},
      ${expense.createdAt ? new Date(expense.createdAt) : now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      date        = EXCLUDED.date,
      category    = EXCLUDED.category,
      description = EXCLUDED.description,
      amount      = EXCLUDED.amount,
      currency    = EXCLUDED.currency,
      vendor      = EXCLUDED.vendor,
      notes       = EXCLUDED.notes,
      updated_at  = ${now}
    RETURNING *
  `;
  return rowToExpense(rows[0]);
}

export async function deleteExpense(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM expenses WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// ─── Clients ───

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    company: row.company ? String(row.company) : undefined,
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function getClients(): Promise<Client[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const rows = await sql()`SELECT * FROM clients ORDER BY name ASC`;
  return rows.map(rowToClient);
}

export async function getClient(id: string): Promise<Client | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT * FROM clients WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? rowToClient(rows[0]) : null;
}

export async function saveClient(client: Client): Promise<Client> {
  await ensureSchema();
  const now = new Date();
  const rows = await sql()`
    INSERT INTO clients (
      id, name, company, email, phone, address, notes, created_at, updated_at
    ) VALUES (
      ${client.id || `client-${Date.now()}`},
      ${client.name},
      ${client.company || ''},
      ${client.email || ''},
      ${client.phone || ''},
      ${client.address || ''},
      ${client.notes || ''},
      ${client.createdAt ? new Date(client.createdAt) : now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      name       = EXCLUDED.name,
      company    = EXCLUDED.company,
      email      = EXCLUDED.email,
      phone      = EXCLUDED.phone,
      address    = EXCLUDED.address,
      notes      = EXCLUDED.notes,
      updated_at = ${now}
    RETURNING *
  `;
  return rowToClient(rows[0]);
}

export async function deleteClient(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql()`DELETE FROM clients WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
