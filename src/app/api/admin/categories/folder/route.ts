export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Folder slug is required' }, { status: 400 });
    }

    // Protect against directory traversal
    if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return NextResponse.json({ success: false, message: 'Folder is outside uploads directory' }, { status: 400 });
    }

    const uploadRoot = process.env.UPLOADS_BASE_DIR || path.join(process.cwd(), 'public/uploads');
    const productsDir = path.resolve(uploadRoot, 'products');
    
    // Find the actual physical folder name that corresponds to this slug
    let actualFolderName = slug;
    try {
      const folders = fs.readdirSync(productsDir);
      for (const folder of folders) {
        const folderSlug = folder.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
        if (folderSlug === slug) {
          actualFolderName = folder;
          break;
        }
      }
    } catch (err) {
      console.error('[DELETE API] Could not read products directory to match slug:', err);
    }

    const targetDir = path.resolve(productsDir, actualFolderName);

    // Validate that the resolved path starts with UPLOADS_BASE_DIR/products
    if (!targetDir.startsWith(productsDir)) {
      return NextResponse.json({ success: false, message: 'Folder is outside uploads directory' }, { status: 403 });
    }

    console.log('[DELETE API] Folder requested:', slug);
    console.log('[DELETE API] Resolved absolute path:', targetDir);

    const exists = fs.existsSync(targetDir);
    console.log('[DELETE API] Exists:', exists);

    if (!exists) {
      return NextResponse.json({ success: false, message: 'Folder does not exist.' }, { status: 404 });
    }

    // Validate it's a directory
    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      return NextResponse.json({ success: false, message: 'Path is not a folder.' }, { status: 400 });
    }

    // Permission check
    try {
      await fsPromises.access(targetDir, fs.constants.W_OK);
      console.log('[DELETE API] Permission check: OK');
    } catch (permErr: any) {
      console.log('[DELETE API] Permission check: FAILED', permErr.code);
      return NextResponse.json({ 
        success: false, 
        message: 'Permission denied', 
        error: permErr.code 
      }, { status: 403 });
    }

    // Delete recursively
    try {
      await fsPromises.rm(targetDir, { recursive: true, force: true });
      console.log('[DELETE API] Delete success:', targetDir);
      return NextResponse.json({ success: true, message: 'Folder deleted successfully' });
    } catch (rmErr: any) {
      console.log('[DELETE API] Delete failure:', rmErr.code);
      console.error('[DELETE API] Stack trace:', rmErr.stack);
      return NextResponse.json({ 
        success: false, 
        message: rmErr.code || 'Failed to delete folder', 
        error: rmErr.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[DELETE API] Unexpected error:', error);
    return NextResponse.json({ success: false, message: error.code || 'Unexpected error', error: error.message }, { status: 500 });
  }
}
