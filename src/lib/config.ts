export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production'
};
