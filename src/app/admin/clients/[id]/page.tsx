'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Trash2, 
  Eye,
  Settings,
  CheckCircle2,
  Circle,
  MapPin,
  Plus,
  Music,
  Upload,
} from 'lucide-react';

import Link from 'next/link';
import { toast } from 'sonner';

import {
  getClient,
  updateClient,
  deleteClient,
  togglePublish,
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation as deleteLocationApi,
  listMedia,
  deleteMedia,
  uploadFile,
} from '@/lib/admin-api';
import type { Location, Media } from '@/lib/types';
import type { EditingLocation } from '@/lib/admin-types';
import { locationToEditing, blankEditingLocation } from '@/lib/admin-types';

import LocationModal from '@/components/admin/LocationModal';
import LocationCard from '@/components/admin/LocationCard';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

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

  const [editingLocation, setEditingLocation] = useState<EditingLocation | null>(null);
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationDeleting, setLocationDeleting] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);
  
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
      const data = await getClient(id);
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
      const data = await listLocations(id);
      setLocations(data);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchMedia = async () => {
    try {
      const data = await listMedia(id);
      setMedia(data);
    } catch (error: any) {
      console.error('Error fetching media:', error);
    }
  };

  const openLocationModal = (location?: Location) => {
    if (location) {
      setEditingLocation(locationToEditing(location));
    } else {
      setEditingLocation(blankEditingLocation(locations.length + 1));
    }
    setShowLocationModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    setLocationSaving(true);

    try {
      const locationData = {
        client_id: id,
        title: editingLocation.title,
        location_name: editingLocation.location_name,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        description: editingLocation.description,
        date_from: editingLocation.date_from || null,
        date_to: editingLocation.date_to || null,
        sort_order: editingLocation.sort_order,
        icon_type: editingLocation.icon_type || 'home'
      };

      if (editingLocation.id) {
        await updateLocation(editingLocation.id, locationData);
        toast.success('Milestone updated successfully!');
      } else {
        await createLocation(locationData);
        toast.success('Milestone added successfully!');
      }

      setShowLocationModal(false);
      setEditingLocation(null);
      fetchLocations();
    } catch (error: any) {
      console.error('Save Location Error:', error);
      toast.error('Error saving milestone: ' + (error.message || 'Unknown error'));
    } finally {
      setLocationSaving(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationToDeleteId) return;
    setLocationDeleting(true);
    try {
      await deleteLocationApi(locationToDeleteId);
      toast.success('Milestone deleted.');
      fetchLocations();
      fetchMedia();
      setLocationToDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast.error('Error deleting milestone: ' + (error.message || 'Unknown error'));
    } finally {
      setLocationDeleting(false);
    }
  };

  const handleUploadMusic = async (file: File | null) => {
    if (!file) return;
    setMusicUploading(true);
    try {
      const result = await uploadFile(file, id, 'intro_music');
      setFormData(prev => ({ ...prev, background_music_url: result.publicUrl }));
      toast.success('Background music uploaded!');
    } catch (error: any) {
      console.error('Music Upload Error:', error);
      toast.error('Error uploading music: ' + (error.message || 'Unknown error'));
    } finally {
      setMusicUploading(false);
    }
  };

  const handleUploadJourneyMusic = async (file: File | null) => {
    if (!file) return;
    setJourneyMusicUploading(true);
    try {
      const result = await uploadFile(file, id, 'journey_music');
      setFormData(prev => ({ ...prev, journey_music_url: result.publicUrl }));
      toast.success('Journey music uploaded!');
    } catch (error: any) {
      console.error('Journey Music Upload Error:', error);
      toast.error('Error uploading journey music: ' + (error.message || 'Unknown error'));
    } finally {
      setJourneyMusicUploading(false);
    }
  };

  const handleUploadMedia = async (locationId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(locationId);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], id, 'media', locationId);
      }
    
      fetchMedia();
      toast.success(`${files.length > 1 ? files.length + ' files' : 'File'} uploaded successfully!`);
    } catch (error: any) {
      console.error('Media Upload Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteMedia = async (mediaId: string, url: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await deleteMedia(mediaId, url);
      fetchMedia();
      toast.success('Media deleted.');
    } catch (error: any) {
      console.error('Error deleting media:', error);
      toast.error('Error deleting media: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password consistency
    if (formData.password_protected && !formData.access_password.trim()) {
      toast.error('Please enter an access code when password protection is enabled.');
      return;
    }

    setSaving(true);

    try {
      await updateClient(id, { ...formData });
      toast.success('Changes saved successfully!');
    } catch (error: any) {
      console.error('Update Error:', error);
      toast.error('Error saving: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    const nextState = !formData.is_published;
    setSaving(true);
    try {
      await togglePublish(id, nextState);
      setFormData(prev => ({ ...prev, is_published: nextState }));
      toast.success(nextState ? 'Journey published!' : 'Journey unpublished.');
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClient(id);
      toast.success('Client deleted.');
      router.push('/admin/clients');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error('Error deleting client: ' + (error.message || 'Unknown error'));
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
            onClick={handleTogglePublish}
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
              <label className="text-sm font-medium text-white/60 ml-1">Client Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">URL Slug *</label>
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
              <label className="text-sm font-medium text-white/60 ml-1">Display Title *</label>
              <input
                required
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
                  <label className="text-xs font-medium text-white/50 ml-1 uppercase tracking-wider">Access Code *</label>
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
                  <div className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between">
                    <span>Dark Explorer</span>
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-md">Default</span>
                  </div>
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
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                media={media}
                uploadingId={uploading}
                onEdit={(location) => openLocationModal(location)}
                onDelete={(locationId) => setLocationToDeleteId(locationId)}
                onUploadMedia={handleUploadMedia}
                onDeleteMedia={handleDeleteMedia}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Client Confirmation Modal */}
      <DeleteConfirmModal
        title="Delete Client?"
        message="and all associated locations and media. This action cannot be undone."
        itemName={formData.name}
        isOpen={showDeleteConfirm}
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Location Modal */}
      {editingLocation && (
        <LocationModal
          editingLocation={editingLocation}
          isOpen={showLocationModal}
          isSaving={locationSaving}
          onChange={setEditingLocation}
          onSave={handleSaveLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {/* Location Delete Confirmation */}
      <DeleteConfirmModal
        title="Remove Milestone?"
        message="This will permanently delete this location and all its associated media. This action cannot be undone."
        isOpen={!!locationToDeleteId}
        isDeleting={locationDeleting}
        onConfirm={handleDeleteLocation}
        onCancel={() => setLocationToDeleteId(null)}
      />
    </div>
  );
}
