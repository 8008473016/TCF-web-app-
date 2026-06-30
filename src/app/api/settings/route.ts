import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { db } from '@/lib/db';
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

// GET /api/settings
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
      
      if (Object.keys(settingsObj).length === 0) {
        return NextResponse.json({ message: 'Settings not configured' }, { status: 404 });
      }
      return NextResponse.json(settingsObj);
    }
    
    return NextResponse.json(rawSettings);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving settings', error: error.message }, { status: 500 });
  }
}

// PUT /api/settings
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
      return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    }
    
    const path = config.dataPaths.settings;
    await fs.writeFile(path, JSON.stringify(newSettings, null, 2));
    
    return NextResponse.json(newSettings);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating settings', error: error.message }, { status: 500 });
  }
}
