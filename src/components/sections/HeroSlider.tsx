'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { openQuoteModal } from '../layout/QuoteRequestDialog';

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroSliderProps {
  banners: Banner[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const handlePrev = () => {
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative h-[80vh] sm:h-[85vh] bg-tcf-dark overflow-hidden w-full">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-tcf-dark/90 via-tcf-dark/60 to-transparent z-10" />
          
          {/* Image */}
          <img 
            src={banner.image} 
            alt={banner.title} 
            className="w-full h-full object-cover object-center"
          />

          {/* Content */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl space-y-6">
                <span className="text-tcf-gold text-xs font-sans font-bold uppercase tracking-[0.3em] block animate-fade-in">
                  Tenali Central Furniture
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-white leading-tight">
                  {banner.title}
                </h1>
                <p className="text-sm sm:text-lg text-white/80 font-light leading-relaxed max-w-lg">
                  {banner.subtitle}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  {banner.ctaText.toLowerCase().includes('quote') ? (
                    <button 
                      onClick={() => openQuoteModal()}
                      className="px-8 py-3.5 bg-tcf-red text-white hover:bg-tcf-gold hover:text-tcf-dark uppercase text-xs font-bold tracking-widest flex items-center gap-2 transition-all rounded shadow-premium hover:-translate-y-0.5 cursor-pointer"
                    >
                      {banner.ctaText} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link 
                      href={banner.ctaLink}
                      className="px-8 py-3.5 bg-tcf-red text-white hover:bg-tcf-gold hover:text-tcf-dark uppercase text-xs font-bold tracking-widest flex items-center gap-2 transition-all rounded shadow-premium hover:-translate-y-0.5"
                    >
                      {banner.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => openQuoteModal()}
                    className="px-8 py-3.5 border border-white text-white hover:bg-white hover:text-tcf-dark uppercase text-xs font-bold tracking-widest transition-colors rounded"
                  >
                    Bespoke Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-black/35 hover:bg-tcf-red text-white transition-colors duration-200 cursor-pointer hidden sm:block"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-black/35 hover:bg-tcf-red text-white transition-colors duration-200 cursor-pointer hidden sm:block"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2.5">
          {banners.map((_, i) => (
            <button 
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === activeBanner ? 'bg-tcf-gold w-6' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
