const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/uploads/data');
const outDir = path.join(__dirname, '../deployment');
const outFile = path.join(outDir, 'products_only_import.sql');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const escapeStr = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? '1' : '0';
  if (typeof str === 'number') return str;
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
};

let sql = `-- ==============================================================================
-- TCF PRODUCTS ONLY IMPORT (PLAIN SQL)
-- 
-- 1. Inserts directly into the existing 'products' table.
-- 2. Matches exact Hostinger schema (no ai_generated columns).
-- 3. No CREATE, DROP, DELETE, or ALTER commands.
-- ==============================================================================\n\n`;

let prodCount = 0;
const productsFile = path.join(dataDir, 'products.json');

if (fs.existsSync(productsFile)) {
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
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
    
    // Images
    let imagesRaw = p.images || p['Images'] || '[]';
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
    
    sql += `INSERT INTO products (id, sku, name, slug, category, description, price, sale_price, stock, material, dimensions, weight, images, featured, archived, seo_title, seo_description) ` +
           `VALUES (${id}, ${sku}, ${name}, ${slug}, ${category}, ${desc}, ${price}, ${sale_price}, ${stock}, ${material}, ${dimensions}, ${weight}, ${imagesJson}, ${featured}, ${archived}, ${seo_title}, ${seo_desc});\n`;
    prodCount++;
  }
}

// Normalize paths
sql = sql.replace(/\/uploads\/Products\//g, '/uploads/products/');

fs.writeFileSync(outFile, sql, 'utf8');
console.log(`✅ Successfully generated ${outFile}`);
console.log(`- Products exported: ${prodCount}`);
