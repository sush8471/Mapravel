import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** GET /api/admin/media?client_id=xxx — list media for a client */
export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const supabase = getServiceSupabase();

    let query = supabase.from('media').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error listing media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE /api/admin/media?id=xxx&url=xxx — delete a media item + storage file */
export async function DELETE(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const mediaId = url.searchParams.get('id');
    const mediaUrl = url.searchParams.get('url');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Clean up storage file
    if (mediaUrl) {
      try {
        const pathParts = mediaUrl.split('/public/media/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);
          await supabase.storage.from('media').remove([filePath]);
        }
      } catch (storageError) {
        console.warn('Storage cleanup warning:', storageError);
      }
    }

    // Delete database record
    const { error } = await supabase.from('media').delete().eq('id', mediaId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
