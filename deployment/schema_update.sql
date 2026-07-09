-- ==============================================================================
-- TCF SCHEMA MIGRATION (PLAIN SQL)
-- 
-- Compatible with Hostinger phpMyAdmin. 
-- Instructions: Run this script ONCE before importing database_seed.sql.
-- ==============================================================================

-- 1. Create the new product_images table if it doesn't already exist
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100),
  image_url TEXT,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- 2. Add AI tracking columns to the products table
ALTER TABLE products ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN ai_generated_at DATETIME NULL;
