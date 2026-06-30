import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, staffNotes } = await req.json();
    const { id: leadId } = await params;

    const updates: any = {};
    if (status !== undefined) updates['Status'] = status;
    if (staffNotes !== undefined) updates['Staff Notes'] = staffNotes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const result = await db.update('leads', 'Lead ID', leadId, updates);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating lead status', error: error.message }, { status: 500 });
  }
}
