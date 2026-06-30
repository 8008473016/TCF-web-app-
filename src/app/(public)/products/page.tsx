import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ProductListingClient } from './ProductListingClient';

export const metadata: Metadata = {
  title: "Solid Wood Furniture Catalog | TCF Tenali",
  description: "Browse our premium collection of solid wood beds, dining tables, sofa sets, TV units and wardrobes. Custom dimensions and termite warranty included.",
  keywords: ["Wood Furniture Catalog", "Solid Teak Beds", "Teak Wood Dining Sets", "Bespoke Sofa Sets Tenali"],
};

export default async function ProductsPage() {
  const products = await db.read('products');
  const categories = await db.read('categories');

  // Format products to match interface expected by client component
  const formattedProducts = products.map((p: any) => ({
    id: String(p.id || p['Product ID'] || ''),
    sku: String(p.sku || p['SKU'] || ''),
    name: String(p.name || p['Product Name'] || ''),
    slug: String(p.slug || p['Slug'] || ''),
    category: String(p.category || p['Category'] || ''),
    description: String(p.description || p['Description'] || ''),
    price: Number(p.price || p['Price'] || 0),
    salePrice: p.salePrice || p['Sale Price'] ? Number(p.salePrice || p['Sale Price']) : null,
    images: Array.isArray(p.images) 
      ? p.images 
      : typeof p.images === 'string' 
        ? JSON.parse(p.images) 
        : typeof p['Images'] === 'string' 
          ? p['Images'].split(',').map((img: string) => img.trim()).filter(Boolean)
          : [],
    material: String(p.material || p['Material'] || ''),
    dimensions: String(p.dimensions || p['Dimensions'] || ''),
    stock: Number(p.stock !== undefined ? p.stock : p['Stock'] !== undefined ? p['Stock'] : 1)
  }));

  // Format categories
  const formattedCategories = categories.map((c: any) => ({
    id: String(c.id || c['Category ID'] || ''),
    name: String(c.name || c['Category Name'] || ''),
    slug: String(c.slug || c['Slug'] || ''),
    description: String(c.description || c['Description'] || '')
  }));

  return (
    <ProductListingClient 
      initialProducts={formattedProducts} 
      categories={formattedCategories} 
    />
  );
}
