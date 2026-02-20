'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TimelineBarProps {
  locations: Location[];
  activeLocationId?: string | null;
  onLocationSelect: (location: Location) => void;
  isJourneyStarted?: boolean;
}

export function TimelineBar({ locations, activeLocationId, onLocationSelect, isJourneyStarted = false }: TimelineBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active location
  useEffect(() => {
    if (activeLocationId && containerRef.current) {
      const activeElement = containerRef.current.querySelector(`[data-id="${activeLocationId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeLocationId]);

  return (
    <motion.div
      // When journey starts: slide up from off-screen bottom
      initial={isJourneyStarted ? { y: '100%', opacity: 0 } : false}
      animate={isJourneyStarted ? { y: 0, opacity: 1 } : {}}
      transition={{ type: 'spring', damping: 28, stiffness: 200, delay: 0.1 }}
        className="w-full pb-safe-bottom pt-4 overflow-hidden pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.72) 100%)' }}
    >
      <div
        ref={containerRef}
        className="flex items-start w-full px-4 md:px-6 overflow-x-auto no-scrollbar scroll-smooth pointer-events-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {locations.map((location, index) => {
          const isActive = activeLocationId === location.id;

          return (
            <div
              key={location.id}
              data-id={location.id}
              className="flex-1 flex flex-col items-center min-w-[80px] md:min-w-[100px] cursor-pointer group relative py-1"
              onClick={() => onLocationSelect(location)}
            >
              {/* Connection line */}
              {index < locations.length - 1 && (
                  <div className="absolute top-[17px] left-[calc(50%+8px)] w-[calc(100%-16px)] h-[1px] bg-white/20" />
              )}

              <div className="relative flex items-center justify-center h-[28px] md:h-[30px] z-10">
                <motion.div
                  initial={false}
                  animate={isActive ? {
                    scale: 1.2,
                    backgroundColor: '#f5c542',
                    boxShadow: '0 0 12px #f5c542'
                  } : {
                    scale: 1,
                    backgroundColor: 'transparent',
                    boxShadow: '0 0 0px #f5c542'
                  }}
                    className={cn(
                      "rounded-full border-2 border-[#f5c542] transition-colors duration-300 w-2.5 h-2.5 md:w-3 md:h-3 bg-transparent",
                      !isActive && "group-hover:bg-[#f5c542]/20"
                    )}
                />
              </div>

              {/* Location label */}
              <span
                className={cn(
                  "text-[9px] md:text-[10px] tracking-[0.08em] md:tracking-[0.1em] uppercase mt-2 md:mt-4 w-full text-center transition-all duration-300 px-1",
                  "overflow-hidden",
                  isActive ? "text-white font-bold opacity-100" : "text-gray-300 font-medium opacity-75"
                )}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.3',
                  minHeight: '24px'
                }}
              >
                {location.location_name || location.title}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
