import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** GET /api/admin/clients/[id] — fetch single client (with access_password for edit form) */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: error.message || 'Client not found' }, { status: 404 });
  }
}

/** PUT /api/admin/clients/[id] — update a client */
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

    // Validate slug uniqueness if slug changed
    if (body.slug) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('slug', body.slug.trim())
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'A client with this slug already exists' }, { status: 409 });
      }
    }

    // Validate password consistency
    if (body.password_protected && !body.access_password?.trim()) {
      return NextResponse.json({ error: 'Access code is required when password protection is enabled' }, { status: 400 });
    }

    const { error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

/** DELETE /api/admin/clients/[id] — delete client + cascade clean storage */
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

    // 1. Clean up storage files for this client
    try {
      const { data: files } = await supabase.storage
        .from('media')
        .list(id, { limit: 1000 });

      if (files && files.length > 0) {
        // List recursively — get all subfolders
        const allPaths: string[] = [];

        const listRecursive = async (prefix: string) => {
          const { data: items } = await supabase.storage
            .from('media')
            .list(prefix, { limit: 1000 });

          if (!items) return;
          for (const item of items) {
            const path = `${prefix}/${item.name}`;
            if (item.id) {
              allPaths.push(path);
            } else {
              await listRecursive(path);
            }
          }
        };

        await listRecursive(id);

        if (allPaths.length > 0) {
          await supabase.storage.from('media').remove(allPaths);
        }
      }
    } catch (storageError) {
      console.warn('Storage cleanup warning (non-fatal):', storageError);
    }

    // 2. Delete media records
    await supabase.from('media').delete().eq('client_id', id);

    // 3. Delete location records
    await supabase.from('locations').delete().eq('client_id', id);

    // 4. Delete the client
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
