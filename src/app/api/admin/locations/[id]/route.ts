import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** PUT /api/admin/locations/[id] — update a location */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServiceSupabase();

    const locationData = {
      title: body.title?.trim(),
      location_name: body.location_name?.trim(),
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      description: body.description || '',
      date_from: body.date_from || null,
      date_to: body.date_to || null,
      sort_order: parseInt(body.sort_order) || 0,
      icon_type: body.icon_type || 'home',
    };

    const { error } = await supabase
      .from('locations')
      .update(locationData)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating location:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE /api/admin/locations/[id] — delete a location and its media */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getServiceSupabase();

    // Delete associated media records (storage cleanup handled by cascade or manual)
    await supabase.from('media').delete().eq('location_id', id);

    // Delete the location
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
