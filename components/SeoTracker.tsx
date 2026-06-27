'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Client-side SEO tracker that fires page_view events to the server API.
 * Wrapped in Suspense by the parent so it doesn't block rendering.
 */
export function SeoTracker() {
  const pathname = usePathname();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    // Avoid tracking the same path twice in a row (in case of re-renders)
    if (pathname === tracked.current) return;
    tracked.current = pathname;

    // Fire-and-forget: best-effort analytics, don't block UI
    fetch('/api/seo/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'page_view',
        path: pathname,
        referrer: document.referrer || '',
        userAgent: navigator.userAgent,
        deviceType: /mobile|android|iphone|ipad/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }, [pathname]);

  return null;
}
