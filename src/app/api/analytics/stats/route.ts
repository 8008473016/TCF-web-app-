import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const stats = await analyticsService.getStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
