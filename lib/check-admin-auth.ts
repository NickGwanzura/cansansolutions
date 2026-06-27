import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DEFAULT_PASSWORD = 'cansan2024';
const SITE_URL = process.env.SITE_URL || 'https://cansansolutions.shop';

// Warn once at module load time if the default password is in use
if (!ADMIN_PASSWORD) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    `[Auth] WARNING: ADMIN_PASSWORD is not set! Using default password "${DEFAULT_PASSWORD}". ` +
    'Set the ADMIN_PASSWORD environment variable to a secure value in production.'
  );
} else if (ADMIN_PASSWORD === DEFAULT_PASSWORD) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    `[Auth] WARNING: ADMIN_PASSWORD is set to the default value "${DEFAULT_PASSWORD}". ` +
    'Change it to a unique, secure password for production.'
  );
}

/**
 * Lightweight CSRF check: ensures the Origin or Referrer header
 * matches the expected site URL. Only applies to mutating methods (POST/PUT/DELETE).
 *
 * This is a defense-in-depth measure. The primary protection is the
 * `SameSite=Strict` cookie attribute on the auth cookie.
 */
function checkOrigin(req: NextRequest): boolean {
  const method = req.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true; // Read-only methods don't need origin checks
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (!origin && !referer) {
    // No origin/referer is suspicious for a browser request, but could be
    // a legitimate API client (e.g. curl). Allow through — the cookie check
    // is the primary safeguard.
    return true;
  }

  const allowedOrigins = [
    SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const checkAgainst = origin || referer || '';
  try {
    // Parse the incoming URL to extract just the origin, so a domain like
    // "localhost:3000.evil.com" does not match "localhost:3000".
    const incomingOrigin = new URL(checkAgainst).origin;
    return allowedOrigins.some((allowed) => {
      const allowedOrigin = allowed.startsWith('http') ? new URL(allowed).origin : allowed;
      return incomingOrigin === allowedOrigin;
    });
  } catch {
    // If the URL is malformed, fail closed (deny)
    return false;
  }
}

export async function checkAdminAuth(req?: NextRequest): Promise<boolean> {
  const password = ADMIN_PASSWORD || DEFAULT_PASSWORD;
  try {
    if (req) {
      // CSRF check for mutating requests
      if (!checkOrigin(req)) {
        console.warn('[Auth] CSRF check failed — request origin mismatch');
        return false;
      }

      // For route handlers with request object
      const cookie = req.cookies.get('admin_auth')?.value;
      return cookie === password;
    } else {
      // For cases where we need to use cookies() directly
      const store = await cookies();
      return store.get('admin_auth')?.value === password;
    }
  } catch (e) {
    console.error('[Auth] Cookie check failed:', e);
    return false;
  }
}
