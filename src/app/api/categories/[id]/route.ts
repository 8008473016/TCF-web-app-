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
    const { id: rawId } = await params;
    const categoryId = parseInt(rawId, 10);
    
    if (isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json({ message: 'Invalid category ID format' }, { status: 400 });
    }

    const url = new URL(req.url);
    const deleteFolder = url.searchParams.get('deleteFolder') === 'true';

    // Get the category details to know the slug before deleting
    const categories = await db.read('categories');
    const category = categories.find((c: any) => parseInt(c.id, 10) === categoryId);

    const success = await db.delete('categories', 'id', String(categoryId));
    if (success) {
      if (deleteFolder && category) {
        const slug = category.slug;
        const uploadRoot = process.env.UPLOADS_BASE_DIR || "/home/u372321620/uploads";
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
    const { id: rawId } = await params;
    
    if (!rawId || rawId === 'undefined' || rawId === 'null') {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }
    
    const categoryId = parseInt(rawId, 10);
    if (isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json({ message: 'Invalid category ID: must be an integer' }, { status: 400 });
    }

    const body = await req.json();
    const slug = makeSafeSlug(body.slug || body.name || rawId);
    
    // Automatically create category folder inside absolute uploads dir
    const uploadRoot = process.env.UPLOADS_BASE_DIR || "/home/u372321620/uploads";
    const targetDir = path.resolve(uploadRoot, 'products', slug);
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch (err: any) {
        return NextResponse.json({ 
          message: 'Failed to create physical folder', 
          error: err.message 
        }, { status: 500 });
      }
    }

    const updatedCategory = {
      name: body.name,
      slug: slug,
      description: body.description || '',
      image_url: body.image_url || body.banner || '',
      banner: body.banner || body.image_url || '',
      status: body.status || 'active',
      sort_order: body.sort_order || 0
    };

    // Note: this explicitly calls update, it will NOT upsert.
    // If the category does not exist, it will just affect 0 rows or throw.
    console.log(`[API DEBUG] Updating category ID ${categoryId}:`, updatedCategory);
    
    await db.update('categories', 'id', String(categoryId), updatedCategory);
    return NextResponse.json({ success: true, message: 'Category updated successfully' });

  } catch (error: any) {
    console.error(`[API ERROR] Category update failed:`, error);
    return NextResponse.json({ success: false, message: 'Error updating category', error: error.message }, { status: 500 });
  }
}
