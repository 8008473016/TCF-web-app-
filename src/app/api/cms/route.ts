import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config as appConfig } from '@/lib/config';
import { dataPaths } from '@/lib/dataPaths';
import fs from 'fs/promises';

const config = {
  ...appConfig,
  dataPaths
};

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function GET(req: NextRequest) {
  try {
    const rawSettings = await db.read('settings');
    
    if (Array.isArray(rawSettings)) {
      const settingsObj: any = {};
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key;
        const val = item.Value || item.value;
        if (key) {
          try {
            settingsObj[key] = JSON.parse(val);
          } catch {
            settingsObj[key] = val;
          }
        }
      });
      return NextResponse.json(settingsObj);
    }
    
    return NextResponse.json(rawSettings);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving CMS settings', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newSettings = await req.json();
    const checkArray = await db.read('settings');
    
    if (Array.isArray(checkArray)) {
      const keys = Object.keys(newSettings);
      for (const key of keys) {
        const valueStr = typeof newSettings[key] === 'object' 
          ? JSON.stringify(newSettings[key]) 
          : String(newSettings[key]);
        
        try {
          await db.update('settings', 'Key', key, { Value: valueStr });
        } catch {
          await db.insert('settings', { Key: key, Value: valueStr });
        }
      }
      return NextResponse.json({ success: true, message: 'CMS Settings updated successfully' });
    }
    
    const path = config.dataPaths.settings;
    await fs.writeFile(path, JSON.stringify(newSettings, null, 2));
    
    return NextResponse.json(newSettings);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating CMS settings', error: error.message }, { status: 500 });
  }
}
