import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const categories = await db.read('categories');
    const formatted = categories.map(c => ({
      id: c['Category ID'] || c.id,
      name: c['Category Name'] || c.name,
      slug: c['Slug'] || c.slug,
      description: c['Description'] || c.description,
      banner: c['Banner'] || c.banner,
    }));
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
    const newCategory = {
      'Category ID': c.id || `CAT${Date.now()}`,
      'Category Name': c.name,
      'Slug': c.slug,
      'Description': c.description,
      'Banner': c.banner,
    };
    const result = await db.insert('categories', newCategory);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating category', error: error.message }, { status: 500 });
  }
}
