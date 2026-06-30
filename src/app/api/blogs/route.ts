import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// GET /api/blogs
export async function GET(req: NextRequest) {
  try {
    const blogs = await db.read('blogs');
    const formatted = blogs.map(b => ({
      id: b['Blog ID'] || b.id || b.blogId,
      title: b['Title'] || b.title,
      slug: b['Slug'] || b.slug,
      content: b['Content'] || b.content,
      author: b['Author'] || b.author,
      bannerImage: b['Banner Image'] || b.bannerImage,
      tags: typeof (b['Tags'] || b.tags) === 'string'
        ? (b['Tags'] || b.tags).split(',').map((t: string) => t.trim()).filter(Boolean)
        : (b['Tags'] || b.tags || []),
      createdAt: b['Created At'] || b.createdAt,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving blogs', error: error.message }, { status: 500 });
  }
}

// POST /api/blogs
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const b = await req.json();
    const newBlog = {
      'Blog ID': b.id || `BLOG${Date.now()}`,
      'Title': b.title,
      'Slug': b.slug,
      'Content': b.content,
      'Author': b.author,
      'Banner Image': b.bannerImage,
      'Tags': Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || ''),
      'Created At': new Date().toISOString()
    };
    
    const result = await db.insert('blogs', newBlog);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating blog post', error: error.message }, { status: 500 });
  }
}
