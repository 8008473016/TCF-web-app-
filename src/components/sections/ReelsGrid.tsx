'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Play } from 'lucide-react';

export const InstagramIcon = ({ className }: { className?: string }) => (
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
  limit?: number;
  parallax?: boolean;
}

export const ReelsGrid: React.FC<ReelsGridProps> = ({ reels, isHero = false, limit = 15, parallax = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll offset based on elements relative position in viewport
      const offset = (rect.top + rect.height / 2 - viewportHeight / 2) * -0.25;
      setTranslateY(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [parallax]);

  // If parallax mode is ON, we show exactly 5 reels on the screen at a time
  const slotCount = isHero ? 5 : (parallax ? 5 : Math.min(limit, reels.length));
  const [slots, setSlots] = useState<ReelItem[]>([]);

  useEffect(() => {
    if (reels.length > 0) {
      setSlots(reels.slice(0, slotCount));
    }
  }, [reels, slotCount]);

  // Cycle a random slot every 3s (bottom) or 6s (hero)
  useEffect(() => {
    if (reels.length <= slotCount) return;

    const intervalDuration = isHero ? 6000 : 3000;

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
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [slots, reels, slotCount, isHero]);

  if (reels.length === 0) return null;

  if (isHero) {
    return (
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-full w-full bg-black">
        {slots.map((reel, idx) => (
          <ReelSlot key={idx} reel={reel} isHero={true} />
        ))}
      </div>
    );
  }

  // Parallax Mode: Smooth scroll-driven translation grid (fills parent with extra height to prevent gaps)
  if (parallax) {
    return (
      <div 
        ref={containerRef}
        className="absolute inset-x-0 w-full z-0 transition-transform duration-75 ease-out"
        style={{ 
          top: '-30%', 
          height: '160%',
          transform: `translateY(${translateY}px)`
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 bg-black h-full w-full">
          {slots.map((reel, idx) => (
            <ReelSlot key={idx} reel={reel} isHero={false} />
          ))}
        </div>
      </div>
    );
  }

  // Normal Grid Mode
  return (
    <section className="relative w-full bg-black z-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full gap-0">
        {slots.map((reel, idx) => (
          <ReelSlot key={idx} reel={reel} isHero={false} />
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
const ReelSlot: React.FC<{ reel: ReelItem; isHero: boolean }> = ({ reel, isHero }) => {
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
      className={`relative block w-full overflow-hidden cursor-pointer group ${isHero ? 'h-full' : 'aspect-square'}`}
    >
      <video
        src={currentReel.videoUrl + '#t=2'}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-[#DE2943]/0 hover:bg-[#DE2943]/15 transition-colors duration-300 flex items-center justify-center">
        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" />
      </div>
    </a>
  );
};
