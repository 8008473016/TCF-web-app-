import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

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
    const catSub = category ? category.toLowerCase().replace(/[^a-z0-9-]/g, '') : '';

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const targetDir = path.resolve(process.cwd(), 'public/uploads/products', catSub);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    const targetFilePath = path.join(targetDir, fileName);
    await writeFile(targetFilePath, buffer);
    
    const fileUrl = `/uploads/products/${catSub ? catSub + '/' : ''}${fileName}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('[UPLOAD ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message || 'File upload failed', error: error.stack }, { status: 500 });
  }
}
