'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ZoomIn, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import type { Location, Media } from '@/lib/types';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LocationPanelProps {
  location: Location | null;
  media: Media[];
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  totalLocations: number;
  isJourneyPlaying?: boolean;
}

// ── Shimmer for Next.js Image ────────────────────────────────────────────────
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#444" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ item, onClose }: { item: Media; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              playsInline
              className="max-w-[95vw] max-h-[85vh] rounded-xl object-contain"
            />
            ) : (
              <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center">
                <Image
                  src={item.url}
                  alt=""
                  fill
                  priority
                  className="rounded-xl object-contain"
                  sizes="95vw"
                />
              </div>
            )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Shared panel content ──────────────────────────────────────────────────────
function PanelContent({
  location,
  locationMedia,
  currentIndex,
  totalLocations,
  isJourneyPlaying,
  isExpanded,
  onLightbox,
}: {
  location: Location;
  locationMedia: Media[];
  currentIndex: number;
  totalLocations: number;
  isJourneyPlaying: boolean;
  isExpanded?: boolean;
  onLightbox: (item: Media) => void;
}) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto px-6 md:px-8 pt-4 md:pt-14 pb-12 flex flex-col',
        isJourneyPlaying && 'pb-32 md:pb-12',
      )}
    >
      {/* Swipe hint — mobile only, partial state */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="md:hidden flex flex-col items-center gap-1 pointer-events-none overflow-hidden"
          >
            <ChevronUp className="w-4 h-4 text-white/30 animate-bounce" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">
              Swipe up to expand
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="mb-1"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#f5c542] font-medium drop-shadow-md">
          {location.location_name}
        </span>
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="mb-2"
      >
        <span className="text-xs text-white/40 drop-shadow-sm">
          {location.date_from && location.date_to
            ? `${location.date_from} — ${location.date_to}`
            : location.date_from || location.date_to}
        </span>
      </motion.div>

      <motion.h2
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-6 leading-tight drop-shadow-lg"
      >
        {location.title}
      </motion.h2>

      <motion.div
        variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
        style={{ transformOrigin: 'left' }}
        className="w-8 h-[2px] bg-[#f5c542] mb-4 md:mb-8"
      />

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="text-gray-200 leading-relaxed text-sm md:text-base space-y-3 drop-shadow-md"
      >
        {location.description?.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </motion.div>

      {/* Media Gallery */}
      {locationMedia.length > 0 && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
          className="mt-6 md:mt-8 grid grid-cols-2 gap-2 md:gap-3"
        >
          {locationMedia.map((item) => (
            <motion.button
              key={item.id}
              variants={{
                hidden: { opacity: 0, scale: 0.85, y: 16 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              onClick={() => onLightbox(item)}
              className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer relative"
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </>
                ) : (
                  <>
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </>
                )}

            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── LocationPanel ─────────────────────────────────────────────────────────────
export function LocationPanel({
  location,
  media,
  isOpen,
  onClose,
  currentIndex,
  totalLocations,
  isJourneyPlaying = false,
}: LocationPanelProps) {
  const [lastLocation, setLastLocation] = useState<Location | null>(location);
  const [lightboxItem, setLightboxItem] = useState<Media | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (location) setLastLocation(location);
  }, [location]);

  // Reset expand state whenever panel closes or location changes
  useEffect(() => {
    if (!isOpen) setIsExpanded(false);
  }, [isOpen, location?.id]);

  const displayLocation = location || lastLocation;
  const locationMedia = displayLocation
    ? media.filter((m) => m.location_id === displayLocation.id)
    : [];

  return (
    <>
      <AnimatePresence>
        {isOpen && displayLocation && (
          <>
            {/* ── DESKTOP: right-side panel (md and up) ─────────────────── */}
            <motion.div
              key="desktop-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className={cn(
                'hidden md:flex flex-col',
                'fixed right-0 top-0 h-full w-[420px]',
                'bg-[#0a0a0f]/90 backdrop-blur-xl',
                'border-l border-white/5',
                'z-[70] shadow-2xl overflow-hidden',
              )}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all z-10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <motion.div
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col flex-1 overflow-hidden"
              >
                <PanelContent
                  location={displayLocation}
                  locationMedia={locationMedia}
                  currentIndex={currentIndex}
                  totalLocations={totalLocations}
                  isJourneyPlaying={isJourneyPlaying}
                  isExpanded={true}
                  onLightbox={setLightboxItem}
                />
              </motion.div>
            </motion.div>

            {/* ── MOBILE: bottom sheet (below md) ───────────────────────── */}
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-[60] md:hidden"
            />

              <motion.div
                key="mobile-sheet"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.3 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -60) setIsExpanded(true);
                  if (info.offset.y > 120) onClose();
                }}
                initial={{ y: '100%' }}
                animate={{ 
                  y: isExpanded ? '0%' : '52%',
                  borderTopLeftRadius: isExpanded ? '1.5rem' : '2rem',
                  borderTopRightRadius: isExpanded ? '1.5rem' : '2rem'
                }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 34, stiffness: 300 }}
                className={cn(
                  'fixed bottom-0 left-0 right-0 md:hidden',
                  'h-[95%]',
                  'bg-[#0a0a0f]/97 backdrop-blur-2xl',
                  'border-t border-white/10',
                  'z-[70] shadow-2xl flex flex-col overflow-hidden',
                )}
              >

              {/* Drag handle + expand/collapse tap target */}
              <div
                className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
                onClick={() => setIsExpanded((e) => !e)}
              >
                <div className="w-10 h-1 bg-white/20 rounded-full mb-1" />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-5 p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all z-10"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>

              <motion.div
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col flex-1 overflow-hidden"
              >
                <PanelContent
                  location={displayLocation}
                  locationMedia={locationMedia}
                  currentIndex={currentIndex}
                  totalLocations={totalLocations}
                  isJourneyPlaying={isJourneyPlaying}
                  isExpanded={isExpanded}
                  onLightbox={setLightboxItem}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </>
  );
}
