import { NextResponse } from 'next/server';
import { mintAdminToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (password === adminPassword) {
      const token = await mintAdminToken();

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

/** GET: check if the current session is valid */
export async function GET() {
  // Middleware already validates the token for /admin routes.
  // If we reach here, the request is authenticated.
  return NextResponse.json({ authenticated: true });
}
