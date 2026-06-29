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

export function proxy(request: NextRequest) {
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
