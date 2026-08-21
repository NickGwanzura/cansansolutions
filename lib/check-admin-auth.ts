import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const DEFAULT_PASSWORD = 'cansan2024';
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SITE_URL = process.env.SITE_URL || 'https://cansansolutions.shop';

export function getAdminPassword(): string | null {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (
    process.env.NODE_ENV === 'production' &&
    (!configuredPassword || configuredPassword === DEFAULT_PASSWORD)
  ) {
    return null;
  }

  return configuredPassword || DEFAULT_PASSWORD;
}

function sign(payload: string, password: string, scope: string) {
  return createHmac('sha256', password)
    .update(`cansan-session:v1:${scope}:${payload}`)
    .digest('base64url');
}

export function createSignedSession(password: string, scope: string) {
  const issuedAt = Date.now();
  const payload = `${issuedAt}.${randomBytes(18).toString('base64url')}`;
  return `${payload}.${sign(payload, password, scope)}`;
}

export function createAdminSession(password: string) {
  return createSignedSession(password, 'admin');
}

export function isValidSignedSession(
  session: string | undefined,
  password: string | null,
  scope: string,
) {
  if (!session || !password) return false;

  const [issuedAtRaw, nonce, signature, ...extra] = session.split('.');
  const issuedAt = Number(issuedAtRaw);
  if (extra.length > 0 || !nonce || !signature || !Number.isFinite(issuedAt)) return false;
  if (issuedAt > Date.now() || Date.now() - issuedAt > SESSION_TTL_SECONDS * 1000) return false;

  const expected = sign(`${issuedAtRaw}.${nonce}`, password, scope);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function checkRequestOrigin(req: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  // State-changing browser requests must identify their origin. Allowing a
  // missing header makes cookie-authenticated endpoints vulnerable to CSRF
  // through form submissions and non-browser clients.
  if (!origin && !referer) return false;

  const allowedOrigins = [
    SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ].filter(Boolean) as string[];
  try {
    const incomingOrigin = new URL(origin || referer || '').origin;
    return allowedOrigins.some((allowed) => incomingOrigin === new URL(allowed).origin);
  } catch {
    return false;
  }
}

export async function checkAdminAuth(req?: NextRequest): Promise<boolean> {
  try {
    if (req && !checkRequestOrigin(req)) return false;
    const session = req
      ? req.cookies.get('admin_auth')?.value
      : (await cookies()).get('admin_auth')?.value;
    return isValidSignedSession(session, getAdminPassword(), 'admin');
  } catch (error) {
    console.error('[Auth] Session check failed:', error);
    return false;
  }
}
