export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getMySqlPool } from '@/lib/mysql';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

const makeSafeSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const formatName = (slug: string): string => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const IGNORED_FOLDERS = ['old', 'backup', '.ds_store', 'thumbs.db'];

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    categoriesCreated: 0,
    categoriesExisting: 0,
    productsCreated: 0,
    productsSkipped: 0,
    imagesCreated: 0,
    errors: [] as string[]
  };

  try {
    const mysqlDb = getMySqlPool();
    const uploadRoot = process.env.UPLOADS_BASE_DIR || path.join(process.cwd(), 'public/uploads');
    const productsDir = path.resolve(uploadRoot, 'products');

    if (!fs.existsSync(productsDir)) {
      return NextResponse.json({ message: 'Products directory not found', results }, { status: 404 });
    }

    const physicalFolders = fs.readdirSync(productsDir).filter(f => {
      try {
        return fs.statSync(path.join(productsDir, f)).isDirectory() && !IGNORED_FOLDERS.includes(f.toLowerCase());
      } catch {
        return false;
      }
    });

    for (const folderName of physicalFolders) {
      const categorySlug = makeSafeSlug(folderName);
      const categoryName = formatName(folderName);
      
      let categoryId: number | null = null;

      // 1. Check or Create Category
      try {
        const [existingCategory]: any = await mysqlDb.query('SELECT id FROM categories WHERE slug = ?', [categorySlug]);
        if (existingCategory.length > 0) {
          categoryId = existingCategory[0].id;
          results.categoriesExisting++;
        } else {
          const [insertCategoryResult]: any = await mysqlDb.query(
            'INSERT INTO categories (name, slug, description, image_url, banner, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [categoryName, categorySlug, 'Imported from physical folder', '', '', 'active', 0]
          );
          categoryId = insertCategoryResult.insertId;
          results.categoriesCreated++;
        }
      } catch (err: any) {
        results.errors.push(`Category error [${folderName}]: ${err.message}`);
        continue; // Skip processing this folder if category creation failed
      }

      // 2. Scan Folder for Images
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
        const imageUrl = `/uploads/products/${folderName}/${file}`; // Use relative URL for DB

        let productId: string | null = null;

        // 3. Check or Create Product
        try {
          const [existingProduct]: any = await mysqlDb.query('SELECT id, images FROM products WHERE slug = ?', [productSlug]);
          
          if (existingProduct.length > 0) {
            productId = existingProduct[0].id;
            results.productsSkipped++;

            // Optionally, update the legacy images JSON if missing
            try {
              let legacyImages = [];
              if (existingProduct[0].images) {
                legacyImages = typeof existingProduct[0].images === 'string' ? JSON.parse(existingProduct[0].images) : existingProduct[0].images;
              }
              if (!legacyImages.includes(imageUrl)) {
                 legacyImages.push(imageUrl);
                 await mysqlDb.query('UPDATE products SET images = ? WHERE id = ?', [JSON.stringify(legacyImages), productId]);
              }
            } catch(e){}

          } else {
            productId = crypto.randomUUID();
            const legacyImagesJson = JSON.stringify([imageUrl]);
            await mysqlDb.query(
              `INSERT INTO products (id, name, slug, category, description, price, featured, status, images, material, dimensions, weight, stock) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                productId,
                productName,
                productSlug,
                categorySlug, // Storing category slug as requested by schema
                "Premium handcrafted furniture. Custom sizes available.",
                0,
                false,
                'active',
                legacyImagesJson,
                "",
                "Custom size available",
                0,
                0
              ]
            );
            results.productsCreated++;
          }
        } catch (err: any) {
          results.errors.push(`Product error [${file}]: ${err.message}`);
          continue;
        }

        // 4. Create Product Image Row
        try {
          // Check if image exists for product
          const [existingImage]: any = await mysqlDb.query('SELECT id FROM product_images WHERE product_id = ? AND image_url = ?', [productId, imageUrl]);
          if (existingImage.length === 0) {
            await mysqlDb.query(
              'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
              [productId, imageUrl, productName, 0, true]
            );
            results.imagesCreated++;
          }
        } catch (err: any) {
          results.errors.push(`Image error [${file}]: ${err.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('[API ERROR] Import failed:', error);
    return NextResponse.json({ message: 'Error performing import', error: error.message }, { status: 500 });
  }
}
