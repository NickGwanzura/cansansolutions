import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[DB] CRITICAL: DATABASE_URL is not set!');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Add connection timeout
  connectionTimeoutMillis: 10000,
  // Add idle timeout
  idleTimeoutMillis: 30000,
});

// Log pool errors
pool.on('error', (err) => {
  console.error('[DB] Pool error:', err);
});

let initialized = false;

export async function initDb() {
  if (initialized) return;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    console.log('[DB] Initializing tables...');
    
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
    console.log('[DB] Tables initialized successfully');
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
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  
  const client = await pool.connect();
  try {
    console.log('[DB] Executing query:', text.slice(0, 100));
    const result = await client.query(text, params);
    console.log('[DB] Query success, rows:', result.rowCount);
    return result.rows;
  } catch (error) {
    console.error('[DB] Query failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
