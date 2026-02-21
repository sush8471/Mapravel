"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Compass, Share2 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Share Your Story",
    desc: "Tell us about your journey — the places, the moments, the memories. A simple form or WhatsApp chat is all it takes.",
  },
  {
    num: "02",
    icon: Compass,
    title: "We Craft Your Map",
    desc: "Our team builds your personalized interactive map with your photos, stories, and cinematic fly-through animations.",
  },
  {
    num: "03",
    icon: Share2,
    title: "Share With The World",
    desc: "Get your unique link. Share it with friends, family, or keep it as your digital memoir — yours forever.",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.25 }
      }}
      className="relative bg-[#0e0e16] border border-white/5 rounded-2xl p-8 flex flex-col gap-5 hover:border-[#f5c542]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <step.icon size={64} className="text-[#f5c542]" />
      </div>

      {/* Number */}
      <span className="text-6xl font-black text-[#f5c542]/10 group-hover:text-[#f5c542]/20 transition-colors leading-none select-none italic">
        {step.num}
      </span>

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#f5c542]/10 flex items-center justify-center">
        <step.icon size={18} className="text-[#f5c542]" />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
      </div>

      {/* Connector line (desktop only) */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-14 -right-px w-px h-8 bg-gradient-to-b from-[#f5c542]/20 to-transparent" />
      )}
    </motion.div>
  );
}

export default function HowItWorks() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-28 bg-[#0a0a0f] relative">
      {/* Subtle section glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#f5c542]/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block w-8 h-px bg-[#f5c542] mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Three simple steps to your cinematic journey map.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
