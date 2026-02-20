"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Mapravel?",
    a: "Mapravel creates cinematic, interactive map-based journey websites for people. You share your life story, locations, and photos — we craft a beautiful interactive map website where every city becomes a clickable chapter of your life.",
  },
  {
    q: "How long does it take?",
    a: "3–7 days depending on your plan and the amount of content provided. Odyssey plan customers get priority delivery.",
  },
  {
    q: "What do I need to provide?",
    a: "Your story, a list of locations (cities, countries, or coordinates), photos for each stop, and any notes or memories you'd like to include. We'll handle the rest.",
  },
  {
    q: "Can I update my map later?",
    a: "Yes! Each plan includes a set number of revisions. For ongoing updates, simply contact us and we'll make the changes for you.",
  },
  {
    q: "How do I share my map?",
    a: "You get a unique shareable link like mapravel.com/map/your-name. Share it anywhere — social media, messaging apps, email, or embed it on your own website.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. All your data and photos are stored securely on our servers. Your map can be public or private — your choice.",
  },
];

function FaqItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
        open
          ? "border-[#f5c542]/30 bg-[#0f0f18]"
          : "border-white/5 bg-[#0d0d14] hover:border-white/10"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <span
          className={`text-sm font-medium transition-colors ${
            open ? "text-white" : "text-gray-200"
          }`}
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            size={16}
            className={open ? "text-[#f5c542]" : "text-gray-500"}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-[#f5c542]/10 pt-4">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-28 bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-block w-8 h-px bg-[#f5c542] mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <FaqItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
