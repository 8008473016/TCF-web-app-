import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: "Showroom Gallery & Finished Designs | TCF Tenali",
  description: "Browse photographs of completed furniture projects, seasoned solid wood carvings, living rooms, and bedroom setups from Tenali Central Furniture.",
};

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
    console.error('Error reading settings in Gallery Page:', error);
    return {};
  }
};

export default async function GalleryPage() {
  const settings = await getSettings();

  // Fallback gallery images
  const defaultGallery = [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80', title: 'Teak Poster Bed setup', category: 'Bedroom' },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', title: 'Royal 3-Seater Velvet Sofa', category: 'Living' },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80', title: 'Solid Sheesham Dining table', category: 'Dining' },
    { id: 'g4', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80', title: 'Cane backrest poster details', category: 'Bedroom' },
    { id: 'g5', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80', title: 'Handcarved Coffee Table', category: 'Living' },
    { id: 'g6', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80', title: 'Teak wood library bookshelf', category: 'Study' }
  ];

  const galleryItems = settings?.gallery || defaultGallery;

  return (
    <div className="bg-tcf-light min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.25em]">Showroom Showcase</span>
          <h1 className="text-4xl font-serif font-black text-tcf-dark leading-tight">
            Design Gallery & Finished Spaces
          </h1>
          <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
            Explore photographs of custom setups, detailed hand carvings, and solid wood collections delivered to customer homes.
          </p>
          <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-6" />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item: any) => (
            <div 
              key={item.id}
              className="group bg-white border border-tcf-sand hover:shadow-luxury rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-tcf-light">
                <Image 
                  src={item.url} 
                  alt={item.title} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-5 border-t border-tcf-sand bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-tcf-red block mb-1">
                  {item.category}
                </span>
                <h3 className="font-serif font-bold text-tcf-dark text-base">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <section className="bg-white border border-tcf-sand rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-premium space-y-6">
          <h3 className="text-2xl font-serif font-bold text-tcf-dark">
            Do You Have a Custom Furniture Sketch?
          </h3>
          <p className="text-sm text-tcf-dark/70 max-w-xl mx-auto leading-relaxed font-light">
            We specialize in custom orders. Send us a blueprint, dimensions, or design photo, and our master craftspeople in Tenali will build it to your exact specifications.
          </p>
          <div className="pt-2">
            <Link 
              href="/custom-furniture"
              className="px-6 py-3 bg-tcf-red hover:bg-red-750 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer inline-block"
            >
              Start Bespoke Request
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
