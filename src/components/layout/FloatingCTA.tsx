'use client';

import React from 'react';
import { Phone, MessageCircle, FileSpreadsheet } from 'lucide-react';
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

export const FloatingCTA: React.FC = () => {
  const { settings } = useProductStore();

  const phone = settings?.contact?.phone || '+91 98765 43210';
  const whatsapp = settings?.contact?.whatsapp || '919876543210';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    "Hi TCF! I am visiting your website and would like to inquire about your solid wood furniture collections."
  )}`;

  return (
    <>
      {/* Desktop Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-luxury hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        aria-label="Contact TCF on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6" />
        
        {/* Hover Label */}
        <span className="absolute right-16 scale-0 origin-right bg-zinc-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-lg group-hover:scale-100 transition-all duration-200 whitespace-nowrap">
          WhatsApp Inquiry
        </span>
      </a>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around bg-white/90 backdrop-blur-md border-t border-tcf-sand shadow-[0_-5px_15px_rgba(0,0,0,0.1)] py-2.5 px-4">
        {/* Call Now */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex flex-col items-center gap-1 text-tcf-dark hover:text-tcf-red transition-colors flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-tcf-light flex items-center justify-center text-tcf-red">
            <Phone className="w-5 h-5 fill-current/10" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Call Now</span>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-tcf-dark hover:text-green-500 transition-colors flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
        </a>

        {/* Get Quote */}
        <button
          onClick={() => openQuoteModal()}
          className="flex flex-col items-center gap-1 text-tcf-dark hover:text-tcf-red transition-colors flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-tcf-red flex items-center justify-center text-white shadow-premium">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-tcf-red font-extrabold">Get Quote</span>
        </button>
      </div>
    </>
  );
};
