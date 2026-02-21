'use client';

import { Play, Share2, Volume2, VolumeX, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapHeaderProps {
  title: string;
  subtitle?: string;
  onPlayJourney?: () => void;
  backgroundMusicUrl?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onShare?: () => void;
  onExplore?: () => void;
  showExplore?: boolean;
}

export function MapHeader({ 
  title, 
  subtitle, 
  onPlayJourney, 
  backgroundMusicUrl,
  isMuted,
  onToggleMute,
  onShare,
  onExplore,
  showExplore = false
}: MapHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-[40] flex items-center justify-between px-4 md:px-6 py-3 md:py-5 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
      {/* Left: Title + subtitle */}
      <div className="flex flex-col pointer-events-auto min-w-0 flex-1 pr-3">
        <h1 className="text-base md:text-xl text-white font-bold leading-tight tracking-tight truncate">{title}</h1>
        {subtitle && (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs md:text-sm text-gray-400 truncate">{subtitle}</p>
            {backgroundMusicUrl && (
              <>
                <div className="w-[1px] h-3 bg-white/20 hidden sm:block" />
                  {/* Equalizer icon visible on sm+, hidden on mobile */}
                  <div className="items-center gap-2 hidden sm:flex">
                    {!isMuted && (
                      <div className="equalizer">
                        <div className="equalizer-bar" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
                        <div className="equalizer-bar" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }} />
                        <div className="equalizer-bar" style={{ animationDelay: '0s', animationDuration: '0.9s' }} />
                        <div className="equalizer-bar" style={{ animationDelay: '0.5s', animationDuration: '1.1s' }} />
                        <div className="equalizer-bar" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
                      </div>
                    )}
                    <span className="text-[10px] text-[#f5c542] uppercase tracking-[0.2em] font-medium drop-shadow-[0_0_8px_rgba(245,197,66,0.3)]">Original Score</span>
                  </div>
                  {/* On mobile: just the animated equalizer bars, no label */}
                  {!isMuted && (
                    <div className="equalizer sm:hidden">
                      <div className="equalizer-bar" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
                      <div className="equalizer-bar" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }} />
                      <div className="equalizer-bar" style={{ animationDelay: '0s', animationDuration: '0.9s' }} />
                    </div>
                  )}

              </>
            )}
          </div>
        )}
      </div>
      
      {/* Right: action buttons */}
      <div className="flex items-center gap-2 md:gap-4 pointer-events-auto flex-shrink-0">
        <AnimatePresence>
          {showExplore && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              onClick={onExplore}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-full transition-all group"
            >
              <Library className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f5c542]" />
              <span className="text-xs md:text-sm font-medium uppercase tracking-[0.1em]">Explore</span>
            </motion.button>
          )}
        </AnimatePresence>

        {backgroundMusicUrl && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMute}
            className="p-2 md:p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onShare}
          className="p-2 md:p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>

        {/* Mobile: icon-only pill */}
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(245, 197, 66, 0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayJourney}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 border border-[#f5c542] text-[#f5c542] rounded-full hover:bg-[#f5c542]/10 transition-colors group"
        >
          <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#f5c542] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-sm font-medium uppercase tracking-[0.15em]">Start Journey</span>
            <span className="sm:hidden text-xs font-medium uppercase tracking-[0.1em]">Start</span>
        </motion.button>
      </div>
    </header>
  );
}
