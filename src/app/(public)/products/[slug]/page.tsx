import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductDetailClient } from './ProductDetailClient';

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
    console.error('Error reading settings in Product Page:', error);
    return {};
  }
};

const parseImages = (images: any): string[] => {
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    if (images.startsWith('[')) {
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return images.split(',').map((img: string) => img.trim()).filter(Boolean);
  }
  return [];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = await db.read('products');
  const product = products.find((p: any) => {
    const s = p.slug || p['Slug'];
    return s === slug || s === decodeURIComponent(slug);
  });
  
  if (!product) {
    return {
      title: "Product Not Found | TCF Furniture",
    };
  }
  
  const parsedImages = parseImages(product.images || product['Images']);
  
  return {
    title: `${product.name || product['Product Name']} | Handcrafted Solid Wood Furniture | TCF`,
    description: product.seoDescription || product['SEO Description'] || `Handcrafted solid wood ${product.name || product['Product Name']} built by local artisans in Tenali. Features premium Grade-A seasoned timber, termite warranty, and customization options.`,
    openGraph: {
      title: product.seoTitle || product['SEO Title'] || `${product.name || product['Product Name']} - TCF Furniture`,
      description: product.seoDescription || product['SEO Description'] || product.description || product['Description'],
      images: [parsedImages[0] || "/logo.jpg"],
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const products = await db.read('products');
  
  const productData = products.find((p: any) => {
    const s = p.slug || p['Slug'];
    return s === slug || s === decodeURIComponent(slug);
  });
  
  if (!productData) {
    notFound();
  }

  // Format product
  const product = {
    id: String(productData.id || productData['Product ID']),
    sku: String(productData.sku || productData['SKU'] || ''),
    name: String(productData.name || productData['Product Name'] || ''),
    slug: String(productData.slug || productData['Slug'] || ''),
    category: String(productData.category || productData['Category'] || ''),
    price: Number(productData.price || productData['Price'] || 0),
    salePrice: productData.salePrice || productData['Sale Price'] ? Number(productData.salePrice || productData['Sale Price']) : null,
    images: parseImages(productData.images || productData['Images']),
    material: String(productData.material || productData['Material'] || ''),
    dimensions: String(productData.dimensions || productData['Dimensions'] || ''),
    weight: Number(productData.weight || productData['Weight'] || 0),
    description: String(productData.description || productData['Description'] || ''),
    stock: Number(productData.stock !== undefined ? productData.stock : productData['Stock'] !== undefined ? productData['Stock'] : 1)
  };

  // Get related products
  const relatedProductsData = products
    .filter((p: any) => (p.category || p['Category']) === product.category && (p.slug || p['Slug']) !== product.slug)
    .slice(0, 4);

  const relatedProducts = relatedProductsData.map((p: any) => ({
    id: String(p.id || p['Product ID']),
    sku: String(p.sku || p['SKU'] || ''),
    name: String(p.name || p['Product Name'] || ''),
    slug: String(p.slug || p['Slug'] || ''),
    category: String(p.category || p['Category'] || ''),
    price: Number(p.price || p['Price'] || 0),
    salePrice: p.salePrice || p['Sale Price'] ? Number(p.salePrice || p['Sale Price']) : null,
    images: parseImages(p.images || p['Images']),
    material: String(p.material || p['Material'] || ''),
    dimensions: String(p.dimensions || p['Dimensions'] || ''),
    weight: Number(p.weight || p['Weight'] || 0),
    description: String(p.description || p['Description'] || ''),
    stock: Number(p.stock !== undefined ? p.stock : p['Stock'] !== undefined ? p['Stock'] : 1)
  }));

  // Fetch reviews for this product
  let initialReviews: any[] = [];
  try {
    const rawReviews = await db.read('reviews');
    initialReviews = rawReviews
      .filter((r: any) => String(r.productId) === String(product.id))
      .map((r: any) => ({
        id: String(r.id),
        productId: String(r.productId),
        customerName: String(r.customerName || ''),
        rating: Number(r.rating || 5),
        reviewText: String(r.reviewText || ''),
        createdAt: String(r.createdAt || new Date().toISOString())
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error loading reviews:', err);
  }

  const settings = await getSettings();
  const activePrice = product.salePrice || product.price;

  return (
    <>
      {/* Product Rich Snippet Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description,
            "sku": product.sku,
            "offers": {
              "@type": "Offer",
              "url": `https://tenalicentralfurniture.com/products/${product.slug}`,
              "priceCurrency": "INR",
              "price": activePrice,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
              "priceValidUntil": "2027-12-31"
            }
          })
        }}
      />
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        initialReviews={initialReviews}
        settings={settings}
      />
    </>
  );
}
