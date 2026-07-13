'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@/lib/types';
import mapboxgl from 'mapbox-gl';
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';

function haptic(ms = 12) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isSmall = window.innerWidth <= 768;
  return isTouch && (isCoarse || isSmall);
}

interface JourneyPlayerProps {
  locations: Location[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  isStarted: boolean;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onCameraLanded?: () => void;
  onFlightStart?: () => void;
  onFlightComplete?: (isSkipped?: boolean) => void;
}

// ─── Easing curves ────────────────────────────────────────────────────────────

// A single continuous cinematic easing — smooth and predictable
const cinematicFlyEase = (t: number): number => {
  // Cubic in-out for a more balanced velocity profile than quintic
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Gentle orbit easing — used for the post-landing slow rotation
const orbitEase = (t: number): number => {
  // Ease out sine: smooth deceleration of the orbit
  return Math.sin((t * Math.PI) / 2);
};

// ─── Per-stop camera signatures ───────────────────────────────────────────────
// Each stop: zoom level when landed, pitch, cumulative bearing offset applied
const CAMERA_SIGNATURES = [
  { zoom: 13.5, pitch: 58,  bearingDelta:   0 },
  { zoom: 12.8, pitch: 65,  bearingDelta: -38 },
  { zoom: 14.0, pitch: 48,  bearingDelta:  52 },
  { zoom: 13.2, pitch: 70,  bearingDelta: -30 },
  { zoom: 13.8, pitch: 55,  bearingDelta:  75 },
  { zoom: 12.5, pitch: 62,  bearingDelta: -60 },
];

// Orbit rotation amount (degrees) added during the slow post-landing spin
const ORBIT_DEGREES = 22;
// How long the camera slowly drifts after landing (ms)
const ORBIT_DURATION = 9000;
// Main flight duration (ms) — long enough to feel cinematic, not sluggish
const FLY_DURATION = 6200;

export function JourneyPlayer({
  locations,
  mapRef,
  isStarted,
  currentIndex,
  onNext,
  onPrev,
  onStop,
  onCameraLanded,
  onFlightStart,
  onFlightComplete,
}: JourneyPlayerProps) {
  const prevIndexRef   = useRef<number>(-1);
  const bearingRef     = useRef(0);
  const flyTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orbitTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOrbitingRef  = useRef(false);

  // Flight states
  const [isFlying, setIsFlying] = useState(false);
  const isFlyingRef = useRef(false);
  useEffect(() => {
    isFlyingRef.current = isFlying;
  }, [isFlying]);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Mobile detection for performance tuning
  const isMobileRef = useRef(false);
  useEffect(() => {
    isMobileRef.current = isMobileDevice();
  }, []);

  const clearTimers = () => {
    if (flyTimerRef.current)   { clearTimeout(flyTimerRef.current);   flyTimerRef.current   = null; }
    if (orbitTimerRef.current) { clearTimeout(orbitTimerRef.current); orbitTimerRef.current = null; }
  };

  // Start the slow post-landing orbit
  const startOrbit = (map: mapboxgl.Map, landedBearing: number) => {
    if (isOrbitingRef.current) return;
    isOrbitingRef.current = true;
    map.easeTo({
      bearing: landedBearing + ORBIT_DEGREES,
      duration: ORBIT_DURATION,
      easing: orbitEase,
    });
    onCameraLanded?.();
  };

  // Main flight to a journey stop — single continuous flyTo, no hard phase switch
  const flyToStop = (loc: Location, sig: typeof CAMERA_SIGNATURES[0], duration: number) => {
    const map = mapRef.current;
    if (!map) return;

    clearTimers();
    isOrbitingRef.current = false;
    map.stop(); // cleanly cancel any previous motion

    const isMobile = isMobileRef.current;
    // Clamp pitch on mobile — high pitch + terrain is the heaviest GPU combo
    const mobilePitch = isMobile ? Math.max(30, sig.pitch - 25) : sig.pitch;

    if (prefersReducedMotion) {
      setIsFlying(false);
      map.jumpTo({
        center:   [loc.longitude, loc.latitude],
        zoom:     sig.zoom,
        pitch:    mobilePitch,
        bearing:  bearingRef.current,
      });
      if (!isMobile) startOrbit(map, bearingRef.current);
      onFlightComplete?.(true);
      return;
    }

    setIsFlying(true);
    onFlightStart?.();

    map.flyTo({
      center:   [loc.longitude, loc.latitude],
      zoom:     sig.zoom,
      pitch:    mobilePitch,
      bearing:  bearingRef.current,
      duration: isMobile ? Math.min(duration, 3500) : duration,
      essential: true,
      curve:     isMobile ? 1.3 : 1.55, // gentler curve on mobile = less GPU strain
      easing:    cinematicFlyEase,
    });

    // Schedule orbit to begin just as the camera eases to a stop
    // SKIP orbit entirely on mobile — it's a 9s continuous GPU drain
    const flyDuration = isMobile ? Math.min(duration, 3500) : duration;
    orbitTimerRef.current = setTimeout(() => {
      if (!mapRef.current || !isStarted) return;
      setIsFlying(false);
      if (!isMobile) startOrbit(mapRef.current, bearingRef.current);
      onFlightComplete?.(false);
    }, flyDuration - 100);
  };

  // Implement tap-to-skip directly on the Mapbox canvas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = () => {
      if (isFlyingRef.current) {
        handleSkip();
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlying, currentIndex]);

  const handleSkip = () => {
    const map = mapRef.current;
    if (!map || !isStarted || !isFlyingRef.current) return;

    clearTimers();
    isOrbitingRef.current = false;
    map.stop();

    const loc = locations[currentIndex];
    if (!loc) return;
    const sig = CAMERA_SIGNATURES[currentIndex % CAMERA_SIGNATURES.length];

    map.jumpTo({
      center:   [loc.longitude, loc.latitude],
      zoom:     sig.zoom,
      pitch:    sig.pitch,
      bearing:  bearingRef.current,
    });

    setIsFlying(false);
    startOrbit(map, bearingRef.current);
    onFlightComplete?.(true);
  };

  // ── Fly to stop when journey index changes ────────────────────────────────
  useEffect(() => {
    if (!isStarted || !mapRef.current || locations.length === 0) return;
    const loc = locations[currentIndex];
    if (!loc) return;
    if (prevIndexRef.current === currentIndex) return;

    const sig = CAMERA_SIGNATURES[currentIndex % CAMERA_SIGNATURES.length];
    bearingRef.current = (bearingRef.current + sig.bearingDelta) % 360;
    prevIndexRef.current = currentIndex;

    flyToStop(loc, sig, FLY_DURATION);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isStarted, locations]);

  // ── Journey start — fly to first location ────────────────────────────────
  useEffect(() => {
    if (!isStarted || !mapRef.current || locations.length === 0) return;

    bearingRef.current  = 0;
    prevIndexRef.current = 0;
    const loc = locations[0];
    const sig = CAMERA_SIGNATURES[0];

    // Slightly longer flight for the first dramatic arrival
    // On mobile: keep it tight to avoid thermal throttling during sustained GPU load
    const firstDuration = isMobileRef.current ? 4000 : FLY_DURATION + 800;
    flyToStop(loc, sig, firstDuration);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => clearTimers(), []);

  return (
    <AnimatePresence>
      {isStarted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[calc(14%+env(safe-area-inset-bottom))] md:bottom-10 left-1/2 -translate-x-1/2 z-[75] flex flex-col items-center gap-2 pointer-events-none"
        >
          {/* Slim glass capsule — barely-there background */}
          <div className={"flex items-center gap-3 pointer-events-auto rounded-full py-1.5 px-4 " + (isMobileRef.current ? "bg-black/40" : "bg-black/15 backdrop-blur-sm")}>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onPrev}
              onPointerDown={() => haptic()}
              disabled={currentIndex === 0}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onStop}
              onPointerDown={() => haptic()}
              className="text-white/50 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Square className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onNext}
              onPointerDown={() => haptic()}
              disabled={currentIndex === locations.length - 1}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            {isFlying && (
              <motion.button
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                whileTap={{ scale: 0.85 }}
                onClick={handleSkip}
                onPointerDown={() => haptic()}
                className="text-[#f5c542]/80 hover:text-[#f5c542] text-[11px] font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer"
                title="Skip Animation"
              >
                Skip
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
