'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderWrapper } from './HeaderWrapper';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { SeoTracker } from './SeoTracker';

// Public chrome (header, footer, WhatsApp, analytics) is hidden under /admin
// so the admin console has its own layout without site chrome bleeding through.
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  if (isAdmin) {
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
