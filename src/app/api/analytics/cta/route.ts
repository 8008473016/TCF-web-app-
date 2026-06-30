import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { ctaType } = await req.json();
    if (!ctaType) {
      return NextResponse.json({ success: false, message: 'ctaType is required' }, { status: 400 });
    }
    await analyticsService.recordCtaClick(ctaType);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
