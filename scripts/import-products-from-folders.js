const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables manually to support standalone execution
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^([^#]+?)=(.+)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
} catch (e) {
  console.warn('Could not load .env.local automatically', e.message);
}

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const IGNORED_FOLDERS = ['old', 'backup', '.ds_store', 'thumbs.db'];

// Helpers
const makeSafeSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const formatName = (slug) => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getDbPool = () => {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 50
  });
};

const generateProductData = async (productName, categoryName) => {
  const defaultData = {
    short_description: 'Premium handcrafted furniture. Custom sizes available.',
    full_description: 'Premium handcrafted furniture. Custom sizes available.',
    material: '',
    size: 'Custom size available',
    estimated_price_range: 'Contact for price',
    seo_title: `${productName} - Custom Handcrafted Furniture`,
    seo_description: `Discover the premium ${productName}. Custom sizes available. Contact for exact pricing.`,
    tags: [categoryName.toLowerCase(), 'furniture']
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return defaultData;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert furniture catalog copywriter. Generate product details for a furniture item named "${productName}" in the category "${categoryName}". 

Return ONLY a valid JSON object with these exact keys:
- "short_description" (1 sentence, mentions custom sizes and contact for price)
- "full_description" (2-3 sentences, furniture catalogue style, handcrafted, showroom enquiry)
- "material" (guess the likely material, e.g. "Solid Wood", "Teak", "Fabric")
- "size" (e.g. "Custom size available")
- "estimated_price_range" (e.g. "Contact for price")
- "seo_title" (SEO optimized title, max 60 chars)
- "seo_description" (SEO optimized description, max 150 chars)
- "tags" (array of 3-5 relevant string keywords)`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(text);
    return { ...defaultData, ...parsed };
  } catch (error) {
    console.warn(`[GEMINI ERROR] Failed for ${productName}:`, error.message);
    return defaultData;
  }
};

async function runImport() {
  const results = {
    categoriesCreated: 0,
    categoriesExisting: 0,
    productsCreated: 0,
    productsSkipped: 0,
    imagesCreated: 0,
    errors: []
  };

  if (!process.env.MYSQL_DATABASE) {
    console.error('Missing MYSQL_DATABASE environment variable.');
    process.exit(1);
  }

  const db = getDbPool();

  try {
    // 1. Safely create tables
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100),
        image_url TEXT,
        alt_text VARCHAR(255),
        sort_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        UNIQUE KEY idx_unique_image (product_id, image_url(255))
      )
    `);

    // 2. Locate uploads directory
    let productsDir = process.env.PRODUCT_UPLOADS_DIR;
    if (!productsDir || !fs.existsSync(productsDir)) {
      productsDir = path.join(process.cwd(), 'public/uploads/Products');
    }
    if (!fs.existsSync(productsDir)) {
      productsDir = path.join(process.cwd(), 'public/uploads/products');
    }

    if (!fs.existsSync(productsDir)) {
      throw new Error(`Products directory not found at ${productsDir}`);
    }

    // 3. Scan Folders
    const physicalFolders = fs.readdirSync(productsDir).filter(f => {
      try {
        return fs.statSync(path.join(productsDir, f)).isDirectory() && !IGNORED_FOLDERS.includes(f.toLowerCase());
      } catch {
        return false;
      }
    });

    console.log(`Found ${physicalFolders.length} product folders to process...`);

    for (const folderName of physicalFolders) {
      const categorySlug = makeSafeSlug(folderName);
      const categoryName = formatName(folderName);
      
      let categoryId = null;

      // Category Import
      try {
        const [existingCategory] = await db.query('SELECT id FROM categories WHERE slug = ?', [categorySlug]);
        if (existingCategory.length > 0) {
          categoryId = existingCategory[0].id;
          results.categoriesExisting++;
        } else {
          const [insertRes] = await db.query(
            'INSERT INTO categories (name, slug, description, image_url, banner, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [categoryName, categorySlug, 'Imported from physical folder', '', '', 'active', 0]
          );
          categoryId = insertRes.insertId;
          results.categoriesCreated++;
          console.log(`+ Created category: ${categoryName}`);
        }
      } catch (err) {
        results.errors.push(`Category error [${folderName}]: ${err.message}`);
        continue; 
      }

      // Product Import
      const folderPath = path.join(productsDir, folderName);
      const files = fs.readdirSync(folderPath).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return VALID_EXTENSIONS.includes(ext) && !IGNORED_FOLDERS.includes(f.toLowerCase());
      });

      for (const file of files) {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const productName = formatName(baseName);
        const productSlug = makeSafeSlug(`${categorySlug}-${baseName}`);
        
        // Retain original capitalization for Hostinger Linux paths
        // Do NOT lowercase folderName or file here, as Linux is case-sensitive
        const imageUrl = `/uploads/Products/${folderName}/${file}`; 

        let productId = null;

        try {
          const [existingProduct] = await db.query('SELECT id, images FROM products WHERE slug = ?', [productSlug]);
          
          if (existingProduct.length > 0) {
            productId = existingProduct[0].id;
            results.productsSkipped++;

            // Update legacy images JSON if missing
            try {
              let legacyImages = [];
              if (existingProduct[0].images) {
                legacyImages = typeof existingProduct[0].images === 'string' ? JSON.parse(existingProduct[0].images) : existingProduct[0].images;
              }
              if (!legacyImages.includes(imageUrl)) {
                 legacyImages.push(imageUrl);
                 await db.query('UPDATE products SET images = ? WHERE id = ?', [JSON.stringify(legacyImages), productId]);
              }
            } catch(e) {}
          } else {
            console.log(`  -> Generating AI details for product: ${productName}...`);
            const details = await generateProductData(productName, categoryName);
            
            productId = crypto.randomUUID();
            const legacyImagesJson = JSON.stringify([imageUrl]);
            
            await db.query(
              `INSERT INTO products (id, name, slug, category, description, price, featured, status, images, material, dimensions, weight, stock, seo_title, seo_description) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                productId,
                productName,
                productSlug,
                categorySlug,
                details.full_description,
                0,
                false,
                'active',
                legacyImagesJson,
                details.material,
                details.size,
                0,
                0,
                details.seo_title,
                details.seo_description
              ]
            );
            results.productsCreated++;
            console.log(`  + Created product: ${productName}`);
          }
        } catch (err) {
          results.errors.push(`Product error [${file}]: ${err.message}`);
          continue;
        }

        // Product Images Table Import
        try {
          const [existingImage] = await db.query('SELECT id FROM product_images WHERE product_id = ? AND image_url = ?', [productId, imageUrl]);
          if (existingImage.length === 0) {
            await db.query(
              'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
              [productId, imageUrl, productName, 0, true]
            );
            results.imagesCreated++;
          }
        } catch (err) {
          // Ignore unique constraint violations gracefully
          if (err.code !== 'ER_DUP_ENTRY') {
            results.errors.push(`Image error [${file}]: ${err.message}`);
          }
        }
      }
    }

    console.log('\n--- IMPORT COMPLETE ---');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('FATAL ERROR DURING IMPORT:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runImport();
