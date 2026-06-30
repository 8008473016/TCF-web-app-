import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path) {
      return NextResponse.json({ success: false, message: 'Path is required' }, { status: 400 });
    }
    await analyticsService.recordVisit(path);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
