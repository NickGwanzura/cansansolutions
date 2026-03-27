const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Creating products table...');
    await client.query(`
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
    console.log('✓ Products table');

    console.log('Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY,
        label VARCHAR NOT NULL,
        icon VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL
      )
    `);
    console.log('✓ Categories table');

    console.log('Seeding categories...');
    await client.query(`
      INSERT INTO categories (id, label, icon, slug) VALUES
        ('mobile', 'Mobile & Accessories', 'smartphone', 'mobile'),
        ('laptops', 'Laptops & Computing', 'laptop', 'laptops'),
        ('networking', 'Networking & Wi-Fi', 'network', 'networking'),
        ('power', 'Power & Backup', 'battery', 'power'),
        ('audio', 'Audio & Headphones', 'headphones', 'audio'),
        ('gadgets', 'Gadgets & Devices', 'gadget', 'gadgets'),
        ('accessories', 'Accessories & Cables', 'plug', 'accessories'),
        ('printing', 'Printing & Office', 'printer', 'printing')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Categories seeded');

    const products = await client.query('SELECT COUNT(*) FROM products');
    const categories = await client.query('SELECT COUNT(*) FROM categories');
    console.log(`\n✓ Done: ${products.rows[0].count} products, ${categories.rows[0].count} categories`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
