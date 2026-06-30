import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HeroSlider } from '@/components/sections/HeroSlider';
import { ProductCard } from '@/components/ProductCard';
import { RotateCcw, Hammer, Sparkles, ArrowRight, Star, Plus, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: "TCF - Tenali Central Furniture | Premium Wooden Furniture Store",
  description: "Experience premium solid wood furniture handcrafted in Tenali, Andhra Pradesh. Beautiful designs, termite warranty, custom specifications.",
  keywords: ["Furniture Store", "Teak Wood Furniture", "Custom Furniture", "Tenali Central Furniture", "Vijayawada", "Guntur"],
};

const getData = async () => {
  try {
    const rawSettings = await db.read('settings');
    const settings: any = Array.isArray(rawSettings) ? {} : (rawSettings || {});
    
    // Parse settings if it was loaded as key-value rows
    if (Array.isArray(rawSettings)) {
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key;
        const val = item.Value || item.value;
        if (key) {
          try {
            settings[key] = JSON.parse(val);
          } catch {
            settings[key] = val;
          }
        }
      });
    }

    const products = await db.read('products');
    const categories = await db.read('categories');

    return {
      settings,
      products: Array.isArray(products) ? products : [],
      categories: Array.isArray(categories) ? categories : [],
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return { settings: {}, products: [], categories: [] };
  }
};

export default async function HomePage() {
  const { settings, products, categories } = await getData();

  const phone = settings?.contact?.phone || '+91 89195 46858';
  const email = settings?.contact?.email || 'tenalicentralfurnitures@gmail.com';
  const address = settings?.contact?.address || 'Opp R.C.M Chruch, Amaravathi yards,Chenchupet, Tenali,Andhra pradesh 522202';
  const hours = settings?.contact?.hours || '10:30 AM - 09:30 PM Daily';

  // Hero Banners
  const defaultBanners = [
    {
      id: "b1",
      image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80",
      title: "Bespoke Solid Teak Masterpieces",
      subtitle: "Handcrafted in Tenali, Built for Generations",
      ctaText: "Explore Collections",
      ctaLink: "/products"
    }
  ];
  const banners = settings?.banners || defaultBanners;

  // Filter out featured products and format them for ProductCard
  const featuredProducts = products
    .filter((p: any) => (p.featured === true || p['Featured'] === true || p['Featured'] === 'TRUE') && !(p.archived === true || p['Archived'] === true || p['Archived'] === 'TRUE'))
    .slice(0, 4)
    .map((p: any) => ({
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

  // Trust Badges
  const trustSignals = [
    {
      icon: <RotateCcw className="w-10 h-10 text-tcf-red" />,
      title: "Termite Warranty",
      desc: "Our solid wood is seasoned and chemically treated, ensuring excellent defense against wood-borers and termites."
    },
    {
      icon: <Hammer className="w-10 h-10 text-tcf-red" />,
      title: "100% Custom Tailored",
      desc: "Modify dimensions, wood selection, polishes, or fabrics directly to suit your home's unique layout."
    },
    {
      icon: <Sparkles className="w-10 h-10 text-tcf-red" />,
      title: "Direct From Factory",
      desc: "Eliminate middlemen markups. Experience premium luxury solid wood furniture at true manufacturing prices from Tenali."
    }
  ];

  // Testimonials
  const defaultTestimonials = [
    {
      id: "t1",
      name: "K. Rama Rao",
      rating: 5,
      quote: "The solid teak wood bed we ordered is absolutely royal. Hand carvings are so detailed and the finish is premium ivory teak. Extremely satisfied with TCF!",
      date: "2026-05-10"
    }
  ];
  const testimonials = settings?.testimonials || defaultTestimonials;

  // FAQs
  const defaultFaqs = [
    {
      id: "f1",
      question: "Do you offer a warranty against termites?",
      answer: "Yes, we provide a lifetime termite and wood-borer warranty on all our seasoned solid Teak and Sheesham wood products.",
      category: "Warranty"
    }
  ];
  const faqs = settings?.faqs || defaultFaqs;

  return (
    <div className="bg-tcf-light flex-1 flex flex-col font-sans space-y-16 pb-12 w-full">
      
      {/* Local Business JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FurnitureStore",
            "name": "Tenali Central Furniture (TCF)",
            "image": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
            "@id": "https://tenalicentralfurniture.com",
            "url": "https://tenalicentralfurniture.com",
            "telephone": phone,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Opp R.C.M Chruch, Amaravathi yards, Chenchupet",
              "addressLocality": "Tenali",
              "addressRegion": "Andhra Pradesh",
              "postalCode": "522202",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 16.2399363,
              "longitude": 80.6330377
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
              ],
              "opens": "10:30",
              "closes": "21:30"
            }
          })
        }}
      />

      {/* Hero Section */}
      <HeroSlider banners={banners} />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        <div className="text-center space-y-2">
          <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.2em]">Exquisite Designs</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark">Shop By Category</h2>
          <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat: any) => (
            <Link 
              key={cat.id || cat['Category ID']} 
              href={`/products?category=${cat.slug || cat['Slug']}`}
              className="group relative h-64 overflow-hidden border border-tcf-sand hover:shadow-premium bg-tcf-dark rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-tcf-dark/95 via-tcf-dark/30 to-transparent z-10" />
              <img 
                src={cat.banner || cat['Banner'] || "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"} 
                alt={cat.name || cat['Category Name']}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 z-20 text-center">
                <h3 className="font-serif font-bold text-base text-white group-hover:text-tcf-red transition-colors">
                  {cat.name || cat['Category Name']}
                </h3>
                <p className="text-[10px] text-white/70 tracking-wider uppercase mt-1.5 font-bold group-hover:text-white transition-colors flex items-center justify-center gap-1">
                  View Catalog <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Signature Bestsellers */}
      <section className="bg-white border-y border-tcf-sand/80 py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.2em]">Customer Favorites</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark">TCF Signature Bestsellers</h2>
              <div className="w-16 h-0.5 bg-tcf-red mt-4" />
            </div>
            <Link 
              href="/products"
              className="text-xs font-bold uppercase tracking-widest text-tcf-red hover:text-[#121110] flex items-center gap-1.5 transition-colors"
            >
              Browse All Masterpieces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-tcf-dark/50 font-serif">
                No featured products loaded yet. Check back soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom Furniture Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-tcf-dark text-white grid grid-cols-1 lg:grid-cols-2 border border-tcf-sand shadow-luxury rounded-3xl overflow-hidden">
          <div className="relative p-8 sm:p-16 flex flex-col justify-center space-y-6 overflow-hidden">
            <div className="relative z-10 flex flex-col space-y-6">
              <span className="text-tcf-gold text-xs font-bold uppercase tracking-[0.25em]">Bespoke Craftsmanship</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Can't Find The Perfect Match? Let Us Custom Build It.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                Send us your reference images, floor plans, or sketch notes. Our master artisans in Tenali will handcraft custom furniture matching your exact measurements, wood preferences, fabric materials, and polishes.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <Check className="w-4.5 h-4.5 text-tcf-gold stroke-[3]" />
                  <span>Upload sketches, floor plans & room photos</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <Check className="w-4.5 h-4.5 text-tcf-gold stroke-[3]" />
                  <span>Choose wood (Teak, Sheesham, Mango) & finishes</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <Check className="w-4.5 h-4.5 text-tcf-gold stroke-[3]" />
                  <span>Get a free price quotation and design support</span>
                </div>
              </div>
              <div className="pt-4">
                <Link 
                  href="/custom-furniture"
                  className="inline-flex px-8 py-3.5 bg-tcf-gold hover:bg-white text-tcf-dark hover:text-tcf-dark font-bold uppercase text-xs tracking-widest gap-2 rounded transition-all shadow-premium"
                >
                  Custom Design Request <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[350px] lg:min-h-full">
            <Image 
              src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80" 
              alt="Artisan woodcarving"
              fill
              sizes="(max-w-7xl) 50vw, 100vw"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-zinc-50 border-y border-tcf-sand/80 py-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {trustSignals.map((signal, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white border border-tcf-sand hover:shadow-premium rounded-xl transition-all duration-300"
              >
                <div className="p-4 bg-tcf-light rounded-full mb-4">
                  {signal.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-tcf-dark mb-2">
                  {signal.title}
                </h3>
                <p className="text-xs text-tcf-dark/70 leading-relaxed font-light">
                  {signal.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Showroom Contact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 w-full pt-6">
        <div className="space-y-6 flex flex-col justify-center bg-white border border-tcf-sand p-8 rounded-3xl shadow-premium">
          <div>
            <span className="text-tcf-red text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">Visit Our Showroom</span>
            <h2 className="text-2xl font-serif font-bold text-tcf-dark">TCF Experience Center</h2>
            <div className="w-10 h-0.5 bg-tcf-red mt-3" />
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-tcf-dark/80">
            <div className="flex gap-3">
              <span className="font-bold text-tcf-red">📍</span>
              <p>{address}</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-tcf-red">📞</span>
              <p>{phone}</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-tcf-red">✉️</span>
              <p>{email}</p>
            </div>
            <div className="flex gap-3 border-t border-tcf-sand/60 pt-4">
              <span className="font-bold text-tcf-red">🕒</span>
              <div>
                <span className="font-bold block">Opening Hours</span>
                <span className="text-[11px] text-tcf-dark/60">Open Everyday: {hours}</span>
              </div>
            </div>
          </div>

          <a 
            href="https://www.google.com/maps/place/TENALI+CENTRAL+FURNITURES/@16.2399363,80.6304628,17z/data=!3m1!4b1!4m6!3m5!1s0x3a4a0759417d3cf9:0x34b835ae6719448e!8m2!3d16.2399312!4d80.6330377!16s%2Fg%2F11jzp7rdkz"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-3 bg-[#121110] hover:bg-[#DE2943] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-premium"
          >
            Get Directions On Map
          </a>
        </div>

        {/* Map Iframe */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-tcf-sand h-[350px] lg:h-auto min-h-[350px] relative shadow-premium">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.497551787265!2d80.6304628!3d16.2399363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a0759417d3cf9%3A0x34b835ae6719448e!2sTENALI+CENTRAL+FURNITURES!5e0!3m2!1sen!2sin!4v1719580000000!5m2!1sen!2sin"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
            title="TCF Furniture Showroom Map"
          />
        </div>
      </section>

      {/* Testimonials Review Section */}
      <section className="relative py-20 overflow-hidden bg-zinc-50 border-t border-tcf-sand w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10 w-full">
          <div className="text-center space-y-2">
            <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.2em]">Verified Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark">What Our Patrons Say</h2>
            <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test: any, index: number) => (
              <div 
                key={index}
                className="bg-white border border-tcf-sand p-8 flex flex-col justify-between hover:shadow-premium transition-all duration-300 rounded-2xl"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-tcf-gold text-tcf-gold" />
                    ))}
                  </div>
                  <p className="text-xs italic text-tcf-dark/80 font-light leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>
                <div className="pt-6 border-t border-tcf-sand/60 mt-6 flex justify-between items-center">
                  <span className="font-serif font-bold text-tcf-dark text-xs">{test.name}</span>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-tcf-red bg-tcf-light px-2.5 py-1 rounded-md">
                    Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full py-6">
        <div className="text-center space-y-2">
          <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.2em]">Got Questions?</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark">Frequently Asked Questions</h2>
          <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-4" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <div 
              key={index}
              className="bg-white border border-tcf-sand p-6 rounded-2xl shadow-sm"
            >
              <h3 className="font-serif font-bold text-sm text-tcf-dark mb-2">
                Q: {faq.question}
              </h3>
              <p className="text-xs text-tcf-dark/70 leading-relaxed font-light">
                A: {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}