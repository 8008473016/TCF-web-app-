import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';
import { driveService } from '@/lib/drive';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const mediaList = await db.read('media');
    const formatted = mediaList.map((m: any) => ({
      id: m.id || m['ID'],
      filename: m.filename || m['Filename'],
      url: m.url || m['URL'],
      size: m.size || m['Size'],
      alt: m.alt || m['Alt'] || '',
      createdAt: m.createdAt || m['Created At']
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching media', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const alt = formData.get('alt') as string || '';
    
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = path.resolve(process.cwd(), 'public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    await fs.promises.writeFile(tempFilePath, buffer);

    const fileUrl = await driveService.uploadFile(
      tempFilePath,
      `${Date.now()}-${file.name}`,
      file.type
    );

    const sizeStr = `${Math.round(file.size / 1024)} KB`;
    const newMedia = {
      'ID': `img_${Date.now()}`,
      'Filename': file.name,
      'URL': fileUrl,
      'Size': sizeStr,
      'Alt': alt,
      'Created At': new Date().toISOString()
    };

    await db.insert('media', newMedia);

    return NextResponse.json({
      id: newMedia['ID'],
      filename: newMedia['Filename'],
      url: newMedia['URL'],
      size: newMedia['Size'],
      alt: newMedia['Alt'],
      createdAt: newMedia['Created At']
    }, { status: 201 });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ message: 'Error uploading media', error: error.message }, { status: 500 });
  }
}
