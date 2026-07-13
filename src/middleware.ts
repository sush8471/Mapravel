import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getAdminSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, getAdminSecret());
    return NextResponse.next();
  } catch {
    // Token invalid or expired — clear it and redirect
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin-token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
