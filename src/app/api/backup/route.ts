import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { config as appConfig } from '@/lib/config';
import { dataPaths } from '@/lib/dataPaths';

const config = {
  ...appConfig,
  dataPaths
};

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupData: any = {};
    const keys = Object.keys(config.dataPaths);
    
    for (const key of keys) {
      try {
        const filePath = (config.dataPaths as any)[key];
        const content = await fs.readFile(filePath, 'utf-8');
        backupData[key] = JSON.parse(content);
      } catch (err) {
        backupData[key] = [];
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: backupData
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await req.json();
    if (!data) {
      return NextResponse.json({ success: false, message: 'Invalid backup data' }, { status: 400 });
    }

    const keys = Object.keys(config.dataPaths);
    for (const key of keys) {
      if (data[key] !== undefined) {
        const filePath = (config.dataPaths as any)[key];
        await fs.writeFile(filePath, JSON.stringify(data[key], null, 2));
      }
    }

    return NextResponse.json({ success: true, message: 'All database tables restored successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
