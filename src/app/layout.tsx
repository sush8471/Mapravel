import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/map.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "sonner";
import { PWARegistration } from "@/components/PWARegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Digital Journey",
    template: "%s | Digital Journey",
  },
  description: "Interactive cinematic journey maps for modern storytellers.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Digital Journey',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[#0a0a0f] text-white`}
          >
            {children}
            <Toaster position="top-right" richColors theme="dark" />
            <VisualEditsMessenger />
          </body>

    </html>
  );
}
