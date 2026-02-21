"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    emoji: "🗺️",
    title: "Interactive Dark Map",
    desc: "Your journey on a stunning cinematic world map — dark, immersive, and beautiful.",
  },
  {
    emoji: "✈️",
    title: "Cinematic Fly-Through",
    desc: "Auto-play journey mode that flies between your chapters like a movie.",
  },
  {
    emoji: "📸",
    title: "Photo Galleries",
    desc: "Beautiful photo collections for every chapter of your story.",
  },
  {
    emoji: "🎵",
    title: "Background Music",
    desc: "Set the mood with ambient music that plays throughout your journey.",
  },
  {
    emoji: "📱",
    title: "Mobile Friendly",
    desc: "Looks stunning and works perfectly on every device.",
  },
  {
    emoji: "🔗",
    title: "Shareable Link",
    desc: "One unique link to share your entire life story with the world.",
  },
];

function FeatureCard({
  f,
  index,
}: {
  f: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: "easeOut" }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(245,197,66,0.15)",
        transition: { duration: 0.25 } 
      }}
      className="group bg-[#111116] border border-white/5 rounded-2xl p-7 flex flex-col gap-5 hover:border-[#f5c542]/40 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#f5c542]/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-[#f5c542]/10 transition-colors" />
      
      <motion.span 
        whileHover={{ scale: 1.25, rotate: 12 }}
        className="text-4xl w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-[#f5c542]/10 transition-colors"
      >
        {f.emoji}
      </motion.span>
      <div className="space-y-2 relative z-10">
        <h3 className="text-lg font-bold text-white group-hover:text-[#f5c542] transition-colors">
          {f.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
          {f.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-28 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block w-8 h-px bg-[#f5c542] mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            What Makes Mapravel Special
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Every detail crafted to make your journey unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
