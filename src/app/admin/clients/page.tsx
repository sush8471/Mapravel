'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, Location } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit2, 
  ExternalLink, 
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  Users,
  Eye,
  LayoutDashboard,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, locationsRes, viewsRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('locations').select('id, client_id'),
        supabase.from('page_views').select('*', { count: 'exact', head: true })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (locationsRes.error) throw locationsRes.error;

      setClients(clientsRes.data || []);
      setLocations(locationsRes.data || []);
      setTotalViews(viewsRes.count || 0);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getClientLocationCount = (clientId: string) => {
    return locations.filter(loc => loc.client_id === clientId).length;
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { 
      label: 'Total Clients', 
      value: clients.length, 
      icon: Users, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10' 
    },
    { 
      label: 'Published Maps', 
      value: clients.filter(c => c.is_published).length, 
      icon: CheckCircle2, 
      color: 'text-green-400', 
      bg: 'bg-green-400/10' 
    },
    { 
      label: 'Total Page Views', 
      value: totalViews, 
      icon: Eye, 
      color: 'text-[#f5c542]', 
      bg: 'bg-[#f5c542]/10' 
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#f5c542]" />
            Dashboard
          </h1>
          <p className="text-white/40 mt-1">Real-time overview of your journey maps.</p>
        </div>
        <Link 
          href="/admin/clients/new"
          className="flex items-center justify-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] text-black font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-[#f5c542]/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Client</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#111116] border border-white/5 rounded-2xl animate-pulse"></div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-[#111116] border border-white/5 rounded-2xl p-6 flex items-center gap-5 group hover:border-white/10 transition-colors"
            >
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#f5c542] transition-colors" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111116] border border-white/5 rounded-xl px-12 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#f5c542]/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#111116] border border-white/5 rounded-2xl p-6 h-[260px] animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClients.map((client) => (
            <motion.div 
              key={client.id}
              variants={item}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group bg-[#111116] border border-white/5 hover:border-[#f5c542]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5c542]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#f5c542]/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-[#f5c542] transition-colors leading-tight">
                    {client.name}
                  </h3>
                  <p className="text-white/30 text-[10px] font-mono mt-0.5 truncate uppercase tracking-widest">/map/{client.slug}</p>
                </div>
                {client.is_published ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 className="w-3 h-3" />
                    Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                    <Circle className="w-3 h-3" />
                    Draft
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-8 mt-2 relative z-10">
                <div className="flex items-center gap-3 text-white/40 text-sm font-medium group-hover:text-white/60 transition-colors">
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-[#f5c542]/10 transition-colors">
                    <MapPin className="w-4 h-4 group-hover:text-[#f5c542] transition-colors" />
                  </div>
                  <span>{getClientLocationCount(client.id)} Milestones</span>
                </div>
                <div className="flex items-center gap-3 text-white/40 text-sm font-medium group-hover:text-white/60 transition-colors">
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-[#f5c542]/10 transition-colors">
                    <Calendar className="w-4 h-4 group-hover:text-[#f5c542] transition-colors" />
                  </div>
                  <span>
                    {client.created_at ? format(new Date(client.created_at), 'MMM d, yyyy') : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-5 border-t border-white/5 relative z-10">
                <Link 
                  href={`/admin/clients/${client.id}`}
                  className="flex-[2] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5 hover:border-white/10 hover:shadow-lg active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Configure</span>
                </Link>
                <Link 
                  href={`/map/${client.slug}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f5c542]/5 hover:bg-[#f5c542]/10 text-[#f5c542] font-bold py-3 rounded-xl transition-all border border-[#f5c542]/10 hover:border-[#f5c542]/20 group/btn active:scale-95"
                  title="View Live Map"
                >
                  <Globe className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  <span className="sr-only md:not-sr-only md:text-[10px] uppercase tracking-widest">View</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-4 text-center bg-[#111116] border border-dashed border-white/10 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5c542]/5 to-transparent pointer-events-none" />
          <div className="w-24 h-24 bg-[#f5c542]/5 rounded-3xl flex items-center justify-center mb-8 border border-[#f5c542]/10 relative rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 bg-[#f5c542]/20 blur-3xl rounded-full opacity-20 animate-pulse"></div>
            <Users className="w-12 h-12 text-[#f5c542]/40" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">No journey maps found</h2>
          <p className="text-white/40 max-w-sm mb-12 leading-relaxed text-sm">
            {searchTerm 
              ? `We couldn't find any clients matching "${searchTerm}". Try a different search or clear the filter.` 
              : "Welcome to your command center. You haven't created any client journey maps yet. Ready to start building?"}
          </p>
          <Link 
            href="/admin/clients/new"
            className="group relative bg-[#f5c542] hover:bg-[#e5b532] text-black font-black px-12 py-5 rounded-2xl transition-all shadow-2xl shadow-[#f5c542]/20 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <span className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Journey
            </span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
