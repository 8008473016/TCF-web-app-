'use client';
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface ReelItem {
  id: string;
  videoUrl: string;
  instagramUrl?: string;
}

interface ReelsGridProps {
  reels: ReelItem[];
  isHero?: boolean;
}

export const ReelsGrid: React.FC<ReelsGridProps> = ({ reels, isHero = false }) => {
  const slotCount = Math.min(5, reels.length);
  const [slots, setSlots] = useState<ReelItem[]>([]);

  useEffect(() => {
    if (reels.length > 0) {
      setSlots(reels.slice(0, slotCount));
    }
  }, [reels, slotCount]);

  // Cycle a random slot every 6 seconds
  useEffect(() => {
    if (reels.length <= slotCount) return;

    const interval = setInterval(() => {
      const randomSlotIndex = Math.floor(Math.random() * slotCount);
      const visibleIds = slots.map(s => s.id);
      const pool = reels.filter(r => !visibleIds.includes(r.id));
      
      if (pool.length > 0) {
        const nextReel = pool[Math.floor(Math.random() * pool.length)];
        setSlots(prev => {
          const next = [...prev];
          next[randomSlotIndex] = nextReel;
          return next;
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [slots, reels, slotCount]);

  if (reels.length === 0) return null;

  // For mobile/tablet we use grid-cols-2 or grid-cols-3, on desktop grid-cols-5. 
  // All elements are zero gap.
  return (
    <section className={`relative w-full overflow-hidden ${isHero ? 'h-[60vh] sm:h-[85vh]' : 'h-[300px] sm:h-[450px]'} bg-black`}>
      {/* Zero Gap Side-by-Side Video Grid */}
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-full w-full">
        {slots.map((reel, idx) => (
          <ReelSlot key={idx} reel={reel} />
        ))}
      </div>

      {/* Black Shade Overlay */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none z-10" />

      {/* Centered Instagram Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none px-4">
        <div className="p-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-full mb-3 animate-pulse">
          <InstagramIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-white text-xl sm:text-2xl font-serif font-black tracking-wider uppercase drop-shadow-md">
          Check Our Latest Reels
        </h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1.5 drop-shadow-sm font-medium">
          Follow us on Instagram{' '}
          <a 
            href="https://www.instagram.com/tenali_centralfurnitures/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-[#DE2943] pointer-events-auto transition-colors font-bold"
          >
            @tenali_centralfurnitures
          </a>
        </p>
      </div>
    </section>
  );
};

// Sub-component to manage individual slot state for smooth fade transitions
const ReelSlot: React.FC<{ reel: ReelItem }> = ({ reel }) => {
  const [currentReel, setCurrentReel] = useState<ReelItem>(reel);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (reel.id !== currentReel.id) {
      setFade(false);
      const timeout = setTimeout(() => {
        setCurrentReel(reel);
        setFade(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [reel, currentReel]);

  return (
    <a
      href={currentReel.instagramUrl || "https://www.instagram.com/tenali_centralfurnitures/"}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full h-full overflow-hidden cursor-pointer group"
    >
      <video
        src={currentReel.videoUrl + '#t=2'}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Subtle hover effect */}
      <div className="absolute inset-0 bg-[#DE2943]/0 hover:bg-[#DE2943]/15 transition-colors duration-300 flex items-center justify-center">
        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" />
      </div>
    </a>
  );
};
