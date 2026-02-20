'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    subtitle: '',
    bio: '',
    theme: 'dark_explorer',
    password_protected: true,
    access_password: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            ...formData,
            is_published: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/admin/clients/${data.id}`);
      } catch (error: any) {
        console.error('Error creating client:', error);
        toast.error('Error creating client: ' + error.message);
      } finally {

      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/clients"
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Add New Client</h1>
            <p className="text-white/50 mt-1">Create a new journey map client.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Client Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Ritika Sharma"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">URL Slug</label>
              <input
                required
                type="text"
                placeholder="e.g. ritika-sharma"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Display Title</label>
              <input
                type="text"
                placeholder="e.g. The Journey of Ritika"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Subtitle</label>
              <input
                type="text"
                placeholder="e.g. Across the globe and back"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Bio / Description</label>
            <textarea
              rows={4}
              placeholder="Tell their story..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all resize-none"
            />
          </div>

            {/* Access Code Protection */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Access Code Protection</p>
                  <p className="text-xs text-white/40 mt-0.5">Visitors must enter a code to view this journey</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password_protected: !prev.password_protected }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${formData.password_protected ? 'bg-[#f5c542]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${formData.password_protected ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {formData.password_protected && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Access Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RITIK2026"
                    value={formData.access_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_password: e.target.value.toUpperCase() }))}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Map Theme</label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all appearance-none"
            >
              <option value="dark_explorer">Dark Explorer (Default)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading}
            type="submit"
            className="flex items-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#f5c542]/10 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Create Client</span>
          </button>
        </div>
      </form>
    </div>
  );
}
