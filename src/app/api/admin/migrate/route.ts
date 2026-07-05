import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getMySqlPool } from '@/lib/mysql';
import { dbLocal } from '@/lib/db.local';
import { dbMysql } from '@/lib/db.mysql';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure tables exist
    await initDatabase();
    const mysqlDb = getMySqlPool();

    const tables = ['categories', 'products', 'blogs', 'reviews', 'leads', 'settings', 'media', 'analytics'];
    const results: Record<string, { migrated: number, skipped: number, errors: string[] }> = {};

    for (const table of tables) {
      results[table] = { migrated: 0, skipped: 0, errors: [] };
      const localData = await dbLocal.read(table);

      if (localData && localData.length > 0) {
        for (const item of localData) {
          try {
            // First check if it already exists to avoid duplicate entry errors
            // Use the map logic implicitly by just attempting an insert, if it fails due to duplicates, we catch it
            await dbMysql.insert(table, item);
            results[table].migrated++;
          } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') {
              results[table].skipped++; // Already exists
            } else {
              results[table].errors.push(err.message || String(err));
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully.',
      results
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error.message || String(error)
    }, { status: 500 });
  }
}
