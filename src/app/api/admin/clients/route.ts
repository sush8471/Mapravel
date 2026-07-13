import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** GET /api/admin/clients — list all clients (strips access_password) */
export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Strip access_password from list responses
    const safeData = (data || []).map(({ access_password, ...rest }) => rest);

    return NextResponse.json(safeData);
  } catch (error: any) {
    console.error('Error listing clients:', error);
    return NextResponse.json({ error: error.message || 'Failed to list clients' }, { status: 500 });
  }
}

/** POST /api/admin/clients — create a new client */
export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getServiceSupabase();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    if (!body.slug?.trim()) {
      return NextResponse.json({ error: 'URL slug is required' }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Display title is required' }, { status: 400 });
    }

    // Validate slug uniqueness
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', body.slug.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A client with this slug already exists' }, { status: 409 });
    }

    // Validate password consistency
    if (body.password_protected && !body.access_password?.trim()) {
      return NextResponse.json({ error: 'Access code is required when password protection is enabled' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: body.name.trim(),
        slug: body.slug.trim(),
        title: body.title.trim(),
        subtitle: body.subtitle || '',
        bio: body.bio || '',
        theme: body.theme || 'dark_explorer',
        password_protected: body.password_protected || false,
        access_password: body.access_password || '',
        is_published: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Strip access_password from response
    const { access_password, ...safeData } = data;
    return NextResponse.json(safeData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: error.message || 'Failed to create client' }, { status: 500 });
  }
}
