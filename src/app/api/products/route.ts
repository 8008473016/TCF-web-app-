import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const showArchived = url.searchParams.get('archived') === 'true' && isAdmin(req);

    const products = await db.read('products');
    let formattedProducts = products.map(p => ({
      id: p['Product ID'] || p.id,
      sku: p['SKU'] || p.sku,
      name: p['Product Name'] || p.name,
      slug: p['Slug'] || p.slug,
      category: p['Category'] || p.category,
      description: p['Description'] || p.description,
      price: Number(p['Price'] || p.price || 0),
      salePrice: p['Sale Price'] || p.salePrice ? Number(p['Sale Price'] || p.salePrice) : null,
      stock: Number(p['Stock'] || p.stock || 0),
      material: p['Material'] || p.material,
      dimensions: p['Dimensions'] || p.dimensions,
      weight: Number(p['Weight'] || p.weight || 0),
      images: typeof (p['Images'] || p.images) === 'string' 
        ? (p['Images'] || p.images).split(',').map((img: string) => img.trim()).filter(Boolean)
        : (p['Images'] || p.images || []),
      featured: String(p['Featured'] || p.featured).toLowerCase() === 'true',
      archived: String(p['Archived'] || p.archived).toLowerCase() === 'true',
      seoTitle: p['SEO Title'] || p.seoTitle,
      seoDescription: p['SEO Description'] || p.seoDescription,
    }));

    if (!showArchived) {
      formattedProducts = formattedProducts.filter(p => !p.archived);
    }

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving products', error: error.message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const p = await req.json();
    const newProduct = {
      'Product ID': p.id || `PROD${Date.now()}`,
      'SKU': p.sku,
      'Product Name': p.name,
      'Slug': p.slug,
      'Category': p.category,
      'Description': p.description,
      'Price': p.price,
      'Sale Price': p.salePrice || '',
      'Stock': p.stock,
      'Material': p.material,
      'Dimensions': p.dimensions,
      'Weight': p.weight,
      'Images': Array.isArray(p.images) ? p.images.join(',') : p.images,
      'Featured': String(p.featured),
      'Archived': String(p.archived || 'false'),
      'SEO Title': p.seoTitle || p.name,
      'SEO Description': p.seoDescription || p.description,
    };

    const result = await db.insert('products', newProduct);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating product', error: error.message }, { status: 500 });
  }
}
