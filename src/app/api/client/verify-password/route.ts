import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dacharacterz-journey-map-secret-2024';

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    if (!slug || !password) {
      return NextResponse.json({ error: 'Missing slug or password' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch client with the specific password
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, access_password, password_protected')
      .eq('slug', slug)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.password_protected) {
      return NextResponse.json({ success: true, message: 'No password required' });
    }

    // Direct comparison for simplicity as requested, but in a real app we would use hashing
    if (client.access_password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Create a temporary access token for this specific client
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ 
      clientId: client.id,
      slug: slug,
      type: 'journey_access'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token valid for 24 hours
      .sign(secret);

    return NextResponse.json({ 
      success: true, 
      token 
    });

  } catch (error: any) {
    console.error('Verify Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
