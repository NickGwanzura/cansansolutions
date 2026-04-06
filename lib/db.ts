import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Lazy-initialize so the module can be imported during build without DATABASE_URL
let _sql: NeonQueryFunction<false, false> | null = null;
function sql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
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

export async function getProducts(): Promise<ReturnType<typeof rowToProduct>[]> {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM products ORDER BY created_at DESC`;
  return rows.map(rowToProduct);
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
