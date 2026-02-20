'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    
    // Check auth
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      const auth = localStorage.getItem('dacharacterz-admin') === 'true' || 
                   document.cookie.includes('dacharacterz-admin=true');
      
      if (!auth) {
        setIsAuthenticated(false);
        router.push('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('dacharacterz-admin');
    document.cookie = 'dacharacterz-admin=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  };

  // Prevent flash and ensure all hooks are always called
  if (!isMounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#f5c542] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#f5c542] font-medium tracking-widest text-xs uppercase animate-pulse">
          Secure Access...
        </p>
      </div>
    );
  }

  // Handle Login separately to keep the main layout tree stable
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0a0a0f]">{children}</div>;
  }

  // Final Sidebar Layout
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex font-sans text-white">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#111116] border-r border-white/5 z-50">
        <div className="p-6">
          <Link href="/admin/clients" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#f5c542] rounded-lg flex items-center justify-center font-bold text-black text-xl group-hover:scale-110 transition-transform">
              D
            </div>
            <span className="text-[#f5c542] font-bold text-lg tracking-tight">
              Da Characterz
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#f5c542]/10 text-[#f5c542]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111116] border-b border-white/5 flex items-center justify-between px-6 z-[60]">
        <Link href="/admin/clients" className="text-[#f5c542] font-bold text-lg">
          Da Characterz
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/60 hover:text-white bg-white/5 rounded-lg"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay & Aside */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-[280px] bg-[#111116] z-50 flex flex-col border-r border-white/5"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[#f5c542] font-bold text-lg">Da Characterz</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/40">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg transition-colors ${
                        isActive 
                          ? 'bg-[#f5c542]/10 text-[#f5c542]' 
                          : 'text-white/60'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-4 text-red-400 bg-red-400/5 rounded-xl"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-lg">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-24 md:pt-10">
          <div className="max-w-7xl mx-auto" key={pathname}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
