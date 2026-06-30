import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import fs from 'fs';
import path from 'path';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { alt, oldUrl, newUrl } = await req.json();
    const { id } = await params;

    const updateObj: any = {};
    if (alt !== undefined) updateObj['Alt'] = alt;
    if (newUrl !== undefined) updateObj['URL'] = newUrl;

    const result = await db.update('media', 'ID', id, updateObj);

    // Global URL Replace logic
    if (oldUrl && newUrl) {
      // 1. Update in products
      try {
        const products = await db.read('products');
        for (const p of products) {
          const imagesVal = p['Images'] || p.images || '';
          if (typeof imagesVal === 'string' && imagesVal.includes(oldUrl)) {
            const updatedImages = imagesVal
              .split(',')
              .map((img: string) => img.trim() === oldUrl ? newUrl : img.trim())
              .join(',');
            await db.update('products', 'Product ID', p['Product ID'] || p.id, { 'Images': updatedImages });
          } else if (Array.isArray(imagesVal) && imagesVal.includes(oldUrl)) {
            const updatedImages = imagesVal.map((img: string) => img === oldUrl ? newUrl : img);
            await db.update('products', 'Product ID', p['Product ID'] || p.id, { 'Images': updatedImages });
          }
        }
      } catch (err) {
        console.error('Error replacing URL in products:', err);
      }

      // 2. Update in settings
      try {
        const settings = await db.read('settings');
        if (!Array.isArray(settings)) {
          let settingsStr = JSON.stringify(settings);
          if (settingsStr.includes(oldUrl)) {
            settingsStr = settingsStr.replaceAll(oldUrl, newUrl);
            const parsed = JSON.parse(settingsStr);
            const fs = require('fs/promises');
            const { dataPaths } = require('@/lib/dataPaths');
            await fs.writeFile(dataPaths.settings, JSON.stringify(parsed, null, 2));
          }
        }
      } catch (err) {
        console.error('Error replacing URL in settings:', err);
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating media', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const mediaList = await db.read('media');
    const item = mediaList.find((m: any) => (m.id || m['ID']) === id);
    
    if (item) {
      const fileUrl = item.url || item['URL'];
      if (fileUrl && fileUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', fileUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
    }

    const success = await db.delete('media', 'ID', id);
    if (success) {
      return NextResponse.json({ message: 'Media deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting media', error: error.message }, { status: 500 });
  }
}
