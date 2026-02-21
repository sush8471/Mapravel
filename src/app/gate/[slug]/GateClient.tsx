'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface GateClientProps {
  slug: string;
  title: string;
  subtitle: string;
}

export function GateClient({ slug, title, subtitle }: GateClientProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const words = title.split(' ');
  const titleDelay = 0.3;
  const formDelay = titleDelay + words.length * 0.09 + 0.5;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), (formDelay + 0.6) * 1000);
    return () => clearTimeout(t);
  }, [formDelay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code: code.trim() }),
      });
      const data = await res.json();

      if (data.ok) {
        setGranted(true);
        // Cookie is already set by the API — redirect to the map
        setTimeout(() => router.push(`/map/${slug}`), 1100);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setError(next >= 3 ? 'Contact your host for access.' : 'Incorrect code.');
        setCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080809] flex items-center justify-center overflow-hidden relative">
      {/* Soft gold radial bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 70%, rgba(245,197,66,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Top hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 inset-x-0 h-px origin-left"
        style={{ background: 'linear-gradient(to right, transparent, rgba(245,197,66,0.18), transparent)' }}
      />

      {/* Gold bloom on success */}
      <AnimatePresence>
        {granted && (
          <motion.div
            key="granted"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.3, 1] }}
            className="fixed inset-0 z-[200] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(245,197,66,0.22) 0%, rgba(0,0,0,0.85) 100%)' }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative flex flex-col items-center w-full px-6" style={{ gap: '2.8rem', maxWidth: '22rem' }}>

        {/* Title block */}
        <div className="text-center space-y-3">
          <h1 className="flex flex-wrap justify-center leading-[1.18]" style={{ gap: '0 0.28em' }}>
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: titleDelay + i * 0.09,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block text-[1.85rem] font-bold text-white tracking-tight"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: titleDelay + words.length * 0.09 + 0.2, duration: 0.9 }}
            className="flex flex-col items-center gap-2.5"
          >
            <span className="text-[9.5px] text-white/30 tracking-[0.36em] uppercase font-light">
              {subtitle}
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: titleDelay + words.length * 0.09 + 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-7 origin-center"
              style={{ background: 'rgba(245,197,66,0.35)' }}
            />
          </motion.div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: formDelay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center gap-3.5"
        >
          {/* Lock mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: formDelay - 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center w-8 h-8 rounded-[10px]"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,66,0.75)" strokeWidth={1.8}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </motion.div>

          {/* Label */}
          <p className="text-[9px] text-white/22 tracking-[0.32em] uppercase -mb-1">
            Access Code
          </p>

          {/* Input */}
          <motion.div
            animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.42 }}
            className="w-full relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="· · · · · · · ·"
              autoComplete="off"
              spellCheck={false}
              maxLength={32}
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${error ? 'rgba(248,113,113,0.35)' : focused ? 'rgba(245,197,66,0.3)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: focused && !error ? '0 0 0 1px rgba(245,197,66,0.12), 0 0 20px rgba(245,197,66,0.05)' : 'none',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              className="w-full rounded-xl px-4 py-[11px] text-white text-center text-[15px] font-mono tracking-[0.32em] placeholder:text-white/10 focus:outline-none"
            />
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="text-[11px] text-red-400/65 tracking-wide -mt-1 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            type="submit"
            disabled={!code.trim() || loading}
            whileHover={code.trim() && !loading ? { scale: 1.025 } : {}}
            whileTap={code.trim() && !loading ? { scale: 0.975 } : {}}
            className="relative w-full overflow-hidden rounded-xl py-[11px] text-[11px] font-bold tracking-[0.24em] uppercase transition-all duration-300"
            style={{
              background: code.trim() && !loading
                ? 'linear-gradient(135deg, #f5c542 0%, #d4a017 100%)'
                : 'rgba(255,255,255,0.05)',
              color: code.trim() && !loading ? '#080809' : 'rgba(255,255,255,0.2)',
              border: code.trim() && !loading ? 'none' : '1px solid rgba(255,255,255,0.06)',
              cursor: !code.trim() || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {/* Shimmer sweep on active */}
            {code.trim() && !loading && (
              <motion.div
                className="absolute inset-0 skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                animate={{ x: ['-150%', '150%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-3.5 h-3.5 rounded-full border-2"
                    style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#080809' }}
                  />
                  Verifying
                </>
              ) : (
                'Enter Journey'
              )}
            </span>
          </motion.button>
        </motion.form>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 4, duration: 1.2 }}
          className="text-[9px] text-white/40 tracking-[0.3em] uppercase text-center"
        >
          Private &amp; Personal Access
        </motion.p>
      </div>
    </div>
  );
}
