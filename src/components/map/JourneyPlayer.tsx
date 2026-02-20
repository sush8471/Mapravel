'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@/lib/types';
import mapboxgl from 'mapbox-gl';
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';

interface JourneyPlayerProps {
  locations: Location[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  isStarted: boolean;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onCameraLanded?: () => void;
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
}: JourneyPlayerProps) {
  const prevIndexRef   = useRef<number>(-1);
  const bearingRef     = useRef(0);
  const flyTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orbitTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOrbitingRef  = useRef(false);

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

        map.flyTo({
          center:   [loc.longitude, loc.latitude],
          zoom:     sig.zoom,
          pitch:    sig.pitch,
          bearing:  bearingRef.current,
          duration,
          essential: true,
          curve:     1.55, // Slightly gentler curve than 1.72 for smoother pathing
          easing:    cinematicFlyEase,
        });


      // Schedule orbit to begin just as the camera eases to a stop
      orbitTimerRef.current = setTimeout(() => {
        if (!mapRef.current || !isStarted) return;
        startOrbit(mapRef.current, bearingRef.current);
      }, duration - 100); // reduced delay for tighter transition
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
    flyToStop(loc, sig, FLY_DURATION + 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => clearTimers(), []);

  return (
    <AnimatePresence>
      {isStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[5.5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full px-2 py-1.5"
        >
          {/* Prev */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="hover:bg-white/10 text-white p-2.5 md:p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          {/* Next */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            disabled={currentIndex === locations.length - 1}
            className="hover:bg-white/10 text-white p-2.5 md:p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          {/* Stop */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onStop}
            className="hover:bg-red-900/60 text-white/70 hover:text-red-400 p-2.5 md:p-3 rounded-full transition-all"
          >
            <Square className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
