'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Play, ZoomIn, ChevronUp, ChevronLeft, ChevronRight, ZoomOut, Loader2 } from 'lucide-react';
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

// ── Haptic helper ────────────────────────────────────────────────────────────
function haptic(ms = 12) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
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

// ── Helper to format media titles from URL ───────────────────────────────────
const getFileName = (url: string) => {
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    const filename = parts[parts.length - 1];
    // strip timestamp prefix if present (e.g., 1771438498837-Rise_Up.jpg)
    const stripped = filename.replace(/^\d+-/, '');
    // strip extension
    const nameWithoutExt = stripped.substring(0, stripped.lastIndexOf('.')) || stripped;
    // convert dashes/underscores to spaces and capitalize words
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Media File';
  }
};



function Lightbox({
  items,
  initialIndex,
  onClose,
  location,
}: {
  items: Media[];
  initialIndex: number;
  onClose: () => void;
  location: Location;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setScale(1);
    setDimensions(null);
    setIsLoading(true);
  }, [activeIndex]);

  const item = items[activeIndex];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => (s === 1 ? 2.5 : 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!item) return null;

  const fileNameParsed = getFileName(item.url);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 select-none"
        onClick={onClose}
      >
        {/* Top bar with metadata */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/85 to-transparent flex items-center justify-between z-10 pointer-events-auto">
          <div className="flex flex-col text-left pr-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#f5c542] font-semibold drop-shadow-md">
              {location.location_name}
            </span>
            <h4 className="text-white text-base font-bold truncate max-w-[200px] sm:max-w-sm md:max-w-xl drop-shadow-lg">
              {fileNameParsed}
            </h4>
            <span className="text-[9px] text-white/50 tracking-wider font-mono mt-0.5">
              {dimensions ? `${dimensions.width} × ${dimensions.height} px` : 'Detecting resolution...'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {item.type === 'image' && (
              <button
                onClick={toggleZoom}
                className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title={scale > 1 ? "Zoom Out" : "Zoom In"}
              >
                {scale > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Prev Button */}
        {items.length > 1 && (
          <button
            onClick={handlePrev}
            onPointerDown={() => haptic()}
            className="absolute left-4 sm:left-6 p-3 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white z-10 transition-colors pointer-events-auto cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Media Container */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative max-w-[95vw] max-h-[75vh] flex items-center justify-center overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Skeleton Loader */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl">
              <Loader2 className="w-8 h-8 text-[#f5c542] animate-spin" />
            </div>
          )}

          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              playsInline
              onLoadedData={() => setIsLoading(false)}
              className="max-w-[95vw] max-h-[75vh] rounded-xl object-contain shadow-2xl"
            />
          ) : (
            <motion.img
              src={item.url}
              alt=""
              animate={{ scale }}
              drag={scale > 1}
              dragConstraints={{
                left: -250 * (scale - 1),
                right: 250 * (scale - 1),
                top: -150 * (scale - 1),
                bottom: 150 * (scale - 1),
              }}
              dragElastic={0.15}
              onDoubleClick={toggleZoom}
              onLoad={(e) => {
                setIsLoading(false);
                const img = e.currentTarget;
                setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              }}
              className="max-w-[95vw] max-h-[75vh] rounded-xl object-contain shadow-2xl cursor-grab active:cursor-grabbing select-none"
            />
          )}
        </motion.div>

        {/* Carousel Next Button */}
        {items.length > 1 && (
          <button
            onClick={handleNext}
            onPointerDown={() => haptic()}
            className="absolute right-4 sm:right-6 p-3 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white z-10 transition-colors pointer-events-auto cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Counter Overlay */}
        {items.length > 1 && (
          <div className="absolute bottom-6 px-4.5 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[10px] text-white/70 tracking-widest font-mono">
            {activeIndex + 1} / {items.length}
          </div>
        )}
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
  onLightbox,
  isFullyOpen,
}: {
  location: Location;
  locationMedia: Media[];
  currentIndex: number;
  totalLocations: number;
  isJourneyPlaying: boolean;
  onLightbox: (item: Media) => void;
  isFullyOpen: boolean;
}) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto px-6 md:px-8 pt-10 md:pt-14 pb-12 flex flex-col mobile-no-scrollbar',
        isJourneyPlaying && 'pb-32 md:pb-12',
      )}
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="mb-2 flex items-center gap-2.5 pr-12 md:pr-0"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#f5c542] font-medium drop-shadow-md">
          {location.location_name}
        </span>
        <span className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-[#f5c542] font-bold drop-shadow-sm opacity-70">
          {location.date_from && location.date_to
            ? `${location.date_from} — ${location.date_to}`
            : location.date_from || location.date_to}
        </span>
      </motion.div>

      <motion.h2
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-6 leading-tight drop-shadow-lg pr-12 md:pr-0"
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
          className="mt-6 md:mt-8 flex flex-row overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible"
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
              onPointerDown={() => haptic()}
              className="h-72 aspect-[3/4] relative rounded-xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer shrink-0 snap-center md:h-auto md:w-full md:aspect-square flex items-center justify-center"
            >
              {item.type === 'video' ? (
                <div className="h-full aspect-video md:aspect-square md:absolute md:inset-0 flex items-center justify-center">
                  {isFullyOpen ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      muted
                      playsInline
                      preload="none"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 animate-pulse" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile: next/image instead of raw <img> — was loading the
                      original full-resolution upload with no resize/compression
                      on every phone regardless of screen size or network. */}
                  {isFullyOpen ? (
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 156px, 200px"
                      quality={75}
                      className="object-cover md:hidden transition-transform duration-700 group-hover:scale-105"
                      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(156, 208))}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 animate-pulse md:hidden" />
                  )}
                  {/* Desktop next/image (fill, cropped square grid) */}
                  <div className="hidden md:block absolute inset-0">
                    {isFullyOpen ? (
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 animate-pulse" />
                    )}
                  </div>
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
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    if (location) setLastLocation(location);
  }, [location]);

  // Reset isFullyOpen when panel is closed or changing location to avoid layout jumps/lag on next animation
  useEffect(() => {
    if (!isOpen) {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

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
              onAnimationComplete={() => setIsFullyOpen(true)}
              className={cn(
                'hidden md:flex flex-col',
                'fixed right-0 top-0 h-full w-[420px]',
                'bg-[#0a0a0f]/90 backdrop-blur-xl',
                'border-l border-white/5',
                'z-[70] shadow-2xl overflow-hidden',
                'will-change-transform',
              )}
            >
              {/* Close */}
              <button
                onClick={onClose}
                onPointerDown={() => haptic()}
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
                animate={isFullyOpen ? "visible" : "hidden"}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <PanelContent
                  location={displayLocation}
                  locationMedia={locationMedia}
                  currentIndex={currentIndex}
                  totalLocations={totalLocations}
                  isJourneyPlaying={isJourneyPlaying}
                  onLightbox={setLightboxItem}
                  isFullyOpen={isFullyOpen}
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
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) onClose();
              }}
              onAnimationComplete={() => setIsFullyOpen(true)}
              initial={{ y: '100%' }}
              animate={{ 
                y: '0%',
              }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 300 }}
              className={cn(
                'fixed bottom-0 left-0 right-0 md:hidden',
                'h-auto max-h-[92%]',
                'bg-[#0a0a0f] rounded-t-3xl',
                'border-t border-white/10',
                'z-[70] shadow-2xl flex flex-col overflow-hidden',
                'will-change-transform',
              )}
            >

              {/* Drag handle */}
              <div
                className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
                onPointerDown={(e) => dragControls.start(e)}
                style={{ touchAction: 'none' }}
              >
                <div className="w-10 h-1 bg-white/30 rounded-full mb-1" />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                onPointerDown={() => haptic()}
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
                animate={isFullyOpen ? "visible" : "hidden"}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <PanelContent
                  location={displayLocation}
                  locationMedia={locationMedia}
                  currentIndex={currentIndex}
                  totalLocations={totalLocations}
                  isJourneyPlaying={isJourneyPlaying}
                  onLightbox={setLightboxItem}
                  isFullyOpen={isFullyOpen}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox
          items={locationMedia}
          initialIndex={locationMedia.findIndex((m) => m.id === lightboxItem.id)}
          onClose={() => setLightboxItem(null)}
          location={displayLocation}
        />
      )}
    </>
  );
}
