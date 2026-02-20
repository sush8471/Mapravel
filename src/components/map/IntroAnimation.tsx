'use client';

import { useEffect, useState } from 'react';
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
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const characters = title.split('');

  const handleEnter = () => {
    setIsVisible(false);
    if (onStartRevealing) onStartRevealing();
    // Wait for exit animation to complete before unmounting
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] text-center px-5 md:px-6"
        >
          <div className="max-w-2xl w-full">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight pb-2 leading-tight"
            >
              {characters.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.5,
                    ease: 'easeOut'
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: characters.length * 0.05 + 0.5, duration: 0.8 }}
              className="flex flex-col items-center gap-3 md:gap-4"
            >
              <p className="text-base md:text-xl text-gray-400 font-light tracking-widest uppercase">
                {subtitle}
              </p>
              <div className="w-12 h-[1px] bg-[#f5c542]/50" />
            </motion.div>
          </div>
          
            <AnimatePresence>
              {!showButton && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                  <div className="w-[1px] h-10 md:h-12 bg-gradient-to-b from-transparent to-[#f5c542]" />
                  <span className="text-[9px] md:text-[10px] text-[#f5c542] uppercase tracking-[0.3em]">Revealing Journey</span>
                </motion.div>
              )}
            </AnimatePresence>

          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 px-8 md:px-10 py-3.5 md:py-4 bg-white text-black rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#f5c542] transition-colors shadow-2xl z-[110] whitespace-nowrap"
              >
                Enter Journey
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
