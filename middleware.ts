import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Maintenance mode configuration
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_PASSWORD = process.env.MAINTENANCE_PASSWORD || 'cansan2024';
const BYPASS_COOKIE = 'maintenance_bypass';

// Paths that are always accessible during maintenance
const ALLOWED_PATHS = [
  '/coming-soon',
  '/api/maintenance',
  '/favicon.svg',
  '/icon.svg',
  '/images/',
  '/_next/',
];

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow access to static assets and API
  if (ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user has bypass cookie
  const bypassCookie = request.cookies.get(BYPASS_COOKIE);
  if (bypassCookie?.value === BYPASS_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to coming soon page
  const url = request.nextUrl.clone();
  url.pathname = '/coming-soon';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api/maintenance|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
