export const config = {
  adminSecret: process.env.ADMIN_SECRET || 'admin123',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production'
};
