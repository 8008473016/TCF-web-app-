'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, MessageSquare, Phone } from 'lucide-react';
import { openQuoteModal } from '@/components/layout/QuoteRequestDialog';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  bannerImage: string;
  tags: string[];
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  material: string;
}

interface BlogArticleClientProps {
  blog: Blog;
  relatedProducts: Product[];
  settings: any;
}

export const BlogArticleClient: React.FC<BlogArticleClientProps> = ({
  blog,
  relatedProducts,
  settings
}) => {
  // Parse headings and inject IDs for Table of Contents
  const { headings, contentWithIds } = useMemo(() => {
    const headingRegex = /<h([23])>(.*?)<\/h\1>/g;
    const extractedHeadings: { level: number; text: string; id: string }[] = [];
    let match;
    
    // Extract headings
    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      extractedHeadings.push({ level, text, id });
    }

    // Replace original headings in content with headings containing IDs
    let parsedContent = blog.content;
    extractedHeadings.forEach(heading => {
      const originalHeading = `<h${heading.level}>${heading.text}</h${heading.level}>`;
      const replacedHeading = `<h${heading.level} id="${heading.id}" class="scroll-mt-24 font-serif font-bold text-tcf-dark mt-8 mb-4 ${
        heading.level === 2 ? 'text-2xl border-b border-tcf-sand pb-2' : 'text-xl'
      }">${heading.text}</h${heading.level}>`;
      parsedContent = parsedContent.replace(originalHeading, replacedHeading);
    });

    return { headings: extractedHeadings, contentWithIds: parsedContent };
  }, [blog.content]);

  const phone = settings?.contact?.phone || '+91 98765 43210';
  const whatsapp = settings?.contact?.whatsapp || '919876543210';

  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi TCF! I read your article "${blog.title}" and would like some advice on custom wooden furniture.`
  )}`;

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update hash in URL
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8">
      {/* Back button */}
      <Link 
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tcf-red hover:text-red-750 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Journal Feed
      </Link>

      {/* Hero Banner Image */}
      <div className="relative h-[250px] sm:h-[400px] border border-tcf-sand rounded-2xl overflow-hidden shadow-luxury">
        <Image 
          src={blog.bannerImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80'} 
          alt={blog.title} 
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tcf-dark/70 via-tcf-dark/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* Main Content Layout */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Article Header info */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-tcf-dark/70 border-y border-tcf-sand py-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-tcf-red" /> {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-tcf-red" /> By {blog.author}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 bg-tcf-light border border-tcf-sand rounded-full text-[10px] font-semibold text-tcf-dark/70">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* HTML blog text display */}
          <div 
            className="prose max-w-none text-sm sm:text-base text-tcf-dark/90 leading-relaxed font-light font-sans space-y-5 pt-2"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

        </div>

        {/* Sidebars */}
        <aside className="space-y-8 lg:sticky lg:top-24">
          
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="bg-white border border-tcf-sand p-6 shadow-premium rounded-2xl">
              <h3 className="font-serif font-bold text-sm text-tcf-dark border-b border-tcf-sand pb-2 mb-3">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {headings.map((heading, i) => (
                  <a
                    key={i}
                    href={`#${heading.id}`}
                    onClick={(e) => handleSmoothScroll(e, heading.id)}
                    className={`block text-xs text-tcf-dark/75 hover:text-tcf-red transition-colors font-medium ${
                      heading.level === 3 ? 'pl-4 text-tcf-dark/50' : ''
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Featured items recommendations */}
          {relatedProducts.length > 0 && (
            <div className="bg-white border border-tcf-sand p-6 shadow-premium rounded-2xl space-y-4">
              <h3 className="font-serif font-bold text-sm text-tcf-dark border-b border-tcf-sand pb-2">
                Recommended Collections
              </h3>
              <div className="space-y-4">
                {relatedProducts.map(p => (
                  <div key={p.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 relative overflow-hidden rounded bg-tcf-light flex-shrink-0">
                      <Image 
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'} 
                        alt={p.name} 
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${p.slug}`} className="font-serif font-bold text-xs text-tcf-dark hover:text-tcf-red line-clamp-1 block">
                        {p.name}
                      </Link>
                      <span className="text-[10px] text-tcf-dark/50 font-semibold block">{p.material}</span>
                      <span className="text-xs font-bold text-tcf-red font-mono">₹{(p.salePrice || p.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Lead Capture Sidebar Block */}
          <div className="bg-tcf-dark text-white border border-white/5 p-6 shadow-luxury rounded-2xl space-y-4 relative overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.06] bg-repeat bg-center wood-overlay" 
              style={{ backgroundSize: '150px' }} 
            />
            <div className="relative z-10 space-y-4">
              <h3 className="font-serif font-bold text-base text-tcf-gold">Bespoke Consultations</h3>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Thinking of custom solid wood furniture? Get direct design help and price quotations.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => openQuoteModal()}
                  className="w-full py-2 bg-tcf-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Get Custom Quote
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp Design Help
                </a>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
