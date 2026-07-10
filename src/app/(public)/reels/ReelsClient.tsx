'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, X, MessageSquare, ExternalLink, Sparkles, Send } from 'lucide-react';
import { openQuoteModal } from '@/components/layout/QuoteRequestDialog';

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
  title?: string;
  description?: string;
}

export const ReelsClient: React.FC<{ reels: ReelItem[] }> = ({ reels }) => {
  const [selectedReel, setSelectedReel] = useState<ReelItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Extract shortcode helper
  const getShortcode = (url?: string) => {
    if (!url) return '';
    const matches = url.match(/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    return matches && matches[1] ? matches[1] : '';
  };

  return (
    <div className="bg-[#0b0a09] text-zinc-100 min-h-screen py-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#DE2943]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#DFBA73]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#DFBA73]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFBA73]">TCF Showroom Journey</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-tight">
            Our Showcase <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE2943] via-[#DFBA73] to-[#DE2943]">Reels</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Take a virtual tour through our workshop. Watch our master artisans craft solid wood masterpieces and see real product walkthroughs.
          </p>
          <div className="pt-6">
            <a 
              href="https://www.instagram.com/tenali_centralfurnitures/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#8a3ab9] via-[#e95950] to-[#fccc63] text-white font-bold uppercase text-xs tracking-wider hover:opacity-95 hover:scale-[1.02] transition-all shadow-lg shadow-pink-500/10"
            >
              <InstagramIcon className="w-4 h-4" />
              Follow Our Instagram
            </a>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {reels.map((reel, index) => (
            <ReelCard 
              key={reel.id || index} 
              reel={reel} 
              onClick={() => setSelectedReel(reel)} 
            />
          ))}

          {reels.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <p className="text-zinc-500 text-sm font-light">No showcase reels added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Video Modal */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div 
            className="bg-[#121110] border border-zinc-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReel(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Video Player */}
            <div className="flex-1 bg-black relative flex items-center justify-center h-[55%] md:h-full">
              {getShortcode(selectedReel.instagramUrl) ? (
                <div className="w-full h-full relative">
                  <iframe 
                    src={`https://www.instagram.com/p/${getShortcode(selectedReel.instagramUrl)}/embed/captioned/`}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency
                  />
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video 
                    src={selectedReel.videoUrl} 
                    autoPlay
                    controls
                    muted={isMuted}
                    playsInline 
                    className="w-full h-full object-contain"
                  />
                  {/* Mute toggle button overlay */}
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 z-20 p-2.5 bg-black/50 hover:bg-black/75 rounded-full text-white border border-white/10 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Sidebar / Product Info & CTAs */}
            <div className="w-full md:w-[350px] bg-[#121110] p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800/80 h-[45%] md:h-full overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-zinc-700 p-0.5 overflow-hidden bg-white flex items-center justify-center">
                    <img src="/logo.jpg" alt="TCF" className="h-full w-full object-contain rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-sm text-white tracking-wide">TCF Workshop</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tenali, Andhra Pradesh</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white leading-snug">
                    {selectedReel.title || "Premium Custom Design Walkthrough"}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
                    {selectedReel.description || "Experience the flawless finish of our seasoned teak wood furniture. Each piece is designed for elegance and handcrafted to last for generations."}
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-6 border-t border-zinc-800/80">
                <button 
                  onClick={() => {
                    setSelectedReel(null);
                    openQuoteModal();
                  }}
                  className="w-full py-3 bg-[#DE2943] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/10 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Inquire About Design
                </button>
                
                <a 
                  href={`https://wa.me/918919546858?text=Hi%20TCF%2C%20I%20saw%20your%20design%20video%20at%20${encodeURIComponent(window.location.origin + '/reels')}%20and%20wanted%20to%20know%20more%20details.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Chat on WhatsApp
                </a>

                {selectedReel.instagramUrl && (
                  <a 
                    href={selectedReel.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 border border-zinc-800 hover:bg-zinc-800/40 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> View Original Post
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ReelCard Sub-component for smooth hover states
const ReelCard: React.FC<{ reel: ReelItem; onClick: () => void }> = ({ reel, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isHovered) {
      // Autoplay on hover
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      // Pause when cursor leaves
      videoRef.current.pause();
      videoRef.current.currentTime = 2; // skip intro
    }
  }, [isHovered]);

  return (
    <div 
      className="group relative bg-[#121110] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-premium aspect-[9/16] cursor-pointer hover:border-[#DFBA73]/30 transition-all duration-500 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Video Content */}
      <div className="absolute inset-0 w-full h-full bg-black z-0">
        <video 
          ref={videoRef}
          src={reel.videoUrl + '#t=2'}
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
      </div>

      {/* Glass Card Overlay details */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 z-10 flex flex-col justify-end min-h-[40%]">
        <div className="space-y-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#DFBA73] flex items-center gap-1">
            <InstagramIcon className="w-3 h-3 text-[#DFBA73]" /> Instagram Reel
          </span>
          <h3 className="font-serif font-bold text-sm text-white line-clamp-1 group-hover:text-[#DFBA73] transition-colors duration-300">
            {reel.title || "Premium Custom Craft"}
          </h3>
          <p className="text-[10px] text-zinc-400 font-light line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
            {reel.description || "Watch the detailed overview of our factory-direct teak wood design walkthrough."}
          </p>
        </div>
      </div>

      {/* Floating Play button symbol */}
      <div className="absolute top-4 right-4 z-10 p-2 bg-black/40 rounded-full border border-white/5 group-hover:bg-[#DE2943] transition-colors duration-300">
        <Play className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  );
};
