import type { Metadata } from 'next';
import Link from 'next/link';
import { buildAbsoluteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildAbsoluteMetadata({
    title: 'IT Support, WiFi & CCTV Installation in Harare',
    description:
      'Get WiFi setup, CCTV supply, tech sourcing, IT consultation, and bulk business support in Harare from Cansan Solutions.',
    path: '/services',
  }),
};

const services = [
  {
    title: 'Tech Retail & Product Sourcing',
    description:
      'Browse our wide range of smartphones, laptops, networking gear, power solutions, audio equipment, and accessories. Can&apos;t find what you need? We source products on request from our supplier network.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
    cta: { label: 'Browse Products', href: '/products' },
  },
  {
    title: 'Networking & Wi-Fi Setup',
    description:
      'Home or office — we supply and install routers, access points, switches, and structured cabling. From a simple home Wi-Fi upgrade to a multi-site enterprise network, our team handles it.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
      </svg>
    ),
    cta: { label: 'View Wi-Fi Solution', href: '/solutions/home-wifi-setup' },
  },
  {
    title: 'Power & Backup Solutions',
    description:
      'Load-shedding got you down? We supply and install UPS systems, power banks, and portable power stations for homes and businesses. Keep your equipment running when the grid goes down.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    cta: { label: 'View Backup Solution', href: '/solutions/load-shedding-backup' },
  },
  {
    title: 'IT Consultation',
    description:
      'Unsure what tech solution fits your business? We offer consultations to help you plan purchases, upgrades, and deployments — saving you money and avoiding costly mistakes.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    cta: { label: 'Get in Touch', href: '/contact' },
  },
  {
    title: 'Device Repair & Support',
    description:
      'Cracked screen, battery issues, or a laptop that won&apos;t boot? We offer basic hardware diagnostics and repairs, and can refer you to specialist repair partners for complex jobs.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    title: 'Corporate & Bulk Orders',
    description:
      'Equipping an office, school, or organisation? We handle bulk orders with competitive pricing, delivery coordination, and post-purchase support. Request a quote via WhatsApp.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    cta: { label: 'View Office Laptop Solution', href: '/solutions/office-laptops' },
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">What we do</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Services & Solutions</h1>
          <p className="mt-5 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From sourcing the right device to setting up your entire office network — Cansan Solutions has the products, expertise, and support to get the job done.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                {service.icon}
              </div>
              <h2 className="mb-2 text-base font-bold text-zinc-900">{service.title}</h2>
              <p
                className="flex-1 text-sm leading-relaxed text-zinc-500"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
              <Link
                href={service.cta.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
              >
                {service.cta.label} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Popular Solutions</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">Commercial landing pages for high-intent buyers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                Some buyers are not looking for a generic service overview. They are searching for a concrete business or home solution. These pages give them a clearer path.
              </p>
            </div>
            <Link href="/solutions" className="text-sm font-medium text-red-600 hover:text-red-700">
              View all solutions
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Office Laptops',
                body: 'For teams, SMEs, schools, and repeat business procurement with quote-first buying support.',
                href: '/solutions/office-laptops',
              },
              {
                title: 'CCTV Packages',
                body: 'For homes, shops, and offices that need package-style security quotes and installation discussions.',
                href: '/solutions/cctv-packages',
              },
              {
                title: 'Home Wi-Fi Setup',
                body: 'For coverage problems, router upgrades, and practical networking support in Harare homes.',
                href: '/solutions/home-wifi-setup',
              },
              {
                title: 'Load-Shedding Backup',
                body: 'For router uptime, workstation continuity, and UPS planning during power cuts.',
                href: '/solutions/load-shedding-backup',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-red-600">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:underline">
                  Open solution page
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-red-600 px-6 py-14 text-white text-center">
        <h2 className="text-2xl font-bold">Need a custom solution?</h2>
        <p className="mt-2 text-red-100 text-sm">
          Every business is different. Chat with us and we&apos;ll put together the right package for you.
        </p>
        <a
          href={`https://wa.me/263773754747?text=${encodeURIComponent("Hi Cansan Solutions, I'd like to discuss a custom tech solution.")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
}
