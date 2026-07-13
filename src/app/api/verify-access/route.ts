import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';

function getServiceSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );
}

function getSecret(): Uint8Array {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET not set');
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  try {
    const { slug, code } = await req.json();

    if (!slug || !code) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('password_protected, access_password')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // If not password protected, always grant
    if (!data.password_protected) {
      const token = await mintToken(slug);
      return successResponse(token, slug);
    }

    const ok = data.access_password?.trim().toLowerCase() === code.trim().toLowerCase();
    if (!ok) {
      return NextResponse.json({ ok: false });
    }

    const token = await mintToken(slug);
    return successResponse(token, slug);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function mintToken(slug: string): Promise<string> {
  return new SignJWT({ slug })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

function successResponse(token: string, slug: string): NextResponse {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(`access_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: `/map/${slug}`,
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return res;
}
