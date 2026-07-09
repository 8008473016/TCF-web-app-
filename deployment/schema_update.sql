-- ==============================================================================
-- TCF PRODUCTION MIGRATION SYSTEM
-- This script is completely safe and idempotent. 
-- It creates missing tables and adds missing columns without destroying data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENSURE ALL TABLES EXIST (Safe Creation)
-- ------------------------------------------------------------------------------

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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100),
  customer_name VARCHAR(255),
  rating INT DEFAULT 5,
  review_text TEXT,
  created_at VARCHAR(100)
);

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
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(100) PRIMARY KEY,
  filename VARCHAR(255),
  original_name VARCHAR(255),
  path TEXT,
  url TEXT,
  category VARCHAR(100),
  size INT,
  created_at VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS analytics (
  id VARCHAR(100) PRIMARY KEY,
  page VARCHAR(255),
  event_type VARCHAR(100),
  metadata JSON,
  created_at VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100),
  image_url TEXT,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------------------------
-- 2. CREATE IDEMPOTENT MIGRATION PROCEDURE
-- ------------------------------------------------------------------------------

DELIMITER //

DROP PROCEDURE IF EXISTS SafeAddColumn //

CREATE PROCEDURE SafeAddColumn(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_column_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = p_table_name 
        AND COLUMN_NAME = p_column_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('EXECUTED: Added column ', p_column_name, ' to ', p_table_name) AS MigrationResult;
    ELSE
        SELECT CONCAT('SKIPPED: Column ', p_column_name, ' already exists in ', p_table_name) AS MigrationResult;
    END IF;
END //

DELIMITER ;

-- ------------------------------------------------------------------------------
-- 3. ENSURE ALL COLUMNS EXIST
-- ------------------------------------------------------------------------------

-- Categories
CALL SafeAddColumn('categories', 'name', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('categories', 'slug', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('categories', 'description', 'TEXT');
CALL SafeAddColumn('categories', 'image_url', 'TEXT');
CALL SafeAddColumn('categories', 'banner', 'TEXT');
CALL SafeAddColumn('categories', 'status', 'VARCHAR(50) DEFAULT ''active''');
CALL SafeAddColumn('categories', 'sort_order', 'INT DEFAULT 0');
CALL SafeAddColumn('categories', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
CALL SafeAddColumn('categories', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Products
CALL SafeAddColumn('products', 'sku', 'VARCHAR(100)');
CALL SafeAddColumn('products', 'name', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('products', 'slug', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('products', 'category', 'VARCHAR(100)');
CALL SafeAddColumn('products', 'description', 'TEXT');
CALL SafeAddColumn('products', 'price', 'DECIMAL(10,2) DEFAULT 0');
CALL SafeAddColumn('products', 'sale_price', 'DECIMAL(10,2)');
CALL SafeAddColumn('products', 'stock', 'INT DEFAULT 0');
CALL SafeAddColumn('products', 'material', 'VARCHAR(255)');
CALL SafeAddColumn('products', 'dimensions', 'VARCHAR(255)');
CALL SafeAddColumn('products', 'weight', 'DECIMAL(10,2) DEFAULT 0');
CALL SafeAddColumn('products', 'images', 'JSON');
CALL SafeAddColumn('products', 'featured', 'BOOLEAN DEFAULT FALSE');
CALL SafeAddColumn('products', 'archived', 'BOOLEAN DEFAULT FALSE');
CALL SafeAddColumn('products', 'seo_title', 'VARCHAR(255)');
CALL SafeAddColumn('products', 'seo_description', 'TEXT');
CALL SafeAddColumn('products', 'ai_generated', 'BOOLEAN DEFAULT FALSE');
CALL SafeAddColumn('products', 'ai_generated_at', 'DATETIME');
CALL SafeAddColumn('products', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

-- Product Images
CALL SafeAddColumn('product_images', 'product_id', 'VARCHAR(100)');
CALL SafeAddColumn('product_images', 'image_url', 'TEXT');
CALL SafeAddColumn('product_images', 'alt_text', 'VARCHAR(255)');
CALL SafeAddColumn('product_images', 'sort_order', 'INT DEFAULT 0');
CALL SafeAddColumn('product_images', 'is_primary', 'BOOLEAN DEFAULT FALSE');

-- Blogs
CALL SafeAddColumn('blogs', 'title', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('blogs', 'slug', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('blogs', 'excerpt', 'TEXT');
CALL SafeAddColumn('blogs', 'content', 'LONGTEXT');
CALL SafeAddColumn('blogs', 'image', 'TEXT');
CALL SafeAddColumn('blogs', 'author', 'VARCHAR(100)');
CALL SafeAddColumn('blogs', 'published', 'BOOLEAN DEFAULT FALSE');
CALL SafeAddColumn('blogs', 'seo_title', 'VARCHAR(255)');
CALL SafeAddColumn('blogs', 'seo_description', 'TEXT');
CALL SafeAddColumn('blogs', 'created_at', 'VARCHAR(100)');

-- Reviews
CALL SafeAddColumn('reviews', 'product_id', 'VARCHAR(100)');
CALL SafeAddColumn('reviews', 'customer_name', 'VARCHAR(255)');
CALL SafeAddColumn('reviews', 'rating', 'INT DEFAULT 5');
CALL SafeAddColumn('reviews', 'review_text', 'TEXT');
CALL SafeAddColumn('reviews', 'created_at', 'VARCHAR(100)');

-- Leads
CALL SafeAddColumn('leads', 'customer_name', 'VARCHAR(255)');
CALL SafeAddColumn('leads', 'phone', 'VARCHAR(50)');
CALL SafeAddColumn('leads', 'email', 'VARCHAR(255)');
CALL SafeAddColumn('leads', 'product_id', 'VARCHAR(100)');
CALL SafeAddColumn('leads', 'message', 'TEXT');
CALL SafeAddColumn('leads', 'source', 'VARCHAR(100)');
CALL SafeAddColumn('leads', 'status', 'VARCHAR(100) DEFAULT ''new''');
CALL SafeAddColumn('leads', 'created_at', 'VARCHAR(100)');

-- Settings
CALL SafeAddColumn('settings', 'setting_value', 'JSON');
CALL SafeAddColumn('settings', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Media
CALL SafeAddColumn('media', 'filename', 'VARCHAR(255)');
CALL SafeAddColumn('media', 'original_name', 'VARCHAR(255)');
CALL SafeAddColumn('media', 'path', 'TEXT');
CALL SafeAddColumn('media', 'url', 'TEXT');
CALL SafeAddColumn('media', 'category', 'VARCHAR(100)');
CALL SafeAddColumn('media', 'size', 'INT');
CALL SafeAddColumn('media', 'created_at', 'VARCHAR(100)');

-- Analytics
CALL SafeAddColumn('analytics', 'page', 'VARCHAR(255)');
CALL SafeAddColumn('analytics', 'event_type', 'VARCHAR(100)');
CALL SafeAddColumn('analytics', 'metadata', 'JSON');
CALL SafeAddColumn('analytics', 'created_at', 'VARCHAR(100)');

-- ------------------------------------------------------------------------------
-- 4. CLEANUP
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS SafeAddColumn;
