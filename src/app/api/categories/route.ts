export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';
import { listProductFolders, normalizeFolderSlug, getProductUploadsDir } from '@/lib/upload-paths';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const categories = await db.read('categories');
    
    // Filter invalid categories
    const validCategories = categories.filter((c: any) => {
      const name = c.name || c['Category Name'];
      const slug = c.slug || c['Slug'];
      return name && slug && String(slug).trim() !== '';
    });

    const url = new URL(req.url);
    const isAdminRequest = url.searchParams.get('admin') === 'true';

    const formatted = validCategories.map((c: any) => ({
      id: c.id || c['Category ID'] ? parseInt(c.id || c['Category ID'], 10) : null,
      databaseId: c.id || c['Category ID'] ? parseInt(c.id || c['Category ID'], 10) : null,
      slug: c.slug || c['Slug'],
      name: c.name || c['Category Name'],
      description: c.description || c['Description'] || '',
      image_url: c.image_url || c.banner || c['Banner'] || '',
      banner: c.banner || c['Banner'] || '',
      status: c.status || c['Status'],
      sort_order: c.sort_order || c['Sort Order'],
      createdAt: c.created_at || c['Created At'],
      updatedAt: c.updated_at || c['Updated At'],
      registered: true
    }));

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
    
    if (!c.name || c.name.trim() === '') {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const slug = normalizeFolderSlug(c.slug || c.name);
    
    if (!slug) {
      return NextResponse.json({ message: 'Valid category slug could not be generated' }, { status: 400 });
    }
    
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
