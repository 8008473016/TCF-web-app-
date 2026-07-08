export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ message: 'Folder slug is required' }, { status: 400 });
    }

    // Protect against directory traversal
    if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return NextResponse.json({ message: 'Invalid folder slug' }, { status: 400 });
    }

    const uploadRoot = process.env.UPLOADS_BASE_DIR || path.join(process.cwd(), 'public/uploads');
    const targetDir = path.resolve(uploadRoot, 'products', slug);

    if (fs.existsSync(targetDir)) {
      // Validate it's a directory
      const stat = fs.statSync(targetDir);
      if (stat.isDirectory()) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        return NextResponse.json({ message: 'Folder deleted successfully' });
      } else {
        return NextResponse.json({ message: 'Path is not a folder' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: 'Folder not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('[API ERROR] Failed to delete folder:', error);
    return NextResponse.json({ message: 'Error deleting folder', error: error.message }, { status: 500 });
  }
}
