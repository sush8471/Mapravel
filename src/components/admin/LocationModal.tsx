'use client';

import { Loader2, MapPin, Save, X, ExternalLink, Settings } from 'lucide-react';
import DatePicker from './DatePicker';
import { ICON_MAP } from './icon-map';
import type { EditingLocation } from '@/lib/admin-types';

interface LocationModalProps {
  editingLocation: EditingLocation;
  isOpen: boolean;
  isSaving: boolean;
  onChange: (updated: EditingLocation) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function LocationModal({
  editingLocation,
  isOpen,
  isSaving,
  onChange,
  onSave,
  onClose,
}: LocationModalProps) {
  if (!isOpen) return null;

  const update = (field: keyof EditingLocation, value: string | number) => {
    onChange({ ...editingLocation, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111116] border border-white/10 rounded-2xl max-w-2xl w-full my-4 md:my-8 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f5c542]/10 rounded-lg">
              <MapPin className="w-5 h-5 text-[#f5c542]" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {editingLocation.id ? 'Edit Location Milestone' : 'Add Journey Milestone'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Milestone Title *</label>
              <input
                required
                type="text"
                placeholder="e.g., The College Years"
                value={editingLocation.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all placeholder:text-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Location Name *</label>
              <input
                required
                type="text"
                placeholder="e.g., Jaipur, India"
                value={editingLocation.location_name}
                onChange={(e) => update('location_name', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Latitude *</label>
              <input
                required
                type="number"
                step="any"
                placeholder="e.g., 26.9124"
                value={editingLocation.latitude}
                onChange={(e) => update('latitude', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all placeholder:text-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Longitude *</label>
              <input
                required
                type="number"
                step="any"
                placeholder="e.g., 75.7873"
                value={editingLocation.longitude}
                onChange={(e) => update('longitude', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Tip: Find exact coordinates for any address at{' '}
              <a href="https://www.latlong.net" target="_blank" className="text-[#f5c542] hover:text-[#e5b532] font-medium transition-colors">latlong.net</a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 ml-1">Description</label>
            <textarea
              rows={3}
              placeholder="Share a story about this milestone..."
              value={editingLocation.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all resize-none placeholder:text-white/20"
            />
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Date From</label>
              <DatePicker
                value={editingLocation.date_from}
                onChange={(val) => update('date_from', val)}
                placeholder="e.g., Jan 2018"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Date To</label>
              <DatePicker
                value={editingLocation.date_to}
                onChange={(val) => update('date_to', val)}
                placeholder="e.g., Jun 2022"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Timeline Sort Order</label>
              <input
                type="number"
                value={editingLocation.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Icon Type</label>
              <div className="relative">
                <select
                  value={editingLocation.icon_type}
                  onChange={(e) => update('icon_type', e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all appearance-none cursor-pointer"
                >
                  {Object.entries(ICON_MAP).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              disabled={isSaving}
              type="submit"
              className="flex-[2] flex items-center justify-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] disabled:opacity-50 text-black font-bold px-12 py-4 rounded-xl transition-all shadow-lg shadow-[#f5c542]/10 active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Save Milestone</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
