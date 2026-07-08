export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getMySqlPool } from '@/lib/mysql';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids, deleteFiles } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'No product IDs provided' }, { status: 400 });
    }

    const mysqlDb = getMySqlPool();
    
    const strIds = ids.map(id => String(id));
    const placeholders = strIds.map(() => '?').join(',');

    // Delete from product_images table first
    await mysqlDb.query(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, strIds);

    // Delete from products table
    const [result]: any = await mysqlDb.query(`DELETE FROM products WHERE id IN (${placeholders})`, strIds);

    return NextResponse.json({ 
      success: true, 
      message: 'Products deleted successfully',
      deletedCount: result.affectedRows || 0
    });
  } catch (error: any) {
    console.error('[API ERROR] Bulk delete failed:', error);
    return NextResponse.json({ message: 'Error performing bulk delete', error: error.message }, { status: 500 });
  }
}
