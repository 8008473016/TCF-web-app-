import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMySqlPool } from '@/lib/mysql';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasMysqlEnv = !!process.env.MYSQL_DATABASE;
  const mysqlHost = process.env.MYSQL_HOST || '127.0.0.1';

  let mysqlConnected = false;
  let connectionError = null;

  try {
    if (hasMysqlEnv) {
      const pool = getMySqlPool();
      const [rows] = await pool.query('SELECT 1 as test');
      mysqlConnected = Array.isArray(rows) && rows.length > 0;
    }
  } catch (error: any) {
    connectionError = error.message;
  }

  // Determine active data source
  // In production, db should ALWAYS be mysql due to our updated logic in db.ts
  const activeDataSource = (isProduction || hasMysqlEnv) ? 'mysql' : 'json';

  const healthData = {
    status: 'ok',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      isProduction,
    },
    database: {
      activeDataSource,
      MYSQL_HOST_LOADED: !!process.env.MYSQL_HOST,
      MYSQL_DATABASE_LOADED: hasMysqlEnv,
      connected: mysqlConnected,
      host: hasMysqlEnv ? mysqlHost : null,
      error: connectionError
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(healthData);
}
