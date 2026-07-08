export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slug = body.slug;
    
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ message: 'Valid slug is required' }, { status: 400 });
    }

    const categories = await db.read('categories');
    const existing = categories.find((c: any) => c.slug === slug);

    if (existing) {
      return NextResponse.json({ 
        message: 'Category already exists', 
        category: existing 
      });
    }

    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const newCategory = {
      name: name,
      slug: slug,
      description: 'Imported from physical folder',
      image_url: '',
      banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      status: 'active',
      sort_order: 0
    };
    
    console.log('[API DEBUG] Registering folder as category:', newCategory);
    const result = await db.insert('categories', newCategory);
    
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error('[API ERROR] Folder registration failed:', error);
    return NextResponse.json({ message: 'Error registering folder', error: error.message }, { status: 500 });
  }
}
