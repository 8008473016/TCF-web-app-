import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const metadata: Metadata = {
  title: 'Our Reels | Tenali Central Furniture',
  description: 'Watch our latest furniture design reels on Instagram.',
};

// Helper to get parsed settings
const getSettings = async () => {
  try {
    const rawSettings = await db.read('settings');
    if (Array.isArray(rawSettings)) {
      const settingsObj: any = {};
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key || item.setting_key;
        const val = item.Value || item.value || item.setting_value;
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
    console.error('Error reading settings in Reels Page:', error);
    return {};
  }
};

export default async function ReelsPage() {
  const settings = await getSettings();
  const reels = settings?.reels || [];

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
              <InstagramIcon className="w-5 h-5" />
              Follow @tenali_centralfurnitures
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {reels.map((reel: any, idx: number) => {
            let shortcode = '';
            if (reel.instagramUrl) {
              const matches = reel.instagramUrl.match(/(?:p|reel)\/([A-Za-z0-9_-]+)/);
              if (matches && matches[1]) {
                shortcode = matches[1];
              }
            }

            return (
              <div key={reel.id || idx} className="bg-white rounded-2xl p-4 shadow-luxury border border-[#E6E2D6] w-full max-w-[400px] flex flex-col justify-between">
                {shortcode ? (
                  <div className="w-full aspect-[9/16] max-h-[550px] overflow-hidden rounded-xl">
                    <iframe 
                      src={`https://www.instagram.com/p/${shortcode}/embed`} 
                      width="100%" 
                      height="550" 
                      frameBorder="0" 
                      scrolling="no" 
                      allowTransparency
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] w-full flex items-center justify-center">
                    <video 
                      src={reel.videoUrl} 
                      controls 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {reel.instagramUrl && (
                  <div className="mt-4 pt-3 border-t border-[#E6E2D6] flex justify-end">
                    <a 
                      href={reel.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#DE2943] hover:underline flex items-center gap-1"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" /> View on Instagram
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {reels.length === 0 && (
            <p className="text-[#121110]/50 text-sm font-light text-center py-12">
              No reels added yet. Check back soon for video updates!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
