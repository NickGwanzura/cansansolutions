import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BYPASS_COOKIE = 'maintenance_bypass';
const SESSION_TTL_MS = 60 * 60 * 8 * 1000;
const encoder = new TextEncoder();

// Paths that are always accessible during maintenance
const ALLOWED_PATHS = [
  '/coming-soon',
  '/api/maintenance',
  '/api/health',
  '/favicon.svg',
  '/icon.svg',
  '/images/',
  '/uploads/',
  '/_next/',
];

function isMaintenanceActive(): boolean {
  const mode = process.env.MAINTENANCE_MODE;
  if (mode !== 'true') return false;

  // Check for automatic expiry time
  const until = process.env.MAINTENANCE_UNTIL;
  if (until) {
    const expiry = new Date(until).getTime();
    if (!isNaN(expiry) && Date.now() >= expiry) {
      // Maintenance period has expired — treat as disabled
      return false;
    }
  }

  return true;
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const base64 = value
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(value.length / 4) * 4, '=');
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function isValidMaintenanceSession(
  session: string | undefined,
  password: string,
): Promise<boolean> {
  if (!session) return false;
  const [issuedAtRaw, nonce, signature, ...extra] = session.split('.');
  const issuedAt = Number(issuedAtRaw);
  if (extra.length > 0 || !nonce || !signature || !Number.isFinite(issuedAt)) return false;
  if (issuedAt > Date.now() || Date.now() - issuedAt > SESSION_TTL_MS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return false;
  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes as unknown as BufferSource,
    encoder.encode(`cansan-session:v1:maintenance:${issuedAtRaw}.${nonce}`),
  );
}

export async function proxy(request: NextRequest) {
  const maintenanceActive = isMaintenanceActive();
  const bypassPassword = process.env.MAINTENANCE_PASSWORD;

  // If no maintenance password is configured, fail closed — don't allow bypass
  if (!bypassPassword) {
    if (maintenanceActive) {
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If maintenance mode is not enabled or has expired, allow all requests
  if (!maintenanceActive) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow access to static assets and API
  if (ALLOWED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user has bypass cookie
  const bypassCookie = request.cookies.get(BYPASS_COOKIE);
  if (await isValidMaintenanceSession(bypassCookie?.value, bypassPassword)) {
    return NextResponse.next();
  }

  // Redirect to coming soon page
  const url = request.nextUrl.clone();
  url.pathname = '/coming-soon';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
