'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Award, Send, Star, User, Phone, MessageSquare, MapPin, Check } from 'lucide-react';
import axios from 'axios';
import { openQuoteModal } from '@/components/layout/QuoteRequestDialog';
import { ProductCard } from '@/components/ProductCard';

interface Product {
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
  weight: number;
  description: string;
  stock: number;
}

interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews: Review[];
  settings: any;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts,
  initialReviews,
  settings
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState('Natural Polish');
  
  // Pincode checker
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Review System
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const activePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const phone = settings?.contact?.phone || '+91 98765 43210';
  const whatsapp = settings?.contact?.whatsapp || 'https://wa.me/919876543210';

  const checkDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      setPincodeResult({ status: 'error', message: 'Please enter a valid 6-digit pin code.' });
      return;
    }
    
    // Quick delivery logic based in AP
    if (pincode.startsWith('522') || pincode.startsWith('520') || pincode.startsWith('521') || pincode.startsWith('523') || pincode.startsWith('524')) {
      setPincodeResult({ status: 'success', message: 'Delivery available! 2-4 days direct shipping from Tenali.' });
    } else if (pincode.startsWith('5')) {
      setPincodeResult({ status: 'success', message: 'Delivery available! 4-7 days shipping across Andhra & Telangana.' });
    } else {
      setPincodeResult({ status: 'success', message: 'Pan-India shipping available! 7-10 days safe multi-layer crated transport.' });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      alert('Please fill out all fields before submitting review.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        productId: product.id,
        customerName: reviewName,
        rating: reviewRating,
        reviewText: reviewText
      };
      
      const res = await axios.post('/api/reviews', payload);
      setReviews([res.data, ...reviews]);
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      alert('Review submitted successfully! Thank you.');
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const mainImage = product.images?.[activeImageIndex] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-tcf-light min-h-screen py-12 font-sans space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-tcf-dark/50 flex gap-2 items-center">
          <Link href="/" className="hover:text-tcf-red transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-tcf-red transition-colors">Furniture</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-tcf-red transition-colors capitalize">{product.category.replace('-', ' ')}</Link>
          <span>/</span>
          <span className="text-tcf-dark font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product details section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white border border-tcf-sand p-6 sm:p-8 shadow-premium rounded-2xl">
          {/* Images panel */}
          <div className="space-y-4">
            <div className="relative border border-tcf-sand bg-tcf-light aspect-square overflow-hidden rounded-xl">
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill
                priority={true}
                className="object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-tcf-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-premium z-10">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails grid */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={`border aspect-square overflow-hidden bg-tcf-light transition-all duration-300 rounded-lg relative cursor-pointer ${
                      i === activeImageIndex ? 'border-tcf-red border-2' : 'border-tcf-sand hover:border-tcf-red'
                    }`}
                  >
                    <Image 
                      src={img} 
                      alt={`Thumbnail ${i+1}`} 
                      fill 
                      sizes="150px"
                      className="object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration & Order Panel */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-tcf-red bg-tcf-light px-2 py-0.5 rounded inline-block">
                Seasoned {product.material}
              </span>
              <h1 className="text-3xl font-serif font-black text-tcf-dark mt-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-tcf-dark/50 mt-1 font-mono">SKU: {product.sku}</p>
              
              {/* Price Details */}
              <div className="flex items-baseline gap-3 pt-3 border-t border-tcf-sand/50 mt-4">
                <span className="text-3xl font-bold font-mono text-tcf-red">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-tcf-dark/40 line-through font-mono">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-tcf-dark/75 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Custom Size Notice */}
            <div className="bg-[#F5F2EB] border border-tcf-sand p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-tcf-red uppercase tracking-wider block">Custom Sizes Available</span>
              <p className="text-[11px] text-tcf-dark/80 leading-relaxed font-light">
                We manufacture furniture according to your requirements. This product can be customized in size, dimensions, color, finish, fabric, and material. Contact us for a personalized quotation.
              </p>
            </div>

            {/* Finish selection mock details */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                Staining & Polish Finish
              </label>
              <div className="flex gap-3">
                {['Natural Polish', 'Teak Stained Walnut', 'Warm Honey Honeycomb'].map((finish) => (
                  <button 
                    key={finish}
                    onClick={() => setSelectedFinish(finish)}
                    className={`px-3 py-2 border text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                      selectedFinish === finish 
                        ? 'bg-tcf-red text-white border-tcf-red' 
                        : 'bg-white border-tcf-sand text-tcf-dark/80 hover:border-tcf-red'
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead CTAs */}
            <div className="space-y-3 pt-3 border-t border-tcf-sand/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => openQuoteModal({ name: product.name, sku: product.sku })}
                  className="py-3.5 bg-tcf-red hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-premium cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageSquare className="w-4 h-4" /> Get Custom Quote
                </button>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi TCF! I am interested in inquiring about the "${product.name}" (SKU: ${product.sku}). Please let me know custom size details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp Inquiry
                </a>
              </div>
              <a
                href={`tel:${phone}`}
                className="w-full py-3.5 border border-tcf-sand hover:bg-tcf-light text-tcf-dark font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Showroom Yard
              </a>
            </div>

            {/* Delivery pincode checking form */}
            <form onSubmit={checkDelivery} className="space-y-2 border-t border-tcf-sand/50 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                Check Delivery Availability
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-3 py-2 border border-tcf-sand bg-tcf-light text-xs rounded-lg focus:outline-none focus:border-tcf-red font-mono"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-tcf-dark hover:bg-tcf-red text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Check
                </button>
              </div>
              {pincodeResult && (
                <p className={`text-xs font-medium ${pincodeResult.status === 'success' ? 'text-green-600' : 'text-tcf-red'}`}>
                  {pincodeResult.message}
                </p>
              )}
            </form>

          </div>
        </div>

        {/* Specifications Section */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 bg-zinc-50 p-4 sm:p-8 border border-tcf-sand/80 overflow-hidden rounded-2xl">
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat bg-center wood-overlay" 
            style={{ backgroundSize: '300px' }} 
          />
          
          <div className="md:col-span-2 space-y-4 bg-white p-6 border border-tcf-sand rounded-xl relative z-10">
            <h2 className="text-xl font-serif font-bold text-tcf-dark border-b border-tcf-sand pb-2">
              Product Specifications
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm text-tcf-dark/85">
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Timber Type</span>
                <span>Seasoned Grade-A {product.material}</span>
              </div>
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Dimensions</span>
                <span>{product.dimensions || 'Customizable'}</span>
              </div>
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Net Weight</span>
                <span>{product.weight ? `${product.weight} kg` : 'Custom weight'}</span>
              </div>
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Warranty Status</span>
                <span>Termite Warranty Shield</span>
              </div>
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Staining Polish</span>
                <span>{selectedFinish}</span>
              </div>
              <div className="flex justify-between border-b border-tcf-sand/40 pb-2">
                <span className="font-semibold text-tcf-dark/60">Stock Status</span>
                <span>{product.stock > 0 ? 'Made to Order / In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="space-y-4 bg-white p-6 border border-tcf-sand rounded-xl relative z-10 flex flex-col justify-center">
            <h3 className="font-serif font-bold text-lg text-tcf-dark">Why Buy TCF?</h3>
            <ul className="space-y-2 text-xs text-tcf-dark/85 font-light">
              <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> 100% Seasoned Treated Solid Timber</li>
              <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> Generational Tenali Woodcarvers</li>
              <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> Custom sizes & polishes built to fit</li>
              <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> Pan-India Crated Transport Shield</li>
            </ul>
          </div>
        </div>

        {/* Reviews tab section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Reviews logs list */}
          <div className="lg:col-span-7 bg-white border border-tcf-sand p-6 rounded-2xl shadow-premium space-y-6">
            <h3 className="text-xl font-serif font-bold text-tcf-dark border-b border-tcf-sand pb-3">
              Patron Reviews ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-sm italic text-tcf-dark/50">No reviews verified for this product yet. Write the first review!</p>
            ) : (
              <div className="space-y-6 divide-y divide-tcf-sand/60">
                {reviews.map((rev) => (
                  <div key={rev.id} className="space-y-2 pt-4 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-sm text-tcf-dark">{rev.customerName}</span>
                      <span className="text-[10px] text-tcf-dark/40">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed text-tcf-dark/75 font-light">
                      {rev.reviewText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a review form */}
          <div className="lg:col-span-5 bg-white border border-tcf-sand p-6 rounded-2xl shadow-premium">
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <h3 className="text-base font-serif font-bold text-tcf-dark">Write a Review</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-tcf-dark/40" />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-tcf-sand bg-tcf-light text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">Rating</label>
                <div className="flex gap-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button 
                      key={stars} 
                      type="button" 
                      onClick={() => setReviewRating(stars)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${stars <= reviewRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">Review</label>
                <textarea 
                  rows={4} 
                  placeholder="Share details of your experience with TCF furniture finish, carving details, wood heavy structure..." 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 border border-tcf-sand bg-tcf-light text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingReview}
                className="w-full py-2.5 bg-tcf-dark hover:bg-tcf-red text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Related Products catalog */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-tcf-sand/80">
            <h3 className="text-2xl font-serif font-black text-tcf-dark">
              Similar Solid Wood Masterpieces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
