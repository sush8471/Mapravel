"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

export default function Demo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="demo" className="py-28 bg-[#07070d] relative overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-block w-8 h-px bg-[#f5c542] mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Experience A Journey
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            See exactly what your clients and loved ones will experience.
          </p>
        </motion.div>

        {/* Preview frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#f5c542]/20 to-transparent blur-xl pointer-events-none" />
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#f5c542]/10 to-[#f5c542]/0 pointer-events-none" />

          {/* Browser chrome */}
          <div className="relative bg-[#111118] rounded-2xl border border-white/8 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Browser bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d14]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4 bg-[#1a1a24] rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                mapravel.com/map/ritik-2026
              </div>
              <ArrowUpRight size={14} className="text-gray-600" />
            </div>

            {/* Iframe */}
            <div className="relative aspect-[16/9]">
              <iframe
                src="/map/ritik-2026"
                className="w-full h-full border-0"
                title="Mapravel Journey Preview"
                loading="lazy"
              />
              {/* Overlay to prevent interaction with iframe, allow clicking through */}
              <div className="absolute inset-0 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* CTA below */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.open("/map/ritik-2026", "_blank")}
            className="group inline-flex items-center gap-2 border border-[#f5c542]/30 text-[#f5c542] text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#f5c542]/10 hover:border-[#f5c542]/60 transition-all duration-200 cursor-pointer"
          >
            Explore This Map
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </button>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />
    </section>
  );
}
