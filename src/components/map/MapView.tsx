'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Location, Client, Media } from '@/lib/types';
import { LocationPanel } from './LocationPanel';
import { MapHeader } from './MapHeader';
import { TimelineBar } from './TimelineBar';
import { JourneyPlayer } from './JourneyPlayer';
import { IntroAnimation } from './IntroAnimation';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Compass, RotateCcw, Copy, Twitter, X } from 'lucide-react';
import { toast } from 'sonner';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  locations: Location[];
  client: Client;
  media: Media[];
}

export function MapView({ locations, client, media }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const journeyAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markersRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const allArcCoordinatesRef = useRef<[number, number][]>([]);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstReveal = useRef(true);
  const revealFired = useRef(false);

  // UI state
  const [showIntro, setShowIntro] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isInteractingBlocked, setIsInteractingBlocked] = useState(true);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const isJourneyStartedRef = useRef(false);
  useEffect(() => { isJourneyStartedRef.current = isJourneyStarted; }, [isJourneyStarted]);
  const [currentJourneyIndex, setCurrentJourneyIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showExploreHint, setShowExploreHint] = useState(false);
  const [showArrivalFlash, setShowArrivalFlash] = useState(false);

  // We'll track these with refs and only update visibility on moveend to avoid per-frame re-renders
  const [showReset, setShowReset] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getArcPoints = (start: [number, number], end: [number, number], pointsCount = 100): [number, number][] => {
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;
    const dx = endLng - startLng;
    const dy = endLat - startLat;
    const arcHeight = Math.sqrt(dx * dx + dy * dy) * 0.2;
    return Array.from({ length: pointsCount + 1 }, (_, i) => {
      const t = i / pointsCount;
      return [startLng + t * dx, startLat + t * dy + 4 * arcHeight * t * (1 - t)];
    });
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    setIsPanelOpen(false);
    
    if (mapRef.current) {
      mapRef.current.flyTo({ 
        center: [location.longitude, location.latitude], 
        zoom: 14, 
        duration: 2000, 
        essential: true,
        pitch: 45,
        bearing: 0
      });
    }

    // ONLY auto-open panel in overview mode. 
    // In journey mode, we use the flashy Explore button instead.
    if (!isJourneyStarted) {
      panelTimerRef.current = setTimeout(() => {
          setIsPanelOpen(true);
      }, 2200);
    }
  };

  // ── Audio helpers ─────────────────────────────────────────────────────────
  const FADE_STEPS = 40;
  const FADE_DURATION = 2000;

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeOut = (audio: HTMLAudioElement, onDone?: () => void) => {
    clearFade();
    const startVol = audio.volume;
    const step = startVol / FADE_STEPS;
    const interval = FADE_DURATION / FADE_STEPS;
    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume > step) {
        audio.volume = Math.max(0, audio.volume - step);
      } else {
        audio.volume = 0;
        audio.pause();
        clearFade();
        onDone?.();
      }
    }, interval);
  };

  const fadeIn = (audio: HTMLAudioElement, targetVolume = 1) => {
    clearFade();
    audio.volume = 0;
    audio.play().catch(() => {});
    const step = targetVolume / FADE_STEPS;
    const interval = FADE_DURATION / FADE_STEPS;
    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume < targetVolume - step) {
        audio.volume = Math.min(targetVolume, audio.volume + step);
      } else {
        audio.volume = targetVolume;
        clearFade();
      }
    }, interval);
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Page view tracking
  useEffect(() => {
    const trackView = async () => {
      const sessionKey = `viewed_${client.slug}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
        try {
          await supabase.from('page_views').insert({ client_id: client.id, slug: client.slug });
          sessionStorage.setItem(sessionKey, 'true');
        } catch (err) {
          console.error('Failed to track page view:', err);
        }
      }
    };
    trackView();
  }, [client.id, client.slug]);

  // ── Map initialisation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe' as any,
      attributionControl: false,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      setLoadProgress(100);

      // Add 3D Terrain
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add 3D Buildings
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && (layer.layout as any)?.['text-field']
      )?.id;

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#1a1a1a',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.8,
          },
        },
        labelLayerId
      );

      map.setFog({
        range: [0.5, 10],
        color: '#0a0a0f',
        'high-color': '#242b38',
        'space-color': '#000000',
        'horizon-blend': 0.1,
      });

      // Markers
      locations.forEach((loc) => {
        const markerContainer = document.createElement('div');
        markerContainer.className = 'marker-container';
        markerContainer.dataset.locationId = loc.id;
        const markerPulse = document.createElement('div');
        markerPulse.className = 'marker-pulse';
        markerContainer.appendChild(markerPulse);
        markerContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          handleLocationSelect(loc);
        });
        new mapboxgl.Marker(markerContainer).setLngLat([loc.longitude, loc.latitude]).addTo(map);
        markersRef.current[loc.id] = markerContainer;
      });

      // Arc lines
      if (locations.length > 1) {
        let allArcCoordinates: [number, number][] = [];
        for (let i = 0; i < locations.length - 1; i++) {
          const start: [number, number] = [locations[i].longitude, locations[i].latitude];
          const end: [number, number] = [locations[i + 1].longitude, locations[i + 1].latitude];
          allArcCoordinates = [...allArcCoordinates, ...getArcPoints(start, end)];
        }
        allArcCoordinatesRef.current = allArcCoordinates;

        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
        });
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#f5c542', 'line-width': 2, 'line-opacity': 0.4, 'line-dasharray': [2, 4] },
        });

        let lastUpdateTime = 0;
        const updateLineProgress = (progress: number) => {
          const now = Date.now();
          if (now - lastUpdateTime < 32) return; // Throttle to ~30fps
          lastUpdateTime = now;

          const totalCoords = allArcCoordinatesRef.current.length;
          const step = Math.floor(progress * totalCoords);
          const source = map.getSource('route') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: allArcCoordinatesRef.current.slice(0, step) },
              properties: {},
            });
          }
        };
        (map as any)._updateLineProgress = updateLineProgress;
      }
    });

    map.on('styledataloading', () => setLoadProgress(30));
    map.on('styledata', () => setLoadProgress(70));
    
    map.on('move', () => {
      if (compassRef.current) {
        compassRef.current.style.transform = `rotate(${-map.getBearing()}deg)`;
      }
    });

    map.on('moveend', () => {
      const b = map.getBearing();
      const p = map.getPitch();
      const needsReset = Math.abs(b) > 5 || Math.abs(p - (isJourneyStartedRef.current ? 45 : 0)) > 5;
      setShowReset(needsReset);
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [locations]);

  // ── Cinematic reveal (on intro complete) ─────────────────────────────────
  useEffect(() => {
    if (isRevealing && mapLoaded && mapRef.current && locations.length > 0 && !revealFired.current) {
      revealFired.current = true;
      const firstLocation = locations[0];
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.flyTo({
            center: [firstLocation.longitude, firstLocation.latitude],
            zoom: 4.5,
            pitch: 55,
            bearing: -15,
            duration: 8000,
            essential: true,
            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
          });
        }, 0);


      const map = mapRef.current;
      const handleZoom = () => {
        const progress = Math.min(1, Math.max(0, (map.getZoom() - 1.5) / (4.5 - 1.5)));
        if ((map as any)._updateLineProgress) (map as any)._updateLineProgress(progress);
      };
      map.on('zoom', handleZoom);
      setTimeout(() => { if (mapRef.current) mapRef.current.off('zoom', handleZoom); }, 11000);
    }
  }, [isRevealing, mapLoaded, locations]);

  // ── Fly back to overview when journey stops ───────────────────────────────
  const prevJourneyStarted = useRef(false);
  useEffect(() => {
    if (!isJourneyStarted && prevJourneyStarted.current && mapRef.current && locations.length > 0) {
      setTimeout(() => {
        if (!mapRef.current) return;
          mapRef.current.flyTo({
            center: [locations[0].longitude, locations[0].latitude],
            zoom: 4.5,
            pitch: 55,
            bearing: -15,
            duration: 8000,
            essential: true,
            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
          });

      }, 300);
    }
    prevJourneyStarted.current = isJourneyStarted;
  }, [isJourneyStarted, locations]);

  // ── Active marker highlight ───────────────────────────────────────────────
  useEffect(() => {
    Object.keys(markersRef.current).forEach((id) => {
      const el = markersRef.current[id];
      if (selectedLocation?.id === id) el.classList.add('active');
      else el.classList.remove('active');
    });
  }, [selectedLocation]);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  useEffect(() => {
    const intro = introAudioRef.current;
    if (!intro || !client.background_music_url) return;
    if (isMuted) fadeOut(intro);
    else if (!isJourneyStarted) fadeIn(intro);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, client.background_music_url]);

  // ── Journey audio crossfade ───────────────────────────────────────────────
  useEffect(() => {
    if (isMuted) return;
    const intro = introAudioRef.current;
    const journey = journeyAudioRef.current;
    if (isJourneyStarted) {
      if (intro && !intro.paused) fadeOut(intro, () => { if (journey && client.journey_music_url) fadeIn(journey); });
      else if (journey && client.journey_music_url) fadeIn(journey);
    } else if (!isJourneyStarted && prevJourneyStarted.current) {
      if (journey && !journey.paused) fadeOut(journey, () => { if (intro && client.background_music_url) fadeIn(intro); });
      else if (intro && client.background_music_url) fadeIn(intro);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJourneyStarted]);

  // ── Show cinematic overlay when index changes ─────────────────────────────
  useEffect(() => {
    if (!isJourneyStarted) return;

    // Cancel any pending timers
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (overlayHideTimerRef.current) clearTimeout(overlayHideTimerRef.current);
    if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    if (exploreHintTimerRef.current) clearTimeout(exploreHintTimerRef.current);

    // Immediately hide old overlay and close panel
    setIsPanelOpen(false);
    setShowOverlay(false);
    setShowExploreHint(false);
    setShowArrivalFlash(false);

      // Set selected location immediately so panel has data when Explore is tapped
      const loc = locations[currentJourneyIndex];
      if (loc) setSelectedLocation(loc);

        // Show title overlay ~2s before the flight ends
        const isFirstStop = currentJourneyIndex === 0;
        const flightDuration = isFirstStop ? 7000 : 6200;

        overlayTimerRef.current = setTimeout(() => {
          setShowOverlay(true);
          // Auto-hide title after 8 seconds
          overlayHideTimerRef.current = setTimeout(() => {
            setShowOverlay(false);
          }, 8000);
        }, flightDuration - 2000);

        // Arrival flash — fires just as the camera decelerates into landing
        const arrivalFlashTimer = setTimeout(() => {
          setShowArrivalFlash(true);
          setTimeout(() => setShowArrivalFlash(false), 850);
        }, flightDuration - 300);

        // Show Explore button after camera has landed
        exploreHintTimerRef.current = setTimeout(() => {
          setShowExploreHint(true);
        }, flightDuration + 100);

    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      if (exploreHintTimerRef.current) clearTimeout(exploreHintTimerRef.current);
      clearTimeout(arrivalFlashTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJourneyIndex, isJourneyStarted]);

  // ── Journey controls ──────────────────────────────────────────────────────
  const handleStartJourney = useCallback(() => {
    setCurrentJourneyIndex(0);
    setIsPanelOpen(false);
    setShowOverlay(false);
    setIsJourneyStarted(true);
  }, []);

  const handleStopJourney = useCallback(() => {
    setIsJourneyStarted(false);
    setIsPanelOpen(false);
    setSelectedLocation(null);
    setShowOverlay(false);
    setShowExploreHint(false);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (overlayHideTimerRef.current) clearTimeout(overlayHideTimerRef.current);
    if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    if (exploreHintTimerRef.current) clearTimeout(exploreHintTimerRef.current);
  }, []);

  const handleTogglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentJourneyIndex < locations.length - 1) {
      setCurrentJourneyIndex((i) => i + 1);
    }
  }, [currentJourneyIndex, locations.length]);

  const handlePrev = useCallback(() => {
    if (currentJourneyIndex > 0) {
      setCurrentJourneyIndex((i) => i - 1);
    }
  }, [currentJourneyIndex]);

  const currentIndex = selectedLocation
    ? locations.findIndex((loc) => loc.id === selectedLocation.id)
    : 0;

  return (
    <div className="relative bg-[#0a0a0f]" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ── Intro animation ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation
            title={client.title}
            subtitle={client.name}
            onStartRevealing={() => {
              setIsRevealing(true);
              setIsMuted(false);
              if (introAudioRef.current && client.background_music_url) fadeIn(introAudioRef.current);
            }}
            onComplete={() => {
              setShowIntro(false);
              setTimeout(() => {
                setIsInteractingBlocked(false);
                isFirstReveal.current = false;
              }, 10000);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Header + non-journey timeline ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isJourneyStarted && !showIntro && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1.2, delay: isFirstReveal.current ? 7.5 : 3.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 z-[40]"
            >
                <MapHeader
                  title={client.title}
                  subtitle={client.subtitle || client.name}
                  onPlayJourney={handleStartJourney}
                  backgroundMusicUrl={client.background_music_url}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((m) => !m)}
                  onShare={() => setShowShareModal(true)}
                  onExplore={handleTogglePanel}
                  showExplore={!!selectedLocation}
                />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 1.2, delay: isFirstReveal.current ? 8 : 4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[40]"
            >
              <TimelineBar
                locations={locations}
                activeLocationId={selectedLocation?.id}
                onLocationSelect={handleLocationSelect}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Journey timeline (slides up when started) ─────────────────────── */}
      <AnimatePresence>
        {isJourneyStarted && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[55]"
          >
            <TimelineBar
              locations={locations}
              activeLocationId={locations[currentJourneyIndex]?.id}
              onLocationSelect={(loc) => {
                const idx = locations.findIndex((l) => l.id === loc.id);
                if (idx !== -1) {
                  setCurrentJourneyIndex(idx);
                }
              }}
              isJourneyStarted
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arrival flash vignette ────────────────────────────────────────── */}
      <AnimatePresence>
        {isJourneyStarted && showArrivalFlash && (
          <motion.div
            key={`flash-${currentJourneyIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.85, ease: 'easeOut', times: [0, 0.25, 1] }}
            className="fixed inset-0 z-[53] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(245,197,66,0.18) 0%, rgba(0,0,0,0.7) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Cinematic text overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isJourneyStarted && showOverlay && locations[currentJourneyIndex] && (() => {
          const loc = locations[currentJourneyIndex];
          const words = loc.location_name.split(' ');
          return (
            <motion.div
              key={`overlay-${currentJourneyIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 flex flex-col items-center justify-start pt-24 md:pt-32 z-[52] pointer-events-none"
            >
              {/* Subtle gradient backdrop so text reads cleanly */}
              <div
                className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
              />

              {/* Word-by-word stagger with blur-to-sharp entrance */}
              <h2 className="relative flex flex-wrap justify-center gap-x-3 gap-y-1 px-6 max-w-3xl">
                {words.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                        className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-2xl leading-tight tracking-tight italic"
                      >
                        {word}
                      </motion.span>

                  ))}
                </h2>

                  {/* Subtext (title) — fades in after title completes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: words.length * 0.12 + 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex items-center gap-2.5 mt-4"
                  >
                    <span className="text-white/80 text-sm md:text-lg font-medium drop-shadow-lg">
                      {loc.title}
                    </span>
                  </motion.div>

              </motion.div>
            );
          })()}
        </AnimatePresence>

      {/* ── Flashy Explore hint (appears after camera lands) ──────────────── */}
      <AnimatePresence>
        {isJourneyStarted && showExploreHint && !isPanelOpen && (
          <>
            {/* ── Mobile: centered above timeline ─────────────────────────── */}
            <motion.div
              key={`explore-hint-mobile-${currentJourneyIndex}`}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 10 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 -translate-x-1/2 z-[65] pointer-events-auto md:hidden"
              style={{ bottom: '22%' }}
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-[#f5c542]/40 blur-xl"
                />
                <motion.button
                  onClick={handleTogglePanel}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  className="relative flex flex-col items-center gap-1 px-9 py-4 rounded-full text-sm font-black tracking-[0.2em] uppercase text-[#0a0a0f] bg-[#f5c542] shadow-[0_0_36px_rgba(245,197,66,0.55)] overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                  />
                  <span className="relative">Explore</span>
                  <span className="relative text-[9px] font-bold text-[#0a0a0f]/55 tracking-[0.1em] -mt-0.5">Tap to view story</span>
                </motion.button>
              </div>
            </motion.div>

            {/* ── Desktop: bottom-right pill pointing toward the panel ─────── */}
            <motion.div
              key={`explore-hint-desktop-${currentJourneyIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-8 bottom-32 z-[65] pointer-events-auto hidden md:block"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0.08, 0.45] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-2xl bg-[#f5c542]/30 blur-lg"
                />
                <motion.button
                  onClick={handleTogglePanel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-black tracking-[0.18em] uppercase text-[#0a0a0f] bg-[#f5c542] shadow-[0_0_32px_rgba(245,197,66,0.5)] overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                  />
                  <svg className="relative w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <span className="relative">Explore</span>
                  {/* Arrow pointing right toward panel */}
                  <motion.svg
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-4 h-4 shrink-0"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Map canvas ────────────────────────────────────────────────────── */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
      <div className="map-vignette" />

      {/* ── Style Loading Progress ────────────────────────────────────────── */}
      <AnimatePresence>
        {loadProgress < 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-1 z-[100] bg-white/10"
          >
            <motion.div
              className="h-full bg-[#f5c542] shadow-[0_0_10px_rgba(245,197,66,0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compass / Reset View ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showReset && !showIntro && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-[40] flex flex-col gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!mapRef.current) return;
                mapRef.current.easeTo({
                  bearing: 0,
                  pitch: isJourneyStarted ? 45 : 0,
                  duration: 1000,
                  easing: (t) => t * (2 - t)
                });
              }}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#f5c542] shadow-xl group"
              title="Reset View"
            >
              <div ref={compassRef}>
                <Compass className="w-5 h-5" />
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ opacity: 1, x: 25 }}
                className="absolute left-full ml-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] uppercase tracking-widest text-white whitespace-nowrap pointer-events-none"
              >
                Reset Orientation
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Audio elements ────────────────────────────────────────────────── */}
      {client.background_music_url && <audio ref={introAudioRef} src={client.background_music_url} loop />}
      {client.journey_music_url && <audio ref={journeyAudioRef} src={client.journey_music_url} loop />}

      {/* ── Interaction block during cinematic intro ─────────────────────── */}
      {isInteractingBlocked && <div className="fixed inset-0 z-[90] cursor-wait" />}

      {/* ── Journey player controls ───────────────────────────────────────── */}
        <JourneyPlayer
          locations={locations}
          mapRef={mapRef}
          isStarted={isJourneyStarted}
          currentIndex={currentJourneyIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onStop={handleStopJourney}
          onCameraLanded={() => {/* orbit already started inside JourneyPlayer */}}
        />

      {/* ── Location panel ────────────────────────────────────────────────── */}
        <LocationPanel
          location={selectedLocation}
          media={media}
          isOpen={isPanelOpen}
          onClose={() => {
            setIsPanelOpen(false);
            if (!isJourneyStarted) setSelectedLocation(null);
          }}
          currentIndex={currentIndex}
          totalLocations={locations.length}
          isJourneyPlaying={isJourneyStarted}
        />

      {/* ── Share modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 z-[101] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Share Journey</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard', {
                        description: 'You can now share your journey anywhere.',
                      });
                    }}
                    className="flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group gap-4 cursor-pointer"
                  >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#f5c542]/20 transition-colors">
                      <Copy className="w-5 h-5 text-[#f5c542]" />
                    </div>
                    <span className="text-white font-medium">Copy Link</span>
                  </button>
                  <button
                    onClick={() => {
                      const t = encodeURIComponent(`Check out ${client.title} - A Digital Journey: ${window.location.href}`);
                      window.open(`https://wa.me/?text=${t}`, '_blank');
                    }}
                    className="flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group gap-4 cursor-pointer"
                  >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#25D366]/20 transition-colors">
                      <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-white font-medium">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      const t = encodeURIComponent(`Check out ${client.title} - A Digital Journey`);
                      const u = encodeURIComponent(window.location.href);
                      window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, '_blank');
                    }}
                    className="flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group gap-4 cursor-pointer"
                  >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#1DA1F2]/20 transition-colors">
                      <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    </div>
                    <span className="text-white font-medium">Twitter / X</span>
                  </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
