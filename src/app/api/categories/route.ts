export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

const makeSafeSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')        // spaces to hyphens
    .replace(/-+/g, '-')         // remove duplicate hyphens
    .trim();
};

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const categories = await db.read('categories');
    
    // Scan uploads directory for products folders
    const uploadsDir = process.env.UPLOADS_BASE_DIR || "/home/u372321620/uploads";
    const productsDir = path.resolve(uploadsDir, 'products');
    let physicalFolders: string[] = [];
    
    if (fs.existsSync(productsDir)) {
      physicalFolders = fs.readdirSync(productsDir).filter(f => {
        try {
          return fs.statSync(path.join(productsDir, f)).isDirectory();
        } catch {
          return false;
        }
      });
    }

    // Map registered categories
    const formatted = categories.map((c: any) => {
      const slug = c.slug;
      const folderExists = physicalFolders.some(f => f.toLowerCase() === slug?.toLowerCase());
      return {
        id: c.id,
        name: c.name,
        slug: slug,
        description: c.description,
        image_url: c.image_url,
        banner: c.banner,
        status: c.status,
        sort_order: c.sort_order,
        folderPath: `public/uploads/products/${slug}`,
        publicUrl: `/uploads/products/${slug}`,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        folderExists: folderExists,
        isUnregistered: false
      };
    });

    // Add unregistered physical folders
    physicalFolders.forEach(folderName => {
      const matches = formatted.some(c => c.slug?.toLowerCase() === folderName.toLowerCase());
      if (!matches) {
        formatted.push({
          id: `unregistered-${folderName}`, // Just for frontend keying
          name: folderName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          slug: folderName,
          description: 'Physical folder with no category definition in database.',
          banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
          folderPath: `public/uploads/products/${folderName}`,
          publicUrl: `/uploads/products/${folderName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folderExists: true,
          isUnregistered: true
        });
      }
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[API ERROR] GET /categories:', error);
    return NextResponse.json({ message: 'Error retrieving categories', error: error.message }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const c = await req.json();
    console.log('[API DEBUG] POST /api/categories called for Create Mode', c);
    
    if (!c.name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const slug = makeSafeSlug(c.slug || c.name);
    
    // Automatically create category folder inside absolute uploads dir
    const uploadRoot = process.env.UPLOADS_BASE_DIR || "/home/u372321620/uploads";
    const targetDir = path.resolve(uploadRoot, 'products', slug);
    console.log(`[API DEBUG] Creating category folder at: ${targetDir}`);
    
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`[API DEBUG] Successfully created folder: ${targetDir}`);
      } catch (err: any) {
        console.error(`[API DEBUG] Failed to create folder ${targetDir}`, err);
        return NextResponse.json({ 
          message: 'Failed to create physical folder', 
          error: err.message 
        }, { status: 500 });
      }
    } else {
      console.log(`[API DEBUG] Folder already exists: ${targetDir}`);
    }

    const newCategory = {
      name: c.name,
      slug: slug,
      description: c.description || '',
      image_url: c.image_url || c.banner || '',
      banner: c.banner || c.image_url || '',
      status: c.status || 'active',
      sort_order: c.sort_order || 0
    };
    
    console.log('[API DEBUG] Inserting new category into DB:', newCategory);
    
    // Explicitly using the db abstraction which maps to MySQL insert.
    // The insert will omit `id` allowing AUTO_INCREMENT to handle it.
    const result = await db.insert('categories', newCategory);
    
    console.log('[API DEBUG] DB Insert Result:', result);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error('[API ERROR] Category creation failed:', error);
    return NextResponse.json({ success: false, message: 'Error creating category', error: error.message }, { status: 500 });
  }
}
