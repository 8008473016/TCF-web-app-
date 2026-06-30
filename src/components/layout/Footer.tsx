'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { useProductStore } from '@/hooks/useProductStore';

export const Footer: React.FC = () => {
  const { settings } = useProductStore();

  const businessHours = settings?.contact?.hours || '09:00 AM - 09:00 PM Daily';
  const contactAddress = settings?.contact?.address || 'Opp R.C.M Chruch, Amaravathi yards,Chenchupet, Tenali,Andhra pradesh 522202';
  const contactPhone = settings?.contact?.phone || '+91 98765 43210';
  const contactEmail = settings?.contact?.email || 'contact@tenalicentralfurniture.com';

  return (
    <footer className="bg-zinc-100 border-t border-tcf-sand/80 text-tcf-dark/80 pt-16 pb-8 font-sans mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-tcf-sand/80 pb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="TCF Logo" className="h-10 w-auto object-contain rounded border border-tcf-sand p-0.5 bg-white" />
            <h2 className="text-2xl font-serif font-black tracking-wider text-tcf-red">TCF</h2>
          </div>
          <p className="text-[10px] text-tcf-dark/50 tracking-wider uppercase font-semibold">Tenali Central Furniture</p>
          <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
            Crafting luxury solid wood furniture in Tenali, Andhra Pradesh. Shaping heirloom masterpieces for your dream home.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-tcf-red font-medium">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Termite Warranty</span>
          </div>
        </div>

        {/* Showroom Details & Hours */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tcf-dark">Our Showroom</h3>
          <div className="space-y-3 text-sm text-tcf-dark/75 font-light">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-tcf-red flex-shrink-0 mt-0.5" />
              <span>{contactAddress}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-tcf-red flex-shrink-0" />
              <span>{contactPhone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-tcf-red flex-shrink-0" />
              <span className="truncate">{contactEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 border-t border-tcf-sand/60 pt-3">
              <Clock className="w-4 h-4 text-tcf-red flex-shrink-0" />
              <span className="font-semibold text-xs text-tcf-dark">Hours: {businessHours}</span>
            </div>
          </div>
        </div>

        {/* Useful & Legal Links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-tcf-dark">Explore</h3>
            <ul className="space-y-2 text-sm text-tcf-dark/70 font-light">
              <li>
                <Link href="/products" className="hover:text-tcf-red transition-colors">Catalog</Link>
              </li>
              <li>
                <Link href="/custom-furniture" className="hover:text-tcf-red transition-colors">Custom Designs</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-tcf-red transition-colors">Gallery</Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-tcf-red transition-colors">Blogs</Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-tcf-dark">Legal</h3>
            <ul className="space-y-2 text-sm text-tcf-dark/70 font-light">
              <li>
                <Link href="/privacy-policy" className="hover:text-tcf-red transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-tcf-red transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-tcf-red transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-tcf-red transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-tcf-dark/50 font-light">
        <p>© 2026 Tenali Central Furniture (TCF). All Rights Reserved.</p>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-tcf-red" /> ISO 9001:2015 Certified</span>
          <span>|</span>
          <span>Proudly Handcrafted in India</span>
        </div>
      </div>
    </footer>
  );
};
