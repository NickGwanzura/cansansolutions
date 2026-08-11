import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { CATALOG_CATEGORIES, getCategoryHref } from '@/lib/catalog';
import { SITE_EMAIL, SITE_PHONE, WA_NUMBER } from '@/lib/site';

const categoryLinks = CATALOG_CATEGORIES.map((category) => ({
  href: getCategoryHref(category.slug),
  label: category.label,
}));

const supportLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/insights', label: 'Insights' },
  { href: '/payments', label: 'Payment Options' },
  { href: '/delivery', label: 'Delivery Information' },
  { href: '/warranty', label: 'Warranty Policy' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/brands', label: 'Brands' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="inline-flex w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
              aria-label="Cansan Electronics"
            >
              <BrandLogo className="w-[165px] sm:w-[200px]" />
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-zinc-600">
              Zimbabwe&apos;s trusted tech retailer. We supply genuine laptops, networking gear,
              CCTV, and accessories with WhatsApp-simple ordering and warranty-backed support.
            </p>

            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Cansan Solutions, I'd like to enquire about a product.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Mobile: collapsible groups */}
          <div className="space-y-3 lg:hidden">
            <details className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
                Top Categories
              </summary>
              <ul className="mt-3 grid grid-cols-2 gap-3">
                {categoryLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 text-sm text-zinc-600 transition hover:text-red-700"
                    >
                      {label}
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <details className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
                Help &amp; Support
              </summary>
              <ul className="mt-3 space-y-3">
                {supportLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 text-sm text-zinc-600 transition hover:text-red-700"
                    >
                      {label}
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Desktop: Top Categories */}
          <div className="hidden lg:block">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">
              Top Categories
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    {label}
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop: Help & Support */}
          <div className="hidden lg:block">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">
              Help &amp; Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    {label}
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* We're here to help */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">
              We&apos;re Here to Help
            </h3>
            <p className="text-sm text-zinc-600">
              We&apos;re available by WhatsApp, phone, and email.
            </p>

            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-900">WhatsApp &amp; Calls</p>
              <p className="mt-1 text-sm text-zinc-600">
                Mon&ndash;Fri 8am&ndash;6pm &middot; Sat 9am&ndash;4pm
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm font-medium text-red-700 hover:text-red-800"
              >
                {SITE_PHONE}
              </a>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-900">Email</p>
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="mt-1 inline-block text-sm text-zinc-600 hover:text-red-700"
              >
                {SITE_EMAIL}
              </a>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-900">Visit Us</p>
              <a
                href="https://maps.google.com/?q=Shop+7+ZB+House+Corner+Speke+and+1st+Street+Harare+Zimbabwe"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-zinc-600 hover:text-red-700"
              >
                Shop 7, ZB House, Corner Speke & 1st Street, Harare
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col items-center gap-3 text-xs text-zinc-500 sm:flex-row sm:justify-between">
            <p>© {year} Cansan Solutions. All rights reserved.</p>

            <a
              href="https://spiritusglobal.tech"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-zinc-800"
            >
              Built and Maintained By Spiritus Global
            </a>

            <div className="flex items-center gap-4">
              <Link href="/about" className="transition hover:text-zinc-800">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-zinc-800">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
