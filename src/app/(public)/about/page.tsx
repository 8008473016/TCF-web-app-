import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { db } from '@/lib/db';
import { ShieldCheck, Award, Heart, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Our Craftsmanship | TCF Tenali",
  description: "Learn about Tenali Central Furniture (TCF), our 30-year legacy of crafting seasoned Teak and Sheesham wood masterpieces, and our dedicated artisans.",
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
    console.error('Error reading settings in About Page:', error);
    return {};
  }
};

export default async function AboutPage() {
  const settings = await getSettings();
  const address = settings?.contact?.address || 'Opp R.C.M Chruch, Amaravathi yards,Chenchupet, Tenali,Andhra pradesh 522202';

  return (
    <div className="bg-tcf-light min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.25em]">Our Legacy</span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-tcf-dark leading-tight">
            Handcrafting Premium Solid Wood Masterpieces
          </h1>
          <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
            For over three decades, Tenali Central Furniture (TCF) has stood as a hallmark of premium luxury, bespoke customization, and seasoned timber durability.
          </p>
          <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-6" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 sm:h-[450px] overflow-hidden rounded-2xl border border-tcf-sand shadow-luxury">
            <Image 
              src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80" 
              alt="Artisan furniture showroom carving" 
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-tcf-dark">
              Seasoned Wood. Masterful Carving. Built to Last.
            </h2>
            <p className="text-sm text-tcf-dark/75 leading-relaxed font-light">
              At TCF, we believe furniture shouldn't just occupy space—it should tell a story. Every piece is handcrafted by local generational woodcarvers in Tenali using seasoned Grade-A Teak wood and premium Sheesham wood.
            </p>
            <p className="text-sm text-tcf-dark/75 leading-relaxed font-light">
              Unlike commercial plywood and veneer furniture that deteriorates within years, our solid wood items undergo a strict seasoning and chemical treatment process, rendering them exceptionally defensive against moisture, wood-borers, and termites.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-tcf-sand/60">
              <div className="flex gap-3">
                <ShieldCheck className="w-6 h-6 text-tcf-red flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tcf-dark">Termite Shield</h4>
                  <p className="text-[11px] text-tcf-dark/60 mt-0.5">Backed by our seasoned wood warranty.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Award className="w-6 h-6 text-tcf-red flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tcf-dark">Premium Grade-A</h4>
                  <p className="text-[11px] text-tcf-dark/60 mt-0.5">100% seasoned solid timber wood selection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Blocks */}
        <section className="bg-white border border-tcf-sand/80 rounded-3xl p-8 sm:p-12 shadow-premium grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 bg-tcf-red/10 text-tcf-red rounded-full flex items-center justify-center mx-auto md:mx-0">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-tcf-dark">Crafted with Love</h3>
            <p className="text-xs text-tcf-dark/70 leading-relaxed font-light">
              Our designs are carefully tailored to reflect classic Indian heritage while integrating clean modern Scandinavian profiles.
            </p>
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 bg-tcf-red/10 text-tcf-red rounded-full flex items-center justify-center mx-auto md:mx-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-tcf-dark">100% Customization</h3>
            <p className="text-xs text-tcf-dark/70 leading-relaxed font-light">
              From size parameters and wood staining options to velvet upholstery adjustments, we build to fit your home's exact layout.
            </p>
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 bg-tcf-red/10 text-tcf-red rounded-full flex items-center justify-center mx-auto md:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-tcf-dark">Direct From Factory</h3>
            <p className="text-xs text-tcf-dark/70 leading-relaxed font-light">
              We cut middleman markups. Discover premium showroom quality pieces at true factory manufacturing prices.
            </p>
          </div>
        </section>

        {/* Showroom Visit Invitation */}
        <div className="bg-tcf-dark text-white rounded-3xl p-8 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-luxury">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="text-tcf-gold text-xs font-bold uppercase tracking-[0.25em]">Visit Our Showroom</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              Experience the Touch & Feel of Premium Timber
            </h2>
            <p className="text-sm text-white/70 leading-relaxed font-light">
              Nothing compares to experiencing the weight and texture of genuine handcrafted teak wood in person. Visit our physical showroom yard in Chenchupet, Tenali to browse our catalogs.
            </p>
            <p className="text-xs text-tcf-gold font-mono font-semibold">
              Location: {address}
            </p>
            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <a 
                href="/contact" 
                className="px-6 py-3 bg-tcf-red hover:bg-red-750 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer"
              >
                Get Directions
              </a>
              <a 
                href="/products" 
                className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer"
              >
                Browse Catalog
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
