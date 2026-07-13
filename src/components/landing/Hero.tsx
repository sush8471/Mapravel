"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";

export default function Hero() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,197,66,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,66,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-[#f5c542]/5 blur-[120px]" />
      </div>

      {/* Subtle dot-map world illustration */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified continent outlines */}
          <ellipse cx="200" cy="250" rx="120" ry="80" fill="white" opacity="0.4" />
          <ellipse cx="280" cy="340" rx="80" ry="60" fill="white" opacity="0.4" />
          <ellipse cx="550" cy="200" rx="180" ry="100" fill="white" opacity="0.4" />
          <ellipse cx="650" cy="320" rx="60" ry="80" fill="white" opacity="0.4" />
          <ellipse cx="820" cy="230" rx="90" ry="70" fill="white" opacity="0.4" />
          <ellipse cx="950" cy="280" rx="100" ry="60" fill="white" opacity="0.4" />
          <ellipse cx="1050" cy="200" rx="80" ry="55" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-[#f5c542]/10 border border-[#f5c542]/20 text-[#f5c542] text-xs font-medium px-4 py-1.5 rounded-full mb-8"
        >
          <Globe size={12} />
          Cinematic Journey Maps
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.2,
              },
            },
          }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
        >
          {["Your", "Life", "Is", "A"].map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="relative inline-block"
          >
            <span className="text-[#f5c542]">Journey.</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-2 left-0 right-0 h-1 bg-[#f5c542]/30 origin-left rounded-full"
            />
          </motion.span>
          <br />
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="inline-block"
          >
            We Map It.
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          We turn your travels, milestones, and memories into a stunning
          interactive map website you can share with the world.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <button
            onClick={() => scrollTo("#pricing")}
            className="group flex items-center gap-2 bg-[#f5c542] text-[#0a0a0f] font-semibold px-8 py-3.5 rounded-full hover:bg-[#f5c542]/90 transition-all duration-200 hover:shadow-[0_0_30px_rgba(245,197,66,0.35)] text-sm cursor-pointer"
          >
            Get Your Map
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => window.open("/map/ritik-2026", "_blank")}
            className="flex items-center gap-2 border border-[#f5c542]/40 text-[#f5c542] font-semibold px-8 py-3.5 rounded-full hover:bg-[#f5c542]/10 hover:border-[#f5c542]/70 transition-all duration-200 text-sm cursor-pointer"
          >
            See Example
          </button>
        </motion.div>

        {/* Price hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-xs text-gray-600"
        >
          Starting at ₹1,999 &nbsp;·&nbsp; Delivered in 3–7 days
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-transparent via-[#f5c542]/50 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
