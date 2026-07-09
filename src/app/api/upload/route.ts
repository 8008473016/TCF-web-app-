export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { uploadFile } from '@/lib/upload-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const category = formData.get('category') as string | null;
    const catSub = category
      ? category.toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      : 'uncategorized';

    const fileName = `${Date.now()}-${file.name.replace(/\\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const subDir = `products/${catSub}`;
    
    const fileUrl = await uploadFile(buffer, subDir, fileName);
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('[API UPLOAD ROUTE ERROR]:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'File upload failed', 
      error: error.stack || String(error)
    }, { status: 500 });
  }
}
