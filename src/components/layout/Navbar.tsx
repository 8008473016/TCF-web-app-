'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Phone, MessageSquare, ArrowRight, ChevronDown } from 'lucide-react';
import { useProductStore } from '@/hooks/useProductStore';
import { openQuoteModal } from './QuoteRequestDialog';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.031 2C6.446 2 1.92 6.528 1.92 12.112c0 1.785.463 3.528 1.343 5.064L1.9 22l5.008-1.313a10.074 10.074 0 0 0 5.122 1.385h.005c5.584 0 10.11-4.527 10.11-10.112.002-2.705-1.047-5.247-2.952-7.153C17.279 2.902 14.736 2 12.03 2zm5.772 13.918c-.292.822-1.468 1.488-2.022 1.57-.497.073-1.144.13-3.327-.775-2.79-1.157-4.588-4.004-4.728-4.189-.139-.186-1.127-1.498-1.127-2.859 0-1.36.709-2.027.962-2.302.253-.275.552-.343.738-.343.187 0 .375.001.539.009.171.008.4.03.627.52.235.508.802 1.956.87 2.096.068.14.113.303.02.489-.092.186-.139.3-.275.457-.137.158-.288.353-.41.474-.136.136-.279.285-.12.56.16.273.711 1.173 1.523 1.895.807.72 1.484.943 1.764 1.083.28.14.444.116.609-.074.165-.19.709-.824.9-.112.19.712.392 1.178.672 1.32.28.14.56.07.747-.074.187-.144 1.764-2.057 2.057-2.756.292-.7 0-1.272-.14-1.55-.14-.28-.56-.445-1.173-.746z"/>
  </svg>
);

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const { categories, settings, fetchCategories, fetchSettings } = useProductStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, [fetchCategories, fetchSettings]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const contactPhone = settings?.contact?.phone || '+91 98765 43210';
  const whatsappLink = settings?.contact?.whatsapp || 'https://wa.me/919876543210';

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Furniture', path: '/products' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="w-full relative z-40">
      {/* Sticky Main Header */}
      <header className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-tcf-sand/80 shadow-premium transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Elegant Serif Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="TCF Logo" 
                  className="h-12 w-auto object-contain rounded border border-tcf-sand p-0.5" 
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-black tracking-wider text-tcf-red leading-none">TCF</span>
                  <span className="text-[8px] font-sans font-bold uppercase tracking-[0.2em] text-tcf-dark/70 mt-1">Tenali Central Furniture</span>
                </div>
              </Link>
            </div>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex space-x-8 items-center">
              {/* Home */}
              <Link 
                href="/" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname === '/' 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                Home
              </Link>

              {/* Categories Sub-Dropdown */}
              <div className="relative group">
                <span className="text-xs font-bold uppercase tracking-wider text-tcf-dark/80 hover:text-tcf-red transition-all duration-200 flex items-center gap-0.5 cursor-pointer py-1">
                  Categories <ChevronDown className="w-3.5 h-3.5" />
                </span>
                <div className="absolute left-0 mt-2 w-64 bg-white border border-tcf-sand shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-1 p-2 rounded-xl">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/products?category=${cat.slug}`}
                      className="px-4 py-2.5 text-xs hover:bg-tcf-light text-tcf-dark/80 hover:text-tcf-red font-medium rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Furniture */}
              <Link 
                href="/products" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname.startsWith('/products') 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                Furniture
              </Link>

              {/* Gallery */}
              <Link 
                href="/gallery" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname.startsWith('/gallery') 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                Gallery
              </Link>

              {/* Blogs */}
              <Link 
                href="/blogs" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname.startsWith('/blogs') 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                Blogs
              </Link>

              {/* About */}
              <Link 
                href="/about" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname.startsWith('/about') 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                About
              </Link>

              {/* Contact */}
              <Link 
                href="/contact" 
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 py-1 border-b-2 ${
                  pathname.startsWith('/contact') 
                    ? 'text-tcf-red border-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red border-transparent'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* CTA Highlights Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-tcf-dark/70 hover:text-tcf-red transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Get Quote trigger */}
              <button
                onClick={() => openQuoteModal()}
                className="px-4 py-2 border border-tcf-red text-tcf-red hover:bg-tcf-red hover:text-white transition-all text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Get Quote
              </button>

              {/* Highlighted WhatsApp */}
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
              </a>

              {/* Highlighted Call Now */}
              <a 
                href={`tel:${contactPhone}`}
                className="px-4 py-2 bg-tcf-red text-white hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md shadow-tcf-red/10 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> Call Now
              </a>
            </div>

            {/* Mobile Actions and Hamburger Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-tcf-dark/70 hover:text-tcf-red transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-tcf-dark/70 hover:text-tcf-red transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Search Box */}
        {isSearchOpen && (
          <div className="border-t border-tcf-sand/80 bg-white py-4 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
              <input 
                type="text" 
                placeholder="Search premium teak wood beds, sofas, tables..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-2.5 border border-tcf-sand bg-tcf-light text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark"
              />
              <button 
                type="submit"
                className="px-6 py-2.5 bg-tcf-red text-white hover:bg-red-700 transition-colors text-sm font-semibold rounded-lg cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu panel drawer */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-tcf-sand bg-white py-6 px-6 space-y-4 shadow-luxury animate-in fade-in slide-in-from-top duration-300">
            {menuItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path} 
                className={`block text-sm font-bold uppercase tracking-wider ${
                  (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path))
                    ? 'text-tcf-red' 
                    : 'text-tcf-dark/80 hover:text-tcf-red'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-b border-tcf-sand/60 my-4" />
            
            <span className="block text-xs font-bold uppercase tracking-wider text-tcf-dark/50">
              Browse Categories
            </span>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {categories.slice(0, 6).map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.slug}`}
                  className="block text-xs font-medium text-tcf-dark/70 hover:text-tcf-red py-1"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="border-b border-tcf-sand/60 my-4" />
            <div className="flex flex-col gap-3 pt-2">
              <a 
                href={`tel:${contactPhone}`}
                className="w-full py-2.5 bg-tcf-red text-white text-center text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> Call Showroom
              </a>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 text-white text-center text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp Inquiry
              </a>
              <button
                onClick={() => openQuoteModal()}
                className="w-full py-2.5 border border-tcf-sand hover:bg-tcf-light text-tcf-dark text-center text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Request Custom Quote
              </button>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
};
