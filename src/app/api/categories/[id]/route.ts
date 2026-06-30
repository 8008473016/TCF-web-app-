import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
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
    const success = await db.delete('categories', 'Category ID', categoryId);
    if (success) {
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
    const updatedCategory = {
      'Category ID': categoryId,
      'Category Name': body.name,
      'Slug': body.slug,
      'Description': body.description,
      'Banner': body.banner,
    };
    const success = await db.update('categories', 'Category ID', categoryId, updatedCategory);
    if (success) {
      return NextResponse.json({ message: 'Category updated successfully' });
    } else {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating category', error: error.message }, { status: 500 });
  }
}
