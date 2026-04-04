import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BYPASS_COOKIE = 'maintenance_bypass';

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

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled (read at runtime)
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const bypassPassword = process.env.MAINTENANCE_PASSWORD || 'cansan2024';
  
  // If maintenance mode is not enabled, allow all requests
  if (!maintenanceMode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow access to static assets and API
  if (ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user has bypass cookie
  const bypassCookie = request.cookies.get(BYPASS_COOKIE);
  if (bypassCookie?.value === bypassPassword) {
    return NextResponse.next();
  }

  // Redirect to coming soon page
  const url = request.nextUrl.clone();
  url.pathname = '/coming-soon';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
