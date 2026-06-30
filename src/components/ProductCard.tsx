'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Percent } from 'lucide-react';
import { openQuoteModal } from './layout/QuoteRequestDialog';

export interface ProductCardProps {
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    salePrice: number | null;
    images: string[];
    material: string;
    dimensions: string;
    stock: number;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const activePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleQuoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuoteModal({ name: product.name, sku: product.sku });
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white border border-tcf-sand hover:shadow-luxury rounded-xl overflow-hidden flex flex-col h-full relative transition-all duration-300">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-tcf-red text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 rounded shadow-premium">
            <Percent className="w-3 h-3" /> Save {discountPercent}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="bg-tcf-dark text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block overflow-hidden relative pt-[100%] bg-tcf-light">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill
          sizes="(max-w-7xl) 25vw, (max-w-md) 50vw, 100vw"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
          priority={false}
        />
        
        {/* Hover quick action overlay */}
        <div className="absolute inset-0 bg-tcf-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button 
            onClick={handleQuoteClick}
            className="px-4 py-2.5 bg-tcf-red hover:bg-tcf-gold hover:text-tcf-dark text-white text-xs font-bold uppercase tracking-widest shadow-luxury flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-lg cursor-pointer font-sans"
          >
            <MessageSquare className="w-4 h-4" /> Get Quote
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3 border-t border-tcf-sand bg-white">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-tcf-red block mb-1">
            {product.material}
          </span>
          <h3 className="font-serif font-bold text-tcf-dark text-base line-clamp-1 group-hover:text-tcf-red transition-colors">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="text-xs text-tcf-dark/60 line-clamp-1 mt-0.5 font-light">
            Dimensions: {product.dimensions || 'Standard Size'}
          </p>
        </div>

        <div className="pt-2 border-t border-tcf-sand/50 flex flex-col gap-2">
          {/* Price details */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-tcf-red font-mono">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-tcf-dark/40 line-through font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Link 
              href={`/products/${product.slug}`} 
              className="py-2 text-center border border-tcf-sand text-xs font-semibold text-tcf-dark hover:bg-tcf-light rounded transition-colors"
            >
              Details
            </Link>
            <button 
              onClick={handleQuoteClick}
              className="py-2 bg-tcf-red text-white hover:bg-red-700 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
