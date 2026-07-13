import { SignJWT, jwtVerify } from 'jose';

function getAdminSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function mintAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getAdminSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getAdminSecret());
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify the admin token from a request's cookies.
 * Returns true if valid, false otherwise.
 */
export async function verifyAdminRequest(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin-token=([^;]+)/);
  if (!match) return false;
  return verifyAdminToken(match[1]);
}
