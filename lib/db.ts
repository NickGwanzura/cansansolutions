import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function initDb() {
  // Create products table
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR PRIMARY KEY,
      slug VARCHAR UNIQUE NOT NULL,
      name VARCHAR NOT NULL,
      category VARCHAR NOT NULL,
      condition VARCHAR,
      price DECIMAL NOT NULL,
      currency VARCHAR DEFAULT 'USD',
      description TEXT NOT NULL,
      image VARCHAR NOT NULL,
      in_stock BOOLEAN DEFAULT true,
      featured BOOLEAN DEFAULT false,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Create categories table
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR PRIMARY KEY,
      label VARCHAR NOT NULL,
      icon VARCHAR NOT NULL,
      slug VARCHAR UNIQUE NOT NULL
    )
  `);
}
