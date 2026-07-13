'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface AccessGateProps {
  title: string;
  subtitle: string;
  onAccessGranted: () => void;
  onVerify: (code: string) => Promise<boolean>;
}

export function AccessGate({ title, subtitle, onAccessGranted, onVerify }: AccessGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showCode, setShowCode] = useState(false);
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

    const ok = await onVerify(code.trim());
    setLoading(false);

    if (ok) {
      setGranted(true);
      try { navigator.vibrate(15); } catch {}
      setTimeout(onAccessGranted, 1200);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError(next >= 3 ? 'Contact your host for access.' : 'Incorrect code. Try again.');
      setCode('');
      inputRef.current?.focus();
    }
  };

  const hasInput = code.trim().length > 0;
  const isActive = hasInput && !loading;

  return (
    <AnimatePresence>
      {!granted ? (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(24px)', scale: 1.04 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#0a0a0f' }}
        >
          {/* Depth: radial gradient behind card area */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)',
            }}
          />

          {/* Film grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px 128px',
            }}
          />

          {/* Top hairline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 inset-x-0 h-px origin-left"
            style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2), transparent)' }}
          />

          {/* Content — very spaced out */}
          <div
            className="relative flex flex-col items-center w-full px-8"
            style={{ gap: '3.5rem', maxWidth: '28rem' }}
          >
            {/* ── Title block ── */}
            <div className="text-center flex flex-col items-center" style={{ gap: '1rem' }}>
              <h1 className="flex flex-wrap justify-center leading-[1.1]" style={{ gap: '0 0.22em' }}>
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: titleDelay + i * 0.09,
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block font-semibold text-white tracking-tight"
                    style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: titleDelay + words.length * 0.09 + 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
                style={{ gap: '1rem' }}
              >
                <span className="text-[11px] text-white/45 tracking-[0.08em] uppercase font-normal">
                  {subtitle}
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: titleDelay + words.length * 0.09 + 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-px w-12 origin-center"
                  style={{ background: 'rgba(212,175,55,0.35)' }}
                />
              </motion.div>
            </div>

            {/* ── Form ── */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: formDelay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col items-center"
              style={{ gap: '1.25rem' }}
            >
              {/* Pill input */}
              <motion.div
                animate={shake ? { x: [-7, 7, -5, 5, -3, 3, 0] } : {}}
                transition={{ duration: 0.45 }}
                className="w-full relative"
              >
                <div
                  className="relative flex items-center w-full rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : focused ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: focused && !error
                      ? '0 0 0 1px rgba(212,175,55,0.12), 0 4px 24px rgba(212,175,55,0.06)'
                      : '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {/* Lock icon */}
                  <div
                    className="flex items-center justify-center pl-5 pr-2"
                    style={{
                      color: isActive ? 'rgba(212,175,55,0.75)' : 'rgba(255,255,255,0.3)',
                      transition: 'color 0.25s ease',
                    }}
                  >
                    <Lock size={15} strokeWidth={1.8} />
                  </div>

                  <input
                    ref={inputRef}
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Enter access code"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={32}
                    className="flex-1 bg-transparent py-3.5 text-white text-[15px] font-mono tracking-[0.12em] placeholder:text-white/20 focus:outline-none"
                    style={{
                      caretColor: 'rgba(212,175,55,0.9)',
                    }}
                  />

                  {/* Eye toggle */}
                  <AnimatePresence>
                    {hasInput && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setShowCode((s) => !s)}
                        className="flex items-center justify-center pr-5 pl-2 text-white/30 hover:text-white/65 transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={showCode ? 'off' : 'on'}
                            initial={{ opacity: 0, rotateY: -90, scale: 0.6 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            exit={{ opacity: 0, rotateY: 90, scale: 0.6 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {showCode ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                          </motion.div>
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key={error}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-[12px] text-red-400/80 tracking-wide text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Button: same pill shape as input, transitions between empty/active */}
              <motion.button
                type="submit"
                disabled={!hasInput || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden w-auto rounded-xl px-5 py-2 text-[11px] font-normal tracking-[0.1em] uppercase transition-all duration-400"
                style={{
                  background: isActive
                    ? 'rgba(212,175,55,0.12)'
                    : 'transparent',
                  color: isActive ? 'rgba(212,175,55,0.85)' : 'rgba(255,255,255,0.25)',
                  border: isActive
                    ? '1px solid rgba(212,175,55,0.22)'
                    : '1px solid rgba(255,255,255,0.06)',
                  cursor: !hasInput || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 skew-x-12"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.06), transparent)' }}
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                  />
                )}

                <span className="relative flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-3.5 h-3.5 rounded-full border-2"
                        style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: 'rgba(212,175,55,0.9)' }}
                      />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>{hasInput ? 'Unlock' : 'Enter Code'}</span>
                  )}
                </span>
              </motion.button>
            </motion.form>

            {/* Attempts hint */}
            <AnimatePresence>
              {attempts > 0 && !error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-white/35 tracking-wide text-center"
                >
                  {attempts >= 3 ? 'Too many attempts. Contact your host.' : `Attempt ${attempts}/3`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="granted"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.3, 1] }}
          className="fixed inset-0 z-[200] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.28) 0%, rgba(0,0,0,0.9) 100%)' }}
        />
      )}
    </AnimatePresence>
  );
}
