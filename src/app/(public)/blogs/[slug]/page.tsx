import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { BlogArticleClient } from './BlogArticleClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper to get parsed settings
const getSettings = async () => {
  try {
    const rawSettings = await db.read('settings');
    if (Array.isArray(rawSettings)) {
      const settingsObj: any = {};
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key;
        const val = item.Value || item.value;
        if (key) {
          try {
            settingsObj[key] = JSON.parse(val);
          } catch {
            settingsObj[key] = val;
          }
        }
      });
      return settingsObj;
    }
    return rawSettings || {};
  } catch (error) {
    console.error('Error reading settings in Blog Page:', error);
    return {};
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogs = await db.read('blogs');
  const blog = blogs.find((b: any) => (b.Slug || b.slug) === slug);
  
  if (!blog) {
    return {
      title: "Article Not Found | TCF Furniture",
    };
  }
  
  const titleText = blog.Title || blog.title;
  return {
    title: `${titleText} | TCF Furniture Blog`,
    description: `Read: ${titleText}. Handcrafted furniture advice, timber seasoning tips, care tutorials, and room layouts from TCF Tenali experts.`,
    openGraph: {
      title: titleText,
      description: `Advice on premium solid wood furniture care and buying guides from TCF Tenali.`,
      images: [blog.bannerImage || blog.BannerImage || "/logo.jpg"],
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  
  const rawBlogs = await db.read('blogs');
  const blogData = rawBlogs.find((b: any) => (b.Slug || b.slug) === slug);
  
  if (!blogData) {
    notFound();
  }

  // Format blog data
  const blog = {
    id: String(blogData['Blog ID'] || blogData.id || blogData.blogId),
    title: String(blogData.Title || blogData.title),
    slug: String(blogData.Slug || blogData.slug),
    content: String(blogData.Content || blogData.content),
    author: String(blogData.Author || blogData.author),
    bannerImage: String(blogData['Banner Image'] || blogData.bannerImage || blogData.BannerImage),
    tags: Array.isArray(blogData.Tags) 
      ? blogData.Tags 
      : typeof blogData.Tags === 'string' 
        ? blogData.Tags.split(',').map((t: string) => t.trim()) 
        : Array.isArray(blogData.tags) 
          ? blogData.tags 
          : typeof blogData.tags === 'string' 
            ? blogData.tags.split(',').map((t: string) => t.trim()) 
            : [],
    createdAt: String(blogData['Created At'] || blogData.createdAt)
  };

  // Get recommended products for the sidebar
  const rawProducts = await db.read('products');
  const recommendedProducts = rawProducts
    .filter((p: any) => p.featured === true || p['Featured'] === true || p['Featured'] === 'TRUE')
    .slice(0, 3)
    .map((p: any) => ({
      id: String(p.id || p['Product ID'] || ''),
      name: String(p.name || p['Product Name'] || ''),
      slug: String(p.slug || p['Slug'] || ''),
      price: Number(p.price || p['Price'] || 0),
      salePrice: p.salePrice || p['Sale Price'] ? Number(p.salePrice || p['Sale Price']) : null,
      images: Array.isArray(p.images) 
        ? p.images 
        : typeof p.images === 'string' 
          ? JSON.parse(p.images) 
          : typeof p['Images'] === 'string' 
            ? p['Images'].split(',').map((img: string) => img.trim()).filter(Boolean)
            : [],
      material: String(p.material || p['Material'] || '')
    }));

  const settings = await getSettings();

  return (
    <BlogArticleClient 
      blog={blog} 
      relatedProducts={recommendedProducts} 
      settings={settings}
    />
  );
}
