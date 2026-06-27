import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { CATALOG_CATEGORIES, getCategoryHref } from '@/lib/catalog';
import { SITE_EMAIL, SITE_PHONE } from '@/lib/site';
import { WA_NUMBER } from '@/lib/site';

const WA_DISPLAY = SITE_PHONE;
const DEV_URL = 'https://www.spiritus.co.zw';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'All Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/services', label: 'Services' },
  { href: '/insights', label: 'Insights' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const buyingInfoLinks = [
  { href: '/warranty', label: 'Warranty Info' },
  { href: '/delivery', label: 'Delivery Info' },
  { href: '/payments', label: 'Payment Options' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
];

const solutionLinks = [
  { href: '/solutions/office-laptops', label: 'Office Laptops' },
  { href: '/solutions/cctv-packages', label: 'CCTV Packages' },
  { href: '/solutions/home-wifi-setup', label: 'Home Wi-Fi Setup' },
  { href: '/solutions/load-shedding-backup', label: 'Load-Shedding Backup' },
];

const categories = CATALOG_CATEGORIES.map((category) => ({
  href: getCategoryHref(category.slug),
  label: category.label,
}));

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* Premium top bar */}
      <div className="border-b border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span className="text-zinc-300">Genuine Products</span>
              </span>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="text-zinc-300">Fast Delivery</span>
              </span>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span className="text-zinc-300">Expert Support</span>
              </span>
            </div>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Cansan Solutions, I'd like to enquire about a product.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex w-fit rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/15 ring-1 ring-white/10"
              aria-label="Cansan Electronics"
            >
              <BrandLogo className="w-[165px] sm:w-[200px]" />
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Zimbabwe&apos;s trusted tech retailer. Quality electronics, honest advice, and WhatsApp simple ordering.
            </p>

            {/* Contact mini-list */}
            <div className="mt-6 space-y-3 text-xs">
              <a href={`tel:+${WA_NUMBER}`} className="flex items-center gap-2.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {WA_DISPLAY}
              </a>
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-2.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {SITE_EMAIL}
              </a>
              <a
                href="https://maps.google.com/?q=Shop+7+ZB+House+Corner+Speke+and+1st+Street+Harare+Zimbabwe"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>Shop 7, ZB House<br />Corner Speke & 1st Street<br />Harare, Zimbabwe</span>
              </a>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200">Quick Links</summary>
              <ul className="mt-3 space-y-3">
                {quickLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200">Buying Info</summary>
              <ul className="mt-3 space-y-3">
                {buyingInfoLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200">Popular Solutions</summary>
              <ul className="mt-3 space-y-3">
                {solutionLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200">Shop by Category</summary>
              <ul className="mt-3 grid grid-cols-2 gap-3">
                {categories.slice(0, 8).map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Quick Links */}
          <div className="hidden lg:block">
            <h3 className="mb-5 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200 hover:translate-x-0.5 inline-flex items-center gap-1.5 group">
                    <span className="h-px w-3 bg-zinc-700 transition group-hover:w-4 group-hover:bg-red-500" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Hours */}
            <div className="mt-8">
              <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Business Hours</h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <div className="flex justify-between gap-4">
                  <span>Mon to Fri</span>
                  <span className="text-zinc-400">8am to 6pm</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span className="text-zinc-400">9am to 4pm</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Sunday</span>
                  <span className="text-red-500/70">Closed</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Buying Info</h3>
              <ul className="space-y-3">
                {buyingInfoLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200 inline-flex items-center gap-1.5 group">
                      <span className="h-px w-3 bg-zinc-700 transition group-hover:w-4 group-hover:bg-red-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Popular Solutions</h3>
              <ul className="space-y-3">
                {solutionLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200 inline-flex items-center gap-1.5 group">
                      <span className="h-px w-3 bg-zinc-700 transition group-hover:w-4 group-hover:bg-red-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Categories */}
          <div className="hidden lg:block">
            <h3 className="mb-5 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Shop by Category</h3>
            <ul className="space-y-3">
              {categories.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-500 transition hover:text-zinc-200 inline-flex items-center gap-1.5 group">
                    <span className="h-px w-3 bg-zinc-700 transition group-hover:w-4 group-hover:bg-red-500" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Why us / trust */}
          <div className="hidden lg:block">
            <h3 className="mb-5 font-heading text-xs font-bold uppercase tracking-widest text-zinc-200">Why Cansan</h3>
            <div className="space-y-4">
              {[
                { icon: '✓', title: 'Genuine Products', desc: 'Authentic goods from verified suppliers. No counterfeits.' },
                { icon: '✓', title: 'WhatsApp Ordering', desc: 'Chat to order. No forms, no fuss.' },
                { icon: '✓', title: 'Fast Delivery', desc: 'Harare same day & nationwide courier.' },
                { icon: '✓', title: 'Expert Advice', desc: 'Real recommendations, not just upsells.' },
                { icon: '✓', title: 'Bulk & Corporate', desc: 'Dedicated pricing for business orders.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-[10px] font-bold text-red-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">{item.title}</p>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Developer Tag */}
      <div className="hidden border-y border-zinc-800/60 bg-zinc-900/50 sm:block">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-zinc-500">Developed by</span>
            <a
              href={DEV_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-red-500 transition hover:text-red-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              Spiritus
            </a>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">www.spiritus.co.zw</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {year} Cansan Solutions. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">Proudly built in Zimbabwe</p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <Link href="/about" className="transition hover:text-zinc-300">About</Link>
            <Link href="/contact" className="transition hover:text-zinc-300">Contact</Link>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-green-500 transition hover:text-green-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
