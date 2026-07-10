'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { useProductStore } from '@/hooks/useProductStore';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { settings } = useProductStore();

  const businessHours = settings?.contact?.hours || '10:00 AM - 09:00 PM Daily';
  const contactAddress = settings?.contact?.address || 'Opp R.C.M Chruch, Amaravathi yards,Chenchupet, Tenali,Andhra pradesh 522202';
  const contactPhone = settings?.contact?.phone || '+91 89195 46858';
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
          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-tcf-red font-medium">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Termite Warranty</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://www.facebook.com/profile.php?id=61587914172829" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-200 hover:bg-[#DE2943] hover:text-white rounded-full transition-all text-tcf-dark flex items-center justify-center"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/tenali_centralfurnitures/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-200 hover:bg-[#DE2943] hover:text-white rounded-full transition-all text-tcf-dark flex items-center justify-center"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.youtube.com/@TENALICENTRALFURNITURES" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-200 hover:bg-[#DE2943] hover:text-white rounded-full transition-all text-tcf-dark flex items-center justify-center"
                title="Youtube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/918919546858" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-zinc-200 hover:bg-[#DE2943] hover:text-white rounded-full transition-all text-tcf-dark flex items-center justify-center"
                title="WhatsApp"
              >
                <WhatsappIcon className="w-4 h-4" />
              </a>
            </div>
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
                <Link href="/reels" className="hover:text-tcf-red transition-colors">Reels</Link>
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
                <Link href="/warranty" className="hover:text-tcf-red transition-colors">Warranty Policy</Link>
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
