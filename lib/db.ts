import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let initialized = false;

export async function initDb() {
  if (initialized) return;
  
  try {
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
    
    initialized = true;
    console.log('[DB] Tables initialized');
  } catch (error) {
    console.error('[DB] Init failed:', error);
    throw error;
  }
}

export async function query(text: string, params?: any[]) {
  // Auto-init on first query
  if (!initialized) {
    await initDb();
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('[DB] Query failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
