'use client';

import { useState } from 'react';
import {
  MapPin,
  Calendar,
  GripVertical,
  Settings,
  Trash2,
  Upload,
  Loader2,
  X,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import type { Location, Media } from '@/lib/types';
import { ICON_MAP } from './icon-map';

interface LocationCardProps {
  location: Location;
  media: Media[];
  uploadingId: string | null;
  onEdit: (location: Location) => void;
  onDelete: (locationId: string) => void;
  onUploadMedia: (locationId: string, files: FileList | null) => void;
  onDeleteMedia: (mediaId: string, url: string) => void;
}

export default function LocationCard({
  location,
  media,
  uploadingId,
  onEdit,
  onDelete,
  onUploadMedia,
  onDeleteMedia,
}: LocationCardProps) {
  const IconConfig = ICON_MAP[location.icon_type || 'home'] || ICON_MAP.home;
  const Icon = IconConfig.icon;
  const locationMedia = media.filter((m) => m.location_id === location.id);
  const isUploading = uploadingId === location.id;

  return (
    <div className="group bg-[#111116] border border-white/5 hover:border-[#f5c542]/30 rounded-2xl p-6 transition-all duration-300 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-white/10 group-hover:text-white/20 transition-colors cursor-default">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 bg-[#0a0a0f] rounded-xl flex items-center justify-center text-[#f5c542] font-bold border border-white/10 group-hover:border-[#f5c542]/20 transition-all shadow-inner">
            {location.sort_order}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-[#f5c542] transition-colors truncate">{location.title}</h3>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/5">
              <Icon className="w-3 h-3" />
              {IconConfig.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/20" />
              <span className="font-medium">{location.location_name}</span>
            </div>
            {(location.date_from || location.date_to) && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-white/20" />
                <span className="font-medium">
                  {location.date_from && location.date_to
                    ? `${location.date_from} — ${location.date_to}`
                    : location.date_from || location.date_to}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => onEdit(location)}
            className="p-3 bg-white/5 hover:bg-[#f5c542]/10 text-white/60 hover:text-[#f5c542] rounded-xl border border-white/5 hover:border-[#f5c542]/20 transition-all"
            title="Edit Location"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(location.id)}
            className="p-3 bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-500 rounded-xl border border-white/5 hover:border-red-500/20 transition-all"
            title="Delete Location"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Section */}
      <div className="pt-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white/60">
            <ImageIcon className="w-4 h-4" />
            <span>Location Media</span>
          </div>
          
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => onUploadMedia(location.id, e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <button
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#f5c542]/10 hover:bg-[#f5c542]/20 text-[#f5c542] text-xs font-bold rounded-lg transition-all border border-[#f5c542]/20"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {locationMedia.map((m) => (
            <div 
              key={m.id} 
              className="group/item relative aspect-square bg-[#0a0a0f] rounded-lg border border-white/5 overflow-hidden"
            >
              {m.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Video className="w-8 h-8 text-[#f5c542]" />
                </div>
              ) : (
                <img 
                  src={m.url} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" 
                />
              )}
              <button
                onClick={() => onDeleteMedia(m.id, m.url)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 text-white rounded-md opacity-0 group-hover/item:opacity-100 transition-all backdrop-blur-sm"
                title="Delete media"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
