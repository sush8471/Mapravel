"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Instagram, MapPin } from "lucide-react";

const WA_LINK =
  "https://wa.me/917752000000?text=Hi%20I%20want%20to%20get%20my%20Mapravel%20journey%20created";

export function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-32 overflow-hidden bg-[#07070d]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full bg-[#f5c542]/6 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(245,197,66,0.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 text-[#f5c542]/60 text-sm">
            <div className="w-8 h-px bg-[#f5c542]/40" />
            Start Today
            <div className="w-8 h-px bg-[#f5c542]/40" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Ready To Map
            <br />
            Your Journey?
          </h2>

          <p className="text-gray-400 text-base max-w-md mx-auto">
            Every life is a story worth telling. Let us turn yours into
            something you'll treasure forever.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-[#f5c542] text-[#0a0a0f] font-semibold px-10 py-4 rounded-full text-base hover:bg-[#f5c542]/90 hover:shadow-[0_0_40px_rgba(245,197,66,0.4)] transition-all duration-200"
            >
              Get Started on WhatsApp
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </motion.div>

          <p className="text-xs text-gray-600">
            Starting at ₹1,999 · No account needed · Delivered in 3–7 days
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c542]/10 to-transparent" />
    </section>
  );
}

export function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050508] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#f5c542]" />
              <span className="text-lg font-bold text-white tracking-tight">
                Mapravel
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Plot Your Life
            </p>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[220px]">
              Turning memories into cinematic map experiences since 2025.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Examples", href: "#demo" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Connect
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Instagram size={15} />
              Instagram
            </a>
            <div className="pt-1">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#f5c542]/70 hover:text-[#f5c542] transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © 2025 Mapravel. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Crafted with care for every journey.
          </p>
        </div>
      </div>
    </footer>
  );
}
