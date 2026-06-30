import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { BlogsListingClient } from './BlogsListingClient';

export const metadata: Metadata = {
  title: "TCF Design Journal | Wooden Furniture Decor Guides & Wood Tips",
  description: "Read premium guides on wood seasoning, caring for Teak & Sheesham, space layout designs, and home furnishing advice straight from our Tenali artisans.",
  keywords: ["Furniture Blog", "Teak Wood Care", "Sheesham vs Teak", "Bespoke Furniture Design Tips", "Home Decor Tenali"],
};

export default async function BlogsPage() {
  const rawBlogs = await db.read('blogs');

  // Format and sort blogs
  const blogs = rawBlogs
    .map((b: any) => ({
      id: String(b['Blog ID'] || b.id || ''),
      title: String(b.Title || b.title || ''),
      slug: String(b.Slug || b.slug || ''),
      content: String(b.Content || b.content || ''),
      author: String(b.Author || b.author || ''),
      bannerImage: String(b['Banner Image'] || b.bannerImage || ''),
      tags: Array.isArray(b.Tags || b.tags) 
        ? (b.Tags || b.tags) 
        : typeof (b.Tags || b.tags) === 'string' 
          ? (b.Tags || b.tags).split(',').map((t: string) => t.trim()) 
          : [],
      createdAt: String(b['Created At'] || b.createdAt || new Date().toISOString())
    }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <BlogsListingClient initialBlogs={blogs} />;
}
