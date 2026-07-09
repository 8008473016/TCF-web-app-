import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getMySqlPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 50,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;
  isInitialized = true;

  if (process.env.NODE_ENV !== 'production' && process.env.FORCE_MYSQL !== 'true') return;
  if (!process.env.MYSQL_DATABASE) {
    console.log('No MySQL database configured. Skipping MySQL init to prevent server hangs.');
    return;
  }
  
  const db = getMySqlPool();
  try {
    console.log('Initializing MySQL Database schema...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        banner TEXT,
        status VARCHAR(50) DEFAULT 'active',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        sku VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100),
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        sale_price DECIMAL(10,2),
        stock INT DEFAULT 0,
        material VARCHAR(255),
        dimensions VARCHAR(255),
        weight DECIMAL(10,2) DEFAULT 0,
        images JSON,
        featured BOOLEAN DEFAULT FALSE,
        archived BOOLEAN DEFAULT FALSE,
        seo_title VARCHAR(255),
        seo_description TEXT,
        ai_generated BOOLEAN DEFAULT FALSE,
        ai_generated_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        image TEXT,
        author VARCHAR(100),
        published BOOLEAN DEFAULT FALSE,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at VARCHAR(100)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100),
        customer_name VARCHAR(255),
        rating INT DEFAULT 5,
        review_text TEXT,
        created_at VARCHAR(100)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        product_id VARCHAR(100),
        message TEXT,
        source VARCHAR(100),
        status VARCHAR(100) DEFAULT 'new',
        created_at VARCHAR(100)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(100) PRIMARY KEY,
        filename VARCHAR(255),
        original_name VARCHAR(255),
        path TEXT,
        url TEXT,
        category VARCHAR(100),
        size VARCHAR(100),
        alt TEXT,
        created_at VARCHAR(100)
      )
    `);

    try { await db.query(`ALTER TABLE media MODIFY COLUMN size VARCHAR(100)`); } catch (e) {}
    try { await db.query(`ALTER TABLE media ADD COLUMN alt TEXT`); } catch (e) {}

    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(100) PRIMARY KEY,
        page VARCHAR(255),
        event_type VARCHAR(100),
        metadata JSON,
        created_at VARCHAR(100)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100),
        image_url TEXT,
        alt_text VARCHAR(255),
        sort_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE
      )
    `);

    // Create indexes for performance
    try {
      await db.query(`CREATE INDEX idx_products_slug ON products (slug)`);
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query(`CREATE INDEX idx_products_category ON products (category)`);
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query(`CREATE INDEX idx_products_featured ON products (featured)`);
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query(`CREATE INDEX idx_categories_slug ON categories (slug)`);
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query(`CREATE INDEX idx_analytics_created ON analytics (created_at)`);
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query(`CREATE UNIQUE INDEX idx_product_images_unique ON product_images (product_id, image_url(255))`);
    } catch (e) { /* ignore if exists */ }

    console.log('MySQL schema initialization successful.');
  } catch (err) {
    console.error('MySQL initialization failed:', err);
  }
}

// Automatically trigger initialization exactly once when this module is first imported by Node.js.
initDatabase().catch(console.error);
