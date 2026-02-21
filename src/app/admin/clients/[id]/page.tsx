'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Trash2, 
  ExternalLink,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MapPin,
  Plus,
  X,
  Home,
  GraduationCap,
  Briefcase,
  Plane,
  Trophy,
  Calendar,
  GripVertical,
  Milestone,
  Image as ImageIcon,
  Upload,
  XCircle,
  Music,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import Link from 'next/link';
import { Location, Media } from '@/lib/types';
import { toast } from 'sonner';

// ─── Date Picker ─────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Parse "15 Jan 2018" | "Jan 2018" | "2018"
function parseDate(value: string): { day: number | null; month: number | null; year: number | null } {
  if (!value) return { day: null, month: null, year: null };
  const parts = value.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const mi = MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    if (!isNaN(day) && mi !== -1 && !isNaN(year)) return { day, month: mi, year };
  }
  if (parts.length === 2) {
    const mi = MONTHS.indexOf(parts[0]);
    const year = parseInt(parts[1]);
    if (mi !== -1 && !isNaN(year)) return { day: null, month: mi, year };
  }
  if (parts.length === 1) {
    const year = parseInt(parts[0]);
    if (!isNaN(year)) return { day: null, month: null, year };
  }
  return { day: null, month: null, year: null };
}

function formatDate(day: number | null, month: number | null, year: number | null): string {
  if (year === null) return '';
  if (month === null) return String(year);
  if (day === null) return `${MONTHS[month]} ${year}`;
  return `${day} ${MONTHS[month]} ${year}`;
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'year' | 'month' | 'day'>('year');

  const parsed = parseDate(value);

  const [selYear, setSelYear] = useState<number | null>(parsed.year);
  const [selMonth, setSelMonth] = useState<number | null>(parsed.month);
  const [yearPage, setYearPage] = useState(() => {
    const base = parsed.year ?? new Date().getFullYear();
    return Math.floor(base / 12) * 12;
  });

  const ref = useRef<HTMLDivElement>(null);

  // Sync internal state when value changes externally
  useEffect(() => {
    const p = parseDate(value);
    setSelYear(p.year);
    setSelMonth(p.month);
    if (p.year !== null) setYearPage(Math.floor(p.year / 12) * 12);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openPicker = () => {
    setView('year');
    setOpen(true);
  };

  const handleSelectYear = (y: number) => {
    setSelYear(y);
    setYearPage(Math.floor(y / 12) * 12);
    setView('month');
  };

  const handleSelectMonth = (mi: number) => {
    setSelMonth(mi);
    setView('day');
  };

  const handleSelectDay = (day: number) => {
    onChange(formatDate(day, selMonth, selYear));
    setOpen(false);
  };

  const handleYearOnly = () => {
    if (selYear !== null) { onChange(formatDate(null, null, selYear)); setOpen(false); }
  };

  const handleMonthOnly = () => {
    if (selYear !== null && selMonth !== null) { onChange(formatDate(null, selMonth, selYear)); setOpen(false); }
  };

  const years = Array.from({ length: 12 }, (_, i) => yearPage + i);
  const totalDays = selYear !== null && selMonth !== null ? daysInMonth(selYear, selMonth) : 31;
  // day-of-week offset for grid alignment
  const firstDow = selYear !== null && selMonth !== null ? new Date(selYear, selMonth, 1).getDay() : 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
      >
        <Calendar className="w-4 h-4 text-[#f5c542] shrink-0" />
        <span className={value ? 'text-white text-sm' : 'text-white/20 text-sm'}>
          {value || placeholder || 'Select date'}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); setSelYear(null); setSelMonth(null); }}
            className="ml-auto text-white/20 hover:text-white/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-[#111116] border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">

          {/* ── YEAR VIEW ── */}
          {view === 'year' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearPage(p => p - 12)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-sm">{yearPage} – {yearPage + 11}</span>
                <button type="button" onClick={() => setYearPage(p => p + 12)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      selYear === y ? 'bg-[#f5c542] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {selYear !== null && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleYearOnly}
                    className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Use year only ({selYear})
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── MONTH VIEW ── */}
          {view === 'month' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView('year')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('year')}
                  className="text-white font-bold text-sm hover:text-[#f5c542] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  {selYear}
                </button>
                <div className="w-7" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMonth(i)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      selMonth === i && selYear === selYear ? 'bg-[#f5c542] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleMonthOnly}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  Use month only
                </button>
              </div>
            </>
          )}

          {/* ── DAY VIEW ── */}
          {view === 'day' && selYear !== null && selMonth !== null && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView('month')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('month')}
                  className="text-white font-bold text-sm hover:text-[#f5c542] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  {MONTHS_FULL[selMonth]} {selYear}
                </button>
                <div className="w-7" />
              </div>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <span key={d} className="text-center text-[10px] font-bold text-white/20 py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                  const isSelected = parsed.day === day && parsed.month === selMonth && parsed.year === selYear;
                  const isToday = day === new Date().getDate() && selMonth === new Date().getMonth() && selYear === new Date().getFullYear();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#f5c542] text-black font-bold'
                          : isToday
                          ? 'border border-[#f5c542]/40 text-[#f5c542]'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleMonthOnly}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  Use month only
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, { icon: any; label: string }> = {
  home: { icon: Home, label: 'Home' },
  education: { icon: GraduationCap, label: 'Education' },
  work: { icon: Briefcase, label: 'Work' },
  travel: { icon: Plane, label: 'Travel' },
  milestone: { icon: Milestone, label: 'Milestone' },
  achievement: { icon: Trophy, label: 'Achievement' },
  art: { icon: ImageIcon, label: 'Art' },
  music: { icon: Music, label: 'Music' },
  video: { icon: Video, label: 'Video' }
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Locations & Media State
  const [locations, setLocations] = useState<Location[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const [journeyMusicUploading, setJourneyMusicUploading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationDeleting, setLocationDeleting] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        title: '',
        subtitle: '',
        bio: '',
        theme: 'dark_explorer',
        is_published: false,
        password_protected: false,
        access_password: '',
        background_music_url: '',
        journey_music_url: ''
      });

  useEffect(() => {
    fetchClient();
    fetchLocations();
    fetchMedia();
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
          if (data) {
            setFormData({
              name: data.name || '',
              slug: data.slug || '',
              title: data.title || '',
              subtitle: data.subtitle || '',
              bio: data.bio || '',
              theme: data.theme || 'dark_explorer',
              is_published: data.is_published || false,
              password_protected: data.password_protected || false,
              access_password: data.access_password || '',
              background_music_url: data.background_music_url || '',
              journey_music_url: data.journey_music_url || ''
            });
          }
      } catch (error: any) {
        console.error('Error fetching client:', error);
        toast.error('Error fetching client: ' + (error.message || 'Unknown error'));
        router.push('/admin/clients');

    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('client_id', id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('client_id', id);

      if (error) throw error;
      setMedia(data || []);
    } catch (error: any) {
      console.error('Error fetching media:', error);
    }
  };

  const openLocationModal = (location?: any) => {
    if (location) {
      setEditingLocation({
        ...location,
        date_from: location.date_from || '',
        date_to: location.date_to || ''
      });
    } else {
      setEditingLocation({
        title: '',
        location_name: '',
        latitude: '',
        longitude: '',
        description: '',
        date_from: '',
        date_to: '',
        sort_order: (locations.length + 1).toString(),
        icon_type: 'home'
      });
    }
    setShowLocationModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocationSaving(true);

    try {
      const locationData = {
        client_id: id,
        title: editingLocation.title,
        location_name: editingLocation.location_name,
        latitude: parseFloat(editingLocation.latitude),
        longitude: parseFloat(editingLocation.longitude),
        description: editingLocation.description,
        date_from: editingLocation.date_from || null,
        date_to: editingLocation.date_to || null,
        sort_order: parseInt(editingLocation.sort_order) || 0,
        icon_type: editingLocation.icon_type || 'home'
      };

      if (editingLocation.id) {
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editingLocation.id);
        if (error) throw error;
        toast.success('Milestone updated successfully!');
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([locationData]);
        if (error) throw error;
        toast.success('Milestone added successfully!');
      }

      setShowLocationModal(false);
      setEditingLocation(null);
      fetchLocations();
    } catch (error: any) {
      console.error('Save Location Error:', error);
      toast.error( 'Error saving milestone: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setLocationSaving(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;
    setLocationDeleting(true);
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationToDelete);

      if (error) throw error;
      toast.success('Milestone deleted.');
      fetchLocations();
      fetchMedia();
      setLocationToDelete(null);
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast.error( 'Error deleting milestone: ' + (error.message || 'Unknown error'));
    } finally {
      setLocationDeleting(false);
    }
  };

  const handleUploadMusic = async (file: File | null) => {
    if (!file) return;
    setMusicUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `music-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${id}/music/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('clients')
        .update({ background_music_url: publicUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      setFormData(prev => ({ ...prev, background_music_url: publicUrl }));
      toast.success('Background music uploaded!');
    } catch (error: any) {
      console.error('Music Upload Error:', error);
      toast.error( 'Error uploading music: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setMusicUploading(false);
    }
  };

  const handleUploadJourneyMusic = async (file: File | null) => {
    if (!file) return;
    setJourneyMusicUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `journey-music-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${id}/music/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('clients')
        .update({ journey_music_url: publicUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      setFormData(prev => ({ ...prev, journey_music_url: publicUrl }));
      toast.success('Journey music uploaded!');
    } catch (error: any) {
      console.error('Journey Music Upload Error:', error);
      toast.error( 'Error uploading journey music: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setJourneyMusicUploading(false);
    }
  };

  const handleUploadMedia = async (locationId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(locationId);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        
        if (file.size > maxSize) {
          toast.error( `${file.name} is too large. Max ${isVideo ? '50MB for video' : '5MB for images'}.`);
          continue;
        }

        const timestamp = Date.now();
        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : '';
        const nameWithoutExt = nameParts.join('.').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${timestamp}-${nameWithoutExt}${extension ? '.' + extension : ''}`;
        const filePath = `${id}/${locationId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('media')
          .insert([{
            client_id: id,
            location_id: locationId,
            url: publicUrl,
            type: isVideo ? 'video' : 'image'
          }]);

        if (dbError) throw dbError;
      }
    
      fetchMedia();
      toast.success(`${files.length > 1 ? files.length + ' files' : 'File'} uploaded successfully!`);
    } catch (error: any) {
      console.error('Media Upload Error:', error);
      toast.error( 'Upload failed: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteMedia = async (mediaId: string, url: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const pathParts = url.split('/public/media/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('media').remove([filePath]);
      }

      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      fetchMedia();
      toast.success('Media deleted.');
    } catch (error: any) {
      console.error('Error deleting media:', error);
      toast.error( 'Error deleting media: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({ ...formData })
        .eq('id', id);

      if (error) throw error;
      toast.success('Changes saved successfully!');
    } catch (error: any) {
      console.error('Update Error:', error);
      toast.error( 'Error saving: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    const nextState = !formData.is_published;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_published: nextState })
        .eq('id', id);
      
      if (error) throw error;
      setFormData(prev => ({ ...prev, is_published: nextState }));
      toast.success(nextState ? 'Journey published!' : 'Journey unpublished.');
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error( 'Error: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.push('/admin/clients');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error( 'Error deleting client: ' + (error.message || 'Unknown error'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#f5c542] animate-spin" />
        <p className="text-white/40 font-medium">Loading client details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/clients"
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{formData.name}</h1>
              {formData.is_published ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/40 text-xs font-medium rounded-full border border-white/10">
                  <Circle className="w-3 h-3" />
                  Draft
                </span>
              )}
            </div>
            <p className="text-white/50 mt-1">/{formData.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={`/map/${formData.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Map</span>
          </Link>
          <button
            onClick={togglePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              formData.is_published 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            }`}
          >
            {formData.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Settings className="w-5 h-5 text-[#f5c542]" />
            <h2 className="text-xl font-bold text-white">General Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Client Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">URL Slug</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Display Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
          </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Bio / Description</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all resize-none"
              />
            </div>

            {/* Access Code Protection */}
            <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f5c542]/10 rounded-lg">
                    <svg className="w-4 h-4 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Access Code Protection</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Require a password before the client can view their journey</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password_protected: !prev.password_protected }))}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${formData.password_protected ? 'bg-[#f5c542]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${formData.password_protected ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {formData.password_protected && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-medium text-white/50 ml-1 uppercase tracking-wider">Access Code</label>
                    <input
                      type="text"
                      placeholder="e.g., RITIK2026"
                      value={formData.access_password}
                      onChange={(e) => setFormData(prev => ({ ...prev, access_password: e.target.value.toUpperCase() }))}
                      className="w-full bg-[#111116] border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all placeholder:text-white/20 placeholder:font-sans placeholder:tracking-normal"
                    />

                  <p className="text-[10px] text-white/25 ml-1">Share this code privately with {formData.name || 'the client'}. They will enter it on the access screen before seeing their journey.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Map Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all appearance-none"
                >
                  <option value="dark_explorer">Dark Explorer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Intro Music</label>
                <div className="relative group">
                  <div className="flex items-center gap-3 w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white">
                    <Music className="w-5 h-5 text-[#f5c542]" />
                    <span className="text-sm text-white/40 truncate flex-1">
                      {musicUploading ? 'Uploading...' : (formData.background_music_url ? 'Intro Music Uploaded ✓' : 'Upload Intro MP3')}
                    </span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={(e) => handleUploadMusic(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={musicUploading}
                    />
                    {musicUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#f5c542]" />
                    ) : (
                      <Upload className="w-4 h-4 text-white/20 group-hover:text-[#f5c542] transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Journey Music</label>
                <div className="relative group">
                  <div className="flex items-center gap-3 w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white">
                    <Music className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-white/40 truncate flex-1">
                      {journeyMusicUploading ? 'Uploading...' : (formData.journey_music_url ? 'Journey Music Uploaded ✓' : 'Upload Journey MP3')}
                    </span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={(e) => handleUploadJourneyMusic(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={journeyMusicUploading}
                    />
                    {journeyMusicUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-white/20 ml-1">Plays during Play Journey. Fades in/out cinematically.</p>
              </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Client</span>
          </button>

          <button
            disabled={saving}
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-12 py-4 rounded-xl transition-all shadow-lg shadow-[#f5c542]/10 active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* Locations Section */}
      <div className="border-t border-white/5 pt-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f5c542]/10 rounded-lg">
              <MapPin className="w-6 h-6 text-[#f5c542]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Journey Locations</h2>
              <p className="text-white/40 text-sm">Define the milestones of this journey</p>
            </div>
          </div>
          <button
            onClick={() => openLocationModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#f5c542] hover:bg-[#e5b532] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#f5c542]/10 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Location</span>
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="bg-[#111116] border border-dashed border-white/10 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
              <MapPin className="w-8 h-8 text-white/10" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-medium">No locations added yet</p>
              <p className="text-white/40 text-sm max-w-xs mx-auto">Start building the journey by adding the first location marker.</p>
            </div>
            <button
              onClick={() => openLocationModal()}
              className="text-[#f5c542] hover:text-[#e5b532] font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              Add your first location <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {locations.map((loc) => {
              const IconConfig = ICON_MAP[loc.icon_type || 'home'] || ICON_MAP.home;
              const Icon = IconConfig.icon;
              
              return (
                <div 
                  key={loc.id}
                  className="group bg-[#111116] border border-white/5 hover:border-[#f5c542]/30 rounded-2xl p-6 transition-all duration-300 space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-white/10 group-hover:text-white/20 transition-colors cursor-default">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="w-10 h-10 bg-[#0a0a0f] rounded-xl flex items-center justify-center text-[#f5c542] font-bold border border-white/10 group-hover:border-[#f5c542]/20 transition-all shadow-inner">
                        {loc.sort_order}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#f5c542] transition-colors truncate">{loc.title}</h3>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/5">
                          <Icon className="w-3 h-3" />
                          {IconConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-white/20" />
                          <span className="font-medium">{loc.location_name}</span>
                        </div>
                        {(loc.date_from || loc.date_to) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-white/20" />
                            <span className="font-medium">
                              {loc.date_from && loc.date_to
                                ? `${loc.date_from} — ${loc.date_to}`
                                : loc.date_from || loc.date_to}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openLocationModal(loc)}
                        className="p-3 bg-white/5 hover:bg-[#f5c542]/10 text-white/60 hover:text-[#f5c542] rounded-xl border border-white/5 hover:border-[#f5c542]/20 transition-all"
                        title="Edit Location"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLocationToDelete(loc.id)}
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
                          onChange={(e) => handleUploadMedia(loc.id, e.target.files)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={uploading === loc.id}
                        />
                        <button
                          disabled={uploading === loc.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#f5c542]/10 hover:bg-[#f5c542]/20 text-[#f5c542] text-xs font-bold rounded-lg transition-all border border-[#f5c542]/20"
                        >
                          {uploading === loc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{uploading === loc.id ? 'Uploading...' : 'Upload Media'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {media
                        .filter((m) => m.location_id === loc.id)
                        .map((m) => (
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
                              onClick={() => handleDeleteMedia(m.id, m.url)}
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
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111116] border border-white/10 rounded-2xl max-w-md w-full p-8 space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Delete Client?</h2>
              <p className="text-white/40">
                This will permanently delete <span className="text-white font-medium">{formData.name}</span> and all associated locations and media. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && editingLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111116] border border-white/10 rounded-2xl max-w-2xl w-full my-8 animate-in zoom-in-95 duration-200 shadow-2xl">
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
                onClick={() => setShowLocationModal(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Milestone Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., The College Years"
                    value={editingLocation.title}
                    onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, title: e.target.value }))}
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
                    onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, location_name: e.target.value }))}
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
                    onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, latitude: e.target.value }))}
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
                    onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, longitude: e.target.value }))}
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
                  onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all resize-none placeholder:text-white/20"
                />
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Date From</label>
                  <DatePicker
                    value={editingLocation.date_from}
                    onChange={(val) => setEditingLocation((prev: any) => ({ ...prev, date_from: val }))}
                    placeholder="e.g., Jan 2018"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Date To</label>
                  <DatePicker
                    value={editingLocation.date_to}
                    onChange={(val) => setEditingLocation((prev: any) => ({ ...prev, date_to: val }))}
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
                    onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, sort_order: e.target.value }))}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Icon Type</label>
                  <div className="relative">
                    <select
                      value={editingLocation.icon_type}
                      onChange={(e) => setEditingLocation((prev: any) => ({ ...prev, icon_type: e.target.value }))}
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
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={locationSaving}
                  type="submit"
                  className="flex-[2] flex items-center justify-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] disabled:opacity-50 text-black font-bold px-12 py-4 rounded-xl transition-all shadow-lg shadow-[#f5c542]/10 active:scale-[0.98]"
                >
                  {locationSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Save Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Delete Confirmation */}
      {locationToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#111116] border border-white/10 rounded-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Remove Milestone?</h2>
              <p className="text-white/40 leading-relaxed">
                This will permanently delete this location and all its associated media. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setLocationToDelete(null)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={locationDeleting}
                onClick={handleDeleteLocation}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {locationDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                <span>Delete Milestone</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
