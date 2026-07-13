import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

/** PATCH /api/admin/clients/[id]/publish — toggle publish state */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { is_published } = await request.json();
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('clients')
      .update({ is_published })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, is_published });
  } catch (error: any) {
    console.error('Error toggling publish:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle publish' }, { status: 500 });
  }
}
