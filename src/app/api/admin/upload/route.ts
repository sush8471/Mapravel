import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/**
 * POST /api/admin/upload
 * Handles file uploads for media (images/videos) and music.
 * Expects multipart/form-data with:
 *   - file: the file to upload
 *   - client_id: the client ID
 *   - type: 'media' | 'intro_music' | 'journey_music'
 *   - location_id: (required when type='media') the location ID
 */
export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('client_id') as string;
    const uploadType = formData.get('type') as string;
    const locationId = formData.get('location_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }
    if (!uploadType) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const isVideo = file.type.startsWith('video/');

    // Size validation
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max ${isVideo ? '50MB for video' : '5MB for images'}.`
      }, { status: 400 });
    }

    // Convert File to Buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let filePath: string;
    let publicUrl: string;

    if (uploadType === 'intro_music' || uploadType === 'journey_music') {
      const prefix = uploadType === 'intro_music' ? 'music' : 'journey-music';
      filePath = `${clientId}/music/${prefix}-${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, buffer, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl: url } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      publicUrl = url;

      // Update client record with music URL
      const field = uploadType === 'intro_music' ? 'background_music_url' : 'journey_music_url';
      const { error: dbError } = await supabase
        .from('clients')
        .update({ [field]: publicUrl })
        .eq('id', clientId);

      if (dbError) throw dbError;

      return NextResponse.json({ publicUrl, type: uploadType });

    } else if (uploadType === 'media') {
      if (!locationId) {
        return NextResponse.json({ error: 'location_id is required for media uploads' }, { status: 400 });
      }

      filePath = `${clientId}/${locationId}/${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, buffer, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl: url } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      publicUrl = url;

      // Insert media record
      const { data: mediaData, error: dbError } = await supabase
        .from('media')
        .insert([{
          client_id: clientId,
          location_id: locationId,
          url: publicUrl,
          type: isVideo ? 'video' : 'image',
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      return NextResponse.json({ publicUrl, media: mediaData, type: 'media' });

    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
