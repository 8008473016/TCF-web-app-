import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
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

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const uploadsDirEnv = process.env.UPLOADS_DIR;
    const publicUrlEnv = process.env.PUBLIC_UPLOADS_URL;

    if (uploadsDirEnv) {
      // Hostinger external path
      const targetDir = path.resolve(uploadsDirEnv, 'products');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFilePath = path.join(targetDir, fileName);
      await fs.promises.writeFile(targetFilePath, buffer);
      
      const baseUrl = publicUrlEnv || 'https://yourdomain.com/uploads';
      const fileUrl = `${baseUrl.replace(/\/$/, '')}/products/${fileName}`;
      return NextResponse.json({ success: true, url: fileUrl });
    } else {
      // Local fallback
      const targetDir = path.resolve(process.cwd(), 'public/uploads/products');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFilePath = path.join(targetDir, fileName);
      await fs.promises.writeFile(targetFilePath, buffer);
      
      const fileUrl = `/uploads/products/${fileName}`;
      return NextResponse.json({ success: true, url: fileUrl });
    }
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json({ success: false, message: error.message || 'File upload failed' }, { status: 500 });
  }
}
