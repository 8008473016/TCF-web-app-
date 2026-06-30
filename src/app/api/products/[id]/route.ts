import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const p = await req.json();
    const { id: productId } = await params;

    const updatedProduct = {
      'SKU': p.sku,
      'Product Name': p.name,
      'Slug': p.slug,
      'Category': p.category,
      'Description': p.description,
      'Price': p.price,
      'Sale Price': p.salePrice !== undefined ? p.salePrice : '',
      'Stock': p.stock,
      'Material': p.material,
      'Dimensions': p.dimensions,
      'Weight': p.weight,
      'Images': Array.isArray(p.images) ? p.images.join(',') : p.images,
      'Featured': String(p.featured),
      'Archived': String(p.archived !== undefined ? p.archived : 'false'),
      'SEO Title': p.seoTitle,
      'SEO Description': p.seoDescription,
    };

    const result = await db.update('products', 'Product ID', productId, updatedProduct);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating product', error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: productId } = await params;
    const success = await db.delete('products', 'Product ID', productId);
    if (success) {
      return NextResponse.json({ message: 'Product deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting product', error: error.message }, { status: 500 });
  }
}
