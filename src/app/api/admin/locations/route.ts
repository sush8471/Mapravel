import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** GET /api/admin/locations?client_id=xxx — list locations for a client */
export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const supabase = getServiceSupabase();

    let query = supabase.from('locations').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error listing locations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** POST /api/admin/locations — create a location */
export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getServiceSupabase();

    if (!body.client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!body.location_name?.trim()) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert([{
        client_id: body.client_id,
        title: body.title.trim(),
        location_name: body.location_name.trim(),
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        description: body.description || '',
        date_from: body.date_from || null,
        date_to: body.date_to || null,
        sort_order: parseInt(body.sort_order) || 0,
        icon_type: body.icon_type || 'home',
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
