'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderWrapper } from './HeaderWrapper';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { SeoTracker } from './SeoTracker';

// Public chrome (header, footer, WhatsApp, analytics) is hidden under /admin
// and /coming-soon so those pages have their own layout without site chrome
// (shop nav/cart/footer) bleeding through.
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChromeless = pathname?.startsWith('/admin') || pathname?.startsWith('/coming-soon');

  if (isChromeless) {
    return <main>{children}</main>;
  }

  return (
    <>
      <HeaderWrapper />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <Suspense fallback={null}>
        <SeoTracker />
      </Suspense>
    </>
  );
}
