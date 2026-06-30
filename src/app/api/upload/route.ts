import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { driveService } from '@/lib/drive';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp path
    const tempDir = path.resolve(process.cwd(), 'public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    await fs.promises.writeFile(tempFilePath, buffer);

    // Upload via driveService
    const fileUrl = await driveService.uploadFile(
      tempFilePath,
      `${Date.now()}-${file.name}`,
      file.type
    );

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json({ success: false, message: error.message || 'File upload failed' }, { status: 500 });
  }
}
