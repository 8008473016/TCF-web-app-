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
    const uploadsDir = process.env.UPLOADS_BASE_DIR || path.resolve(process.cwd(), 'public/uploads');
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

    let needsHeal = false;
    
    // Auto-heal corrupted "undefined" IDs
    categories.forEach((c: any) => {
      if (c['Category ID'] === 'undefined' || c.id === 'undefined') {
        const slug = c['Slug'] || c.slug || makeSafeSlug(c['Category Name'] || 'recovered');
        c['Category ID'] = slug;
        c.id = slug;
        needsHeal = true;
      }
    });

    if (needsHeal) {
      // Save the healed database immediately
      const dataPath = path.resolve(process.cwd(), 'public/uploads/data/categories.json');
      await fs.promises.writeFile(dataPath, JSON.stringify(categories, null, 2));
    }

    // Map registered categories
    const formatted = categories.map((c: any) => {
      const slug = c['Slug'] || c.slug;
      const folderExists = physicalFolders.some(f => f.toLowerCase() === slug.toLowerCase());
      return {
        id: c['Category ID'] || c.id,
        name: c['Category Name'] || c.name,
        slug: slug,
        description: c['Description'] || c.description,
        banner: c['Banner'] || c.banner,
        folderPath: c.folderPath || `public/uploads/products/${slug}`,
        publicUrl: c.publicUrl || `/uploads/products/${slug}`,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
        folderExists: folderExists,
        isUnregistered: false
      };
    });

    // Add unregistered physical folders
    physicalFolders.forEach(folderName => {
      const matches = formatted.some(c => c.slug.toLowerCase() === folderName.toLowerCase());
      if (!matches) {
        formatted.push({
          id: folderName,
          name: folderName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          slug: folderName,
          description: 'Physical folder with no category definition in JSON.',
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
    const slug = makeSafeSlug(c.slug || c.name);
    const now = new Date().toISOString();
    
    // Automatically create category folder inside public/uploads
    const uploadRoot = process.env.UPLOADS_BASE_DIR || path.resolve(process.cwd(), 'public/uploads');
    const targetDir = path.resolve(uploadRoot, 'products', slug);
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch (err: any) {
        return NextResponse.json({ 
          message: 'Failed to create physical folder due to permission error', 
          error: err.message 
        }, { status: 500 });
      }
    }

    const folderPath = `public/uploads/products/${slug}`;
    const publicUrl = `/uploads/products/${slug}`;

    const newCategory = {
      'Category ID': c.id || slug,
      'Category Name': c.name,
      'Slug': slug,
      'Description': c.description || '',
      'Banner': c.banner || '',
      'id': c.id || slug,
      'name': c.name,
      'slug': slug,
      'folderPath': folderPath,
      'publicUrl': publicUrl,
      'createdAt': now,
      'updatedAt': now
    };
    const result = await db.insert('categories', newCategory);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error('[API ERROR] Category creation failed:', error);
    return NextResponse.json({ success: false, message: 'Error creating category', error: error.message }, { status: 500 });
  }
}
