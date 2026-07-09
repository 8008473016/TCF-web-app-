const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/uploads/data');
const outDir = path.join(__dirname, '../deployment');
const outFile = path.join(outDir, 'full_products_import.sql');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const escapeStr = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? '1' : '0';
  if (typeof str === 'number') return str;
  // Escape single quotes and backslashes
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
};

let sql = `-- ==============================================================================
-- TCF FULL PRODUCTS IMPORT (PLAIN SQL)
-- 
-- 1. Creates clean '_new' tables with exactly the correct schema
-- 2. Inserts all exported JSON data cleanly
-- ==============================================================================\n\n`;

// ==========================================
// 1. CREATE _new TABLES
// ==========================================
sql += `-- CREATE NEW TABLES\n\n`;

sql += `CREATE TABLE IF NOT EXISTS categories_new (
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
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS products_new (
  id VARCHAR(100) PRIMARY KEY,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  material VARCHAR(255),
  dimensions VARCHAR(255),
  weight DECIMAL(10,2) DEFAULT 0,
  images JSON,
  featured TINYINT(1) DEFAULT 0,
  archived TINYINT(1) DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  ai_generated TINYINT(1) DEFAULT 0,
  ai_generated_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS product_images_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100),
  image_url TEXT,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary TINYINT(1) DEFAULT 0
);\n\n`;

sql += `CREATE TABLE IF NOT EXISTS settings_new (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);\n\n`;

// ==========================================
// 2. INSERT DATA
// ==========================================
let catCount = 0;
let prodCount = 0;
let imgCount = 0;
let settingsCount = 0;

// Categories
const categoriesFile = path.join(dataDir, 'categories.json');
if (fs.existsSync(categoriesFile)) {
  const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
  if (categories.length > 0) {
    sql += `-- INSERT CATEGORIES\n`;
    for (const c of categories) {
      const id = escapeStr(c.id || c['Category ID']);
      const name = escapeStr(c.name || c['Category Name']);
      const slug = escapeStr(c.slug || c['Slug']);
      const desc = escapeStr(c.description || c['Description']);
      const image_url = escapeStr(c.image_url || c['Image']);
      const banner = escapeStr(c.banner || c['Banner']);
      const status = escapeStr(c.status || c['Status'] || 'active');
      const sort_order = c.sort_order || c['Sort Order'] || 0;
      
      sql += `INSERT IGNORE INTO categories_new (id, name, slug, description, image_url, banner, status, sort_order) ` +
             `VALUES (${id}, ${name}, ${slug}, ${desc}, ${image_url}, ${banner}, ${status}, ${sort_order});\n`;
      catCount++;
    }
    sql += `\n`;
  }
}

// Products and Images
const productsFile = path.join(dataDir, 'products.json');
let productImagesSql = `-- INSERT PRODUCT IMAGES\n`;

if (fs.existsSync(productsFile)) {
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  if (products.length > 0) {
    sql += `-- INSERT PRODUCTS\n`;
    for (const p of products) {
      const id = escapeStr(p.id || p['Product ID']);
      const sku = escapeStr(p.sku || p['SKU']);
      const name = escapeStr(p.name || p['Product Name']);
      const slug = escapeStr(p.slug || p['Slug']);
      const category = escapeStr(p.category || p['Category']);
      const desc = escapeStr(p.description || p['Description']);
      const price = p.price || p['Price'] || 0;
      const sale_price = escapeStr(p.salePrice || p['Sale Price']);
      const stock = p.stock !== undefined ? p.stock : (p['Stock'] !== undefined ? p['Stock'] : 0);
      const material = escapeStr(p.material || p['Material']);
      const dimensions = escapeStr(p.dimensions || p['Dimensions']);
      const weight = p.weight || p['Weight'] || 0;
      const imagesRaw = p.images || p['Images'] || '[]';
      
      let imagesArr = [];
      if (typeof imagesRaw === 'string') {
        if (imagesRaw.startsWith('[')) {
          try { imagesArr = JSON.parse(imagesRaw); } catch(e) {}
        } else {
          imagesArr = imagesRaw.split(',').map(i => i.trim());
        }
      } else if (Array.isArray(imagesRaw)) {
        imagesArr = imagesRaw;
      }
      const imagesJson = escapeStr(JSON.stringify(imagesArr));

      const featured = escapeStr(p.featured === true || p['Featured'] === 'TRUE' ? 1 : 0);
      const archived = escapeStr(p.archived === true || p['Archived'] === 'true' ? 1 : 0);
      const seo_title = escapeStr(p.seoTitle || p['SEO Title']);
      const seo_desc = escapeStr(p.seoDescription || p['SEO Description']);
      const ai_generated = escapeStr(p.ai_generated ? 1 : 0);
      
      sql += `INSERT IGNORE INTO products_new (id, sku, name, slug, category, description, price, sale_price, stock, material, dimensions, weight, images, featured, archived, seo_title, seo_description, ai_generated) ` +
             `VALUES (${id}, ${sku}, ${name}, ${slug}, ${category}, ${desc}, ${price}, ${sale_price}, ${stock}, ${material}, ${dimensions}, ${weight}, ${imagesJson}, ${featured}, ${archived}, ${seo_title}, ${seo_desc}, ${ai_generated});\n`;
      prodCount++;

      // Product Images
      for (let i = 0; i < imagesArr.length; i++) {
        const imgUrl = escapeStr(imagesArr[i]);
        const isPrimary = escapeStr(i === 0 ? 1 : 0);
        productImagesSql += `INSERT IGNORE INTO product_images_new (product_id, image_url, alt_text, sort_order, is_primary) ` +
                            `VALUES (${id}, ${imgUrl}, ${name}, ${i}, ${isPrimary});\n`;
        imgCount++;
      }
    }
    sql += `\n`;
  }
}

sql += productImagesSql + `\n`;

// Settings
const settingsFile = path.join(dataDir, 'settings.json');
if (fs.existsSync(settingsFile)) {
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (settings.length > 0) {
    sql += `-- INSERT SETTINGS\n`;
    for (const s of settings) {
      const key = escapeStr(s.Key || s.key);
      const val = escapeStr(s.Value || s.value);
      
      sql += `INSERT IGNORE INTO settings_new (setting_key, setting_value) ` +
             `VALUES (${key}, ${val});\n`;
      settingsCount++;
    }
    sql += `\n`;
  }
}

sql = sql.replace(/\/uploads\/Products\//g, '/uploads/products/');

fs.writeFileSync(outFile, sql, 'utf8');

console.log(`✅ Successfully generated ${outFile}`);
console.log(`- Categories exported: ${catCount}`);
console.log(`- Products exported:   ${prodCount}`);
console.log(`- Images exported:     ${imgCount}`);
console.log(`- Settings exported:   ${settingsCount}`);
