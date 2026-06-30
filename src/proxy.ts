import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from '@/lib/config';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const token = req.cookies.get('tcf_admin_token')?.value;

    if (token !== appConfig.adminSecret) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === '/admin') {
    const dashboardUrl = new URL('/admin/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect /admin/login to /admin/dashboard if already logged in
  if (pathname === '/admin/login') {
    const token = req.cookies.get('tcf_admin_token')?.value;
    if (token === appConfig.adminSecret) {
      const dashboardUrl = new URL('/admin/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
