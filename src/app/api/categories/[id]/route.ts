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

// DELETE /api/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: categoryId } = await params;
    const url = new URL(req.url);
    const deleteFolder = url.searchParams.get('deleteFolder') === 'true';

    // Get the category details to know the slug before deleting
    const categories = await db.read('categories');
    const category = categories.find(c => (c.id || c['Category ID']) === categoryId);

    const success = await db.delete('categories', 'Category ID', categoryId);
    if (success) {
      if (deleteFolder && category) {
        const slug = category.slug || category['Slug'];
        const uploadRoot = process.env.UPLOADS_BASE_DIR || path.resolve(process.cwd(), 'public/uploads');
        const targetDir = path.resolve(uploadRoot, 'products', slug);
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
      }
      return NextResponse.json({ message: 'Category deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting category', error: error.message }, { status: 500 });
  }
}

// PUT /api/categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: categoryId } = await params;
    const body = await req.json();
    
    if (categoryId === 'undefined' || !categoryId) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

    // Check if the PUT is specifically a request to just create/ensure the directory exists
    const ensureFolderOnly = body.action === 'create-folder';

    const slug = makeSafeSlug(body.slug || body.name || categoryId);
    
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

    if (ensureFolderOnly) {
      return NextResponse.json({ message: 'Folder created successfully' });
    }

    const folderPath = `public/uploads/products/${slug}`;
    const publicUrl = `/uploads/products/${slug}`;

    const updatedCategory = {
      'Category ID': categoryId,
      'Category Name': body.name,
      'Slug': slug,
      'Description': body.description || '',
      'Banner': body.banner || '',
      'id': categoryId,
      'name': body.name,
      'slug': slug,
      'folderPath': folderPath,
      'publicUrl': publicUrl,
      'createdAt': body.createdAt || new Date().toISOString(),
      'updatedAt': new Date().toISOString()
    };

    // Check if category exists in JSON to decide update or insert (upsert)
    const categories = await db.read('categories');
    const exists = categories.some((item: any) => String(item.id || item['Category ID']) === String(categoryId));

    if (exists) {
      await db.update('categories', 'Category ID', categoryId, updatedCategory);
      return NextResponse.json({ success: true, message: 'Category updated successfully' });
    } else {
      await db.insert('categories', updatedCategory);
      return NextResponse.json({ success: true, message: 'Category created and registered successfully' });
    }
  } catch (error: any) {
    console.error(`[API ERROR] Category update failed for category ${params}:`, error);
    return NextResponse.json({ success: false, message: 'Error updating/creating category', error: error.message }, { status: 500 });
  }
}
