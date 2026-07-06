import React from 'react';
import { Instagram } from 'lucide-react';

export const metadata = {
  title: 'Our Reels | Tenali Central Furniture',
  description: 'Watch our latest furniture design reels on Instagram.',
};

export default function ReelsPage() {
  return (
    <div className="bg-[#F5F2EB] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-16">
          <span className="text-[#DE2943] text-xs font-bold uppercase tracking-[0.2em]">Social Media</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#121110]">Our Instagram Reels</h1>
          <div className="w-16 h-0.5 bg-[#DE2943] mx-auto mt-4" />
          <p className="text-[#121110]/70 max-w-2xl mx-auto pt-4 font-light">
            Follow our journey and discover our latest handcrafted wooden furniture designs directly from our workshop.
          </p>
          
          <div className="pt-6">
            <a 
              href="https://www.instagram.com/tenali_centralfurnitures/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity shadow-premium"
            >
              <Instagram className="w-5 h-5" />
              Follow @tenali_centralfurnitures
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          
          {/* Reel 2 */}
          <div className="bg-white rounded-2xl p-4 shadow-luxury border border-[#E6E2D6] w-full max-w-[400px]">
            <iframe 
              src="https://www.instagram.com/p/DYuNXCnB-1J/embed" 
              width="100%" 
              height="550" 
              frameBorder="0" 
              scrolling="no" 
              allowTransparency
              className="rounded-xl w-full"
            />
          </div>

          {/* Reel 3 */}
          <div className="bg-white rounded-2xl p-4 shadow-luxury border border-[#E6E2D6] w-full max-w-[400px]">
            <iframe 
              src="https://www.instagram.com/p/DYhfy-SBr6y/embed" 
              width="100%" 
              height="550" 
              frameBorder="0" 
              scrolling="no" 
              allowTransparency
              className="rounded-xl w-full"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
