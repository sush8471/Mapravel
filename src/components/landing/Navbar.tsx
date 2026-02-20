"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Examples", href: "#demo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out w-[calc(100%-2rem)] max-w-5xl rounded-2xl ${
              scrolled
                ? "bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-0"
                : "bg-transparent py-2 border border-transparent"
            }`}
          >
            <div className="px-6 h-16 flex items-center justify-between relative">
              {/* Scroll Progress Indicator */}
              {scrolled && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#f5c542]/40 to-transparent"
                />
              )}
            
            {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1 group"
          >
            <span className="text-xl font-bold tracking-tight text-white">
              M
              <span className="relative inline-block">
                a
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#f5c542]" />
              </span>
              pravel
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/917752000000?text=Hi%20I%20want%20to%20get%20my%20Mapravel%20journey%20created",
                  "_blank"
                )
              }
              className="text-sm font-semibold bg-[#f5c542] text-[#0a0a0f] px-5 py-2 rounded-full hover:bg-[#f5c542]/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,197,66,0.3)] cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-6 py-6 flex flex-col gap-6"
          >
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-base text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                window.open(
                  "https://wa.me/917752000000?text=Hi%20I%20want%20to%20get%20my%20Mapravel%20journey%20created",
                  "_blank"
                );
              }}
              className="text-sm font-semibold bg-[#f5c542] text-[#0a0a0f] px-5 py-3 rounded-full hover:bg-[#f5c542]/90 transition-all duration-200 text-center cursor-pointer"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
