export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParam = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category') || 'all';
    const material = url.searchParams.get('material') || 'all';
    const maxPrice = Number(url.searchParams.get('maxPrice')) || 150000;
    const sortBy = url.searchParams.get('sortBy') || 'popular';
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 24;

    const products = await db.read('products');
    
    // Format products
    let list = products.map((p: any) => ({
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
    })).filter(p => !p.archived);

    // Apply filters
    if (searchParam) {
      const q = searchParam.toLowerCase();
      list = list.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (category !== 'all') {
      list = list.filter((p: any) => p.category === category);
    }

    if (material !== 'all') {
      list = list.filter((p: any) => (p.material || '').toLowerCase() === material.toLowerCase());
    }

    list = list.filter((p: any) => {
      const activePrice = p.salePrice || p.price;
      return activePrice <= maxPrice;
    });

    // Apply sorting
    if (sortBy === 'price-low') {
      list.sort((a: any, b: any) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a: any, b: any) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'name-az') {
      list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    // Extract unique materials and max possible price BEFORE pagination to send to frontend
    const materialsSet = new Set<string>();
    let absoluteMaxPrice = 0;
    products.filter(p => !p.archived).forEach((p: any) => {
      if (p.Material || p.material) materialsSet.add(p.Material || p.material);
      const activePrice = Number(p['Sale Price'] || p.salePrice || p['Price'] || p.price || 0);
      if (activePrice > absoluteMaxPrice) absoluteMaxPrice = activePrice;
    });
    
    absoluteMaxPrice = absoluteMaxPrice > 150000 ? Math.ceil(absoluteMaxPrice / 50000) * 50000 : 150000;

    // Apply pagination
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedList = list.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedList,
      total,
      totalPages,
      page,
      limit,
      meta: {
        materials: Array.from(materialsSet),
        maxAvailablePrice: absoluteMaxPrice
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving products', error: error.message }, { status: 500 });
  }
}
