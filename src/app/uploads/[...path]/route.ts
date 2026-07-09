import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // If we are running on Render, redirect to Hostinger using the new CDN subdomain
    if (process.env.RENDER === 'true') {
      const cdnDomain = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.tenalicentralfurnitures.com';
      const externalUrl = `${cdnDomain}/uploads/${pathSegments.join('/')}`;
      return NextResponse.redirect(externalUrl);
    }

    // In local development or when running directly on Hostinger, serve from local files
    let uploadsDir = path.resolve(process.cwd(), 'public/uploads');
    
    // Fallback for Hostinger's specific path if needed
    if (process.env.NODE_ENV === 'production' && process.env.RENDER !== 'true') {
        uploadsDir = '/home/u372321620/uploads';
    }

    const filePath = path.join(uploadsDir, ...pathSegments);

    // Prevent Directory Traversal vulnerability
    const relative = path.relative(uploadsDir, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return new NextResponse('Access Denied', { status: 403 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Content-Type mapping
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return new NextResponse('File not found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
