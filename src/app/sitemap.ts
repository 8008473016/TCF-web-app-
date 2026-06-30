import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tenalicentralfurniture.com';

  // Base core pages
  const staticPages = [
    '',
    '/products',
    '/custom-furniture',
    '/blogs',
    '/privacy-policy',
    '/refund-policy'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic products pages
  let productEntries: any[] = [];
  try {
    const products = await db.read('products');
    productEntries = products.map((p: any) => ({
      url: `${baseUrl}/products/${p.Slug || p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('Error creating sitemap product entries:', err);
  }

  // Dynamic blogs pages
  let blogEntries: any[] = [];
  try {
    const blogs = await db.read('blogs');
    blogEntries = blogs.map((b: any) => ({
      url: `${baseUrl}/blogs/${b.Slug || b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('Error creating sitemap blog entries:', err);
  }

  // Dynamic service area cities pages
  const cities = ['tenali', 'vijayawada', 'guntur', 'mangalagiri', 'bapatla', 'repalle', 'chilakaluripet', 'ongole'];
  const cityEntries = cities.map((city) => ({
    url: `${baseUrl}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productEntries, ...blogEntries, ...cityEntries];
}
