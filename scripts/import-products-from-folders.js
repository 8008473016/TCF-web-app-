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
    tags: [categoryName.toLowerCase(), 'furniture'],
    ai_generated: false
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(`[GEMINI] No API key found. Using safe defaults for ${productName}`);
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
    return { ...defaultData, ...parsed, ai_generated: true };
  } catch (error) {
    console.warn(`[GEMINI ERROR] Failed for ${productName}:`, error.message);
    return defaultData; // Falls back to ai_generated: false
  }
};

async function runImport() {
  const args = process.argv.slice(2);
  let action = 'sync'; // sync, generate_missing, regenerate_all

  if (args.includes('--generate-missing')) action = 'generate_missing';
  if (args.includes('--regenerate-all')) action = 'regenerate_all';

  const results = {
    action,
    categoriesCreated: 0,
    categoriesExisting: 0,
    productsCreated: 0,
    productsSkipped: 0,
    productsGenerated: 0,
    imagesCreated: 0,
    errors: []
  };

  if (!process.env.MYSQL_DATABASE) {
    console.error('Missing MYSQL_DATABASE environment variable.');
    process.exit(1);
  }

  const db = getDbPool();

  try {
    // Schema safe updates
    try {
      await db.query(`ALTER TABLE products ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE`);
      await db.query(`ALTER TABLE products ADD COLUMN ai_generated_at DATETIME`);
    } catch (e) {
      // Ignore if columns already exist
    }

    if (action === 'generate_missing' || action === 'regenerate_all') {
      console.log(`Starting AI Generation Mode: ${action}`);
      const query = action === 'generate_missing' 
        ? 'SELECT id, name, category, slug FROM products WHERE ai_generated = FALSE OR ai_generated IS NULL'
        : 'SELECT id, name, category, slug FROM products';
        
      const [products] = await db.query(query);
      console.log(`Found ${products.length} products to generate AI details for...`);

      for (const prod of products) {
        console.log(`-> Generating for ${prod.name}...`);
        
        // Fetch category name
        let catName = prod.category;
        try {
          const [cat] = await db.query('SELECT name FROM categories WHERE slug = ?', [prod.category]);
          if (cat.length > 0) catName = cat[0].name;
        } catch(e) {}

        const details = await generateProductData(prod.name, catName);
        if (details.ai_generated) {
           await db.query(`
             UPDATE products SET 
               description = ?, 
               material = ?, 
               dimensions = ?, 
               seo_title = ?, 
               seo_description = ?, 
               ai_generated = TRUE, 
               ai_generated_at = NOW() 
             WHERE id = ?`,
             [details.full_description, details.material, details.size, details.seo_title, details.seo_description, prod.id]
           );
           results.productsGenerated++;
        }
      }
      console.log('\n--- IMPORT COMPLETE ---');
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    // Default 'sync' folder import
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
        const imageUrl = `/uploads/Products/${folderName}/${file}`; 

        let productId = null;

        try {
          const [existingProduct] = await db.query('SELECT id, images FROM products WHERE slug = ?', [productSlug]);
          
          if (existingProduct.length > 0) {
            productId = existingProduct[0].id;
            results.productsSkipped++;

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
            
            const aiGeneratedVal = details.ai_generated ? 1 : 0;
            
            await db.query(
              `INSERT INTO products (id, name, slug, category, description, price, featured, status, images, material, dimensions, weight, stock, seo_title, seo_description, ai_generated, ai_generated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
                details.seo_description,
                aiGeneratedVal
              ]
            );
            results.productsCreated++;
            if (aiGeneratedVal) results.productsGenerated++;
            console.log(`  + Created product: ${productName}`);
          }
        } catch (err) {
          results.errors.push(`Product error [${file}]: ${err.message}`);
          continue;
        }

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
