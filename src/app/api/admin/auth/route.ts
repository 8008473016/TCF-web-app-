import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    if (secret === config.adminSecret) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      response.cookies.set('tcf_admin_token', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      return response;
    } else {
      return NextResponse.json({ success: false, message: 'Invalid secret token' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
