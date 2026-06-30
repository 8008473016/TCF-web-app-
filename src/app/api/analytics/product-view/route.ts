import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { slug, name } = await req.json();
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Product slug is required' }, { status: 400 });
    }
    await analyticsService.recordProductView(slug, name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
