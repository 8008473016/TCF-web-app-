import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// PUT /api/blogs/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const b = await req.json();
    const { id: blogId } = await params;
    
    const updatedBlog = {
      'Title': b.title,
      'Slug': b.slug,
      'Content': b.content,
      'Author': b.author,
      'Banner Image': b.bannerImage,
      'Tags': Array.isArray(b.tags) ? b.tags.join(',') : b.tags,
    };
    
    const result = await db.update('blogs', 'Blog ID', blogId, updatedBlog);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating blog post', error: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: blogId } = await params;
    const success = await db.delete('blogs', 'Blog ID', blogId);
    if (success) {
      return NextResponse.json({ message: 'Blog post deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting blog post', error: error.message }, { status: 500 });
  }
}
