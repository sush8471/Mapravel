'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  title: string;
  subtitle: string;
  onStartRevealing?: () => void;
  onComplete: () => void;
}

export function IntroAnimation({ title, subtitle, onStartRevealing, onComplete }: IntroAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const words = title.split(' ');

  // Generate ambient gold dust particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 2,
      duration: 8 + Math.random() * 7,
      delay: Math.random() * 5,
    }));
  }, []);

  const handleEnter = () => {
    setIsVisible(false);
    if (onStartRevealing) onStartRevealing();
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] text-center px-5 md:px-6 overflow-hidden"
        >
          {/* Film grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035] z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Subtle radial pulse */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-[1]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(245, 197, 66, 0.03) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating gold dust */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#f5c542] pointer-events-none z-[1]"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                opacity: 0.15,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          <div className="relative z-10 max-w-2xl w-full">
            {/* Title — word stagger with blur + scale gravitas */}
            <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight pb-2 leading-tight">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em]"
                  initial={{ opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  transition={{
                    delay: 0.3 + i * 0.18,
                    duration: 0.7,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle + animated divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + words.length * 0.18 + 0.3, duration: 0.6 }}
              className="flex flex-col items-center gap-3 md:gap-4"
            >
              <motion.p
                className="text-base md:text-xl text-gray-400 font-light tracking-[0.08em] uppercase"
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.08em', opacity: 1 }}
                transition={{
                  delay: 0.3 + words.length * 0.18 + 0.4,
                  duration: 0.8,
                  ease: 'easeOut',
                }}
              >
                {subtitle}
              </motion.p>

              {/* Divider that draws itself from center */}
              <motion.div
                className="h-[1px] bg-[#f5c542]/50 origin-center"
                initial={{ scaleX: 0, width: 48 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.3 + words.length * 0.18 + 0.6,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </motion.div>
          </div>

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ opacity: 1 }}
            onClick={handleEnter}
            className="absolute top-8 right-8 md:top-12 md:right-12 text-[10px] uppercase tracking-[0.2em] text-[#f5c542]/30 hover:text-[#f5c542] transition-all flex items-center gap-2 z-20"
          >
            Skip
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Ghost Enter Journey Button */}
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  delay: 0.3,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEnter}
                className="group absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 px-8 md:px-10 py-3.5 md:py-4 bg-transparent border border-white/15 text-white/70 rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:border-[#f5c542]/40 hover:text-[#f5c542] transition-colors z-[110] whitespace-nowrap overflow-hidden"
              >
                {/* Shimmer sweep */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.2,
                    delay: 0.8,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(245, 197, 66, 0.08), transparent)',
                  }}
                />
                Enter Journey
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
