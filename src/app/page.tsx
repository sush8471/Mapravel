import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Demo from "@/components/landing/Demo";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import { CTA, Footer } from "@/components/landing/CTAFooter";

export const metadata = {
  title: "Mapravel — Your Life Is A Journey. We Map It.",
  description:
    "Mapravel creates cinematic, interactive map-based journey websites. Share your story, locations, and photos — we craft a beautiful interactive map website you can share with the world.",
};

export default function Home() {
  return (
    <main className="bg-[#0a0a0f] min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Demo />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
