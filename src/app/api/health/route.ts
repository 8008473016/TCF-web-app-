import { NextResponse } from 'next/server';
import { getMySqlPool } from '@/lib/mysql';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status: any = {
    app: 'running',
    nodeEnv: process.env.NODE_ENV,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    mysql: 'checking...',
    uploadsDir: 'checking...',
  };

  // Check MySQL
  try {
    const db = getMySqlPool();
    await db.query('SELECT 1');
    status.mysql = 'connected';
  } catch (err: any) {
    status.mysql = 'disconnected';
    status.mysqlError = err.message;
  }

  // Check Uploads Folder Permissions
  try {
    const uploadsPath = process.env.UPLOADS_BASE_DIR || path.resolve(process.cwd(), 'public/uploads');
    fs.accessSync(uploadsPath, fs.constants.W_OK | fs.constants.R_OK);
    status.uploadsDir = 'writable';
    status.uploadsPath = uploadsPath;
  } catch (err: any) {
    status.uploadsDir = 'error';
    status.uploadsError = err.message;
  }

  return NextResponse.json(status, { 
    status: status.mysql === 'connected' && status.uploadsDir === 'writable' ? 200 : 503 
  });
}
