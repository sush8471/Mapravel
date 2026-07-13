"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const WA_LINK =
  "https://wa.me/917752000000?text=Hi%20I%20want%20to%20get%20my%20Mapravel%20journey%20created";

const tiers = [
  {
    name: "Explorer",
    price: "₹1,999",
    tagline: "Perfect to get started",
    popular: false,
    features: [
      "Up to 5 locations",
      "25 photos",
      "1 theme",
      "Shareable link",
      "1 year hosting",
    ],
  },
  {
    name: "Voyager",
    price: "₹3,999",
    tagline: "Most Popular",
    popular: true,
    features: [
      "Up to 15 locations",
      "75 photos",
      "All themes",
      "Background music",
      "2 year hosting",
      "3 revisions",
    ],
  },
  {
    name: "Odyssey",
    price: "₹6,999",
    tagline: "For the full story",
    popular: false,
    features: [
      "Unlimited locations",
      "Unlimited photos",
      "Custom domain",
      "Priority delivery",
      "Lifetime hosting",
      "Unlimited revisions",
    ],
  },
];

function PricingCard({
  tier,
  index,
}: {
  tier: (typeof tiers)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      whileHover={{ y: tier.popular ? -10 : -5, transition: { duration: 0.2 } }}
      className={`relative flex flex-col rounded-2xl p-8 border transition-all duration-500 group
        ${
          tier.popular
            ? "bg-[#0f0f18] border-[#f5c542]/40 shadow-[0_15px_60px_rgba(245,197,66,0.1)] scale-[1.02] z-10 hover:shadow-[0_25px_80px_rgba(245,197,66,0.15)]"
            : "bg-[#0d0d14] border-white/6 hover:border-[#f5c542]/20"
        }`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-b from-[#f5c542]/5 to-transparent" />
      
        {/* Popular badge */}
        {tier.popular && (
          <>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f5c542] text-[#0a0a0f] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap z-20">
              Most Popular
            </div>
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
            />
          </>
        )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-widest">
          {tier.name}
        </p>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-white">{tier.price}</span>
          <span className="text-gray-500 text-sm mb-1">one-time</span>
        </div>
        <p className="text-xs text-gray-500">{tier.tagline}</p>
      </div>

      {/* Divider */}
      <div
        className={`h-px mb-6 ${
          tier.popular
            ? "bg-gradient-to-r from-transparent via-[#f5c542]/30 to-transparent"
            : "bg-white/5"
        }`}
      />

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-8">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                tier.popular ? "bg-[#f5c542]/20" : "bg-white/8"
              }`}
            >
              <Check
                size={10}
                className={tier.popular ? "text-[#f5c542]" : "text-gray-400"}
              />
            </div>
            <span className="text-sm text-gray-300">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-3 rounded-full text-sm font-semibold text-center transition-all duration-200 cursor-pointer
          ${
            tier.popular
              ? "bg-[#f5c542] text-[#0a0a0f] hover:bg-[#f5c542]/90 hover:shadow-[0_0_25px_rgba(245,197,66,0.3)]"
              : "border border-white/15 text-white hover:border-white/30 hover:bg-white/5"
          }`}
      >
        Get Started
      </a>
    </motion.div>
  );
}

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-28 bg-[#07070d] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />

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
            Choose Your Journey
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            One-time payment. No subscriptions. Your story, yours forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-xs text-gray-600 mt-8"
        >
          All plans include a shareable link and cinematic Mapbox experience.
          Delivered in 3–7 days.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />
    </section>
  );
}
