const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/uploads/data');
const outDir = path.join(__dirname, '../deployment');
const outFile = path.join(outDir, 'database_seed.sql');

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

let sql = `-- TCF Database Seed Export\n-- Generated from local JSON database\n\n`;

// 1. Categories
const categoriesFile = path.join(dataDir, 'categories.json');
if (fs.existsSync(categoriesFile)) {
  const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
  if (categories.length > 0) {
    sql += `-- Categories\n`;
    for (const c of categories) {
      const id = escapeStr(c.id || c['Category ID']);
      const name = escapeStr(c.name || c['Category Name']);
      const slug = escapeStr(c.slug || c['Slug']);
      const desc = escapeStr(c.description || c['Description']);
      const image_url = escapeStr(c.image_url || c['Image']);
      const banner = escapeStr(c.banner || c['Banner']);
      const status = escapeStr(c.status || c['Status'] || 'active');
      const sort_order = c.sort_order || c['Sort Order'] || 0;
      
      sql += `INSERT INTO categories (id, name, slug, description, image_url, banner, status, sort_order) ` +
             `VALUES (${id}, ${name}, ${slug}, ${desc}, ${image_url}, ${banner}, ${status}, ${sort_order}) ` +
             `ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url), banner=VALUES(banner), status=VALUES(status), sort_order=VALUES(sort_order);\n`;
    }
    sql += `\n`;
  }
}

// 2. Products
const productsFile = path.join(dataDir, 'products.json');
let productImagesSql = `-- Product Images\n`;
let imgIdCounter = 1;

if (fs.existsSync(productsFile)) {
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  if (products.length > 0) {
    sql += `-- Products\n`;
    for (const p of products) {
      const id = escapeStr(p.id || p['Product ID']);
      const sku = escapeStr(p.sku || p['SKU']);
      const name = escapeStr(p.name || p['Product Name']);
      const slug = escapeStr(p.slug || p['Slug']);
      const category = escapeStr(p.category || p['Category']);
      const desc = escapeStr(p.description || p['Description']);
      const price = p.price || p['Price'] || 0;
      const sale_price = escapeStr(p.salePrice || p['Sale Price']);
      const stock = p.stock || p['Stock'] || 0;
      const material = escapeStr(p.material || p['Material']);
      const dimensions = escapeStr(p.dimensions || p['Dimensions']);
      const weight = p.weight || p['Weight'] || 0;
      const imagesRaw = p.images || p['Images'] || '[]';
      
      // Handle images JSON array
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

      const featured = escapeStr(p.featured || p['Featured'] === 'TRUE' ? true : false);
      const archived = escapeStr(p.archived || p['Archived'] === 'true' ? true : false);
      const seo_title = escapeStr(p.seoTitle || p['SEO Title']);
      const seo_desc = escapeStr(p.seoDescription || p['SEO Description']);
      const ai_generated = escapeStr(p.ai_generated ? true : false);
      
      sql += `INSERT INTO products (id, sku, name, slug, category, description, price, sale_price, stock, material, dimensions, weight, images, featured, archived, seo_title, seo_description, ai_generated) ` +
             `VALUES (${id}, ${sku}, ${name}, ${slug}, ${category}, ${desc}, ${price}, ${sale_price}, ${stock}, ${material}, ${dimensions}, ${weight}, ${imagesJson}, ${featured}, ${archived}, ${seo_title}, ${seo_desc}, ${ai_generated}) ` +
             `ON DUPLICATE KEY UPDATE sku=VALUES(sku), name=VALUES(name), category=VALUES(category), description=VALUES(description), price=VALUES(price), sale_price=VALUES(sale_price), stock=VALUES(stock), material=VALUES(material), dimensions=VALUES(dimensions), weight=VALUES(weight), images=VALUES(images), featured=VALUES(featured), archived=VALUES(archived), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), ai_generated=VALUES(ai_generated);\n`;

      // Product Images
      for (let i = 0; i < imagesArr.length; i++) {
        const imgUrl = escapeStr(imagesArr[i]);
        const isPrimary = escapeStr(i === 0 ? true : false);
        productImagesSql += `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) ` +
                            `SELECT ${id}, ${imgUrl}, ${name}, ${i}, ${isPrimary} ` +
                            `WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = ${id} AND image_url = ${imgUrl});\n`;
      }
    }
    sql += `\n`;
  }
}

sql += productImagesSql;

// Ensure all paths match the Hostinger requirement of /uploads/Products/
sql = sql.replace(/\/uploads\/products\//g, '/uploads/Products/');

fs.writeFileSync(outFile, sql, 'utf8');
console.log(`Generated ${outFile}`);
