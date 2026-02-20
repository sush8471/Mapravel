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
            <div key={i} className="bg-[#111116] border border-white/5 rounded-2xl p-6 h-[260px] animate-pulse"></div>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="group bg-[#111116] border border-white/5 hover:border-[#f5c542]/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-[#f5c542] transition-colors leading-tight">
                    {client.name}
                  </h3>
                  <p className="text-white/30 text-xs font-mono mt-0.5 truncate uppercase tracking-tighter">/map/{client.slug}</p>
                </div>
                {client.is_published ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
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

              <div className="space-y-3 mb-8 mt-2">
                <div className="flex items-center gap-3 text-white/40 text-sm font-medium">
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{getClientLocationCount(client.id)} Milestones</span>
                </div>
                <div className="flex items-center gap-3 text-white/40 text-sm font-medium">
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>
                    {client.created_at ? format(new Date(client.created_at), 'MMM d, yyyy') : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-5 border-t border-white/5">
                <Link 
                  href={`/admin/clients/${client.id}`}
                  className="flex-[2] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5 hover:border-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Configure</span>
                </Link>
                <Link 
                  href={`/map/${client.slug}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f5c542]/10 hover:bg-[#f5c542]/20 text-[#f5c542] font-bold py-3 rounded-xl transition-all border border-[#f5c542]/10 hover:border-[#f5c542]/20 group/btn"
                  title="View Live Map"
                >
                  <Globe className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  <span className="sr-only md:not-sr-only md:text-xs uppercase">Live</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#111116] border border-dashed border-white/10 rounded-2xl animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <Users className="w-10 h-10 text-white/10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No journey maps found</h2>
          <p className="text-white/40 max-w-xs mb-10 leading-relaxed">
            {searchTerm ? `No clients match your search "${searchTerm}"` : "You haven't created any client journey maps yet."}
          </p>
          <Link 
            href="/admin/clients/new"
            className="bg-[#f5c542] hover:bg-[#e5b532] text-black font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-[#f5c542]/10"
          >
            Create Your First Map
          </Link>
        </div>
      )}
    </div>
  );
}
