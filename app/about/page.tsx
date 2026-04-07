import type { Metadata } from 'next';
import Link from 'next/link';
import { buildAbsoluteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildAbsoluteMetadata({
    title: 'About Cansan Solutions | Trusted Tech Store in Harare',
    description:
      'Learn about Cansan Solutions, a Harare-based tech retailer focused on genuine products, honest advice, and fast WhatsApp ordering.',
    path: '/about',
  }),
};

const values = [
  {
    title: 'Customer First',
    description: 'Every decision we make starts with you. We source products that deliver real value and back every sale with personal support.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  {
    title: 'Genuine Products',
    description: 'We stock only authentic, quality-assured tech from trusted brands — no counterfeits, no compromises.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: 'Fast & Simple',
    description: 'Order in seconds via WhatsApp. No complicated checkouts — just chat, confirm, and we handle the rest.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    title: 'Expert Advice',
    description: 'Not sure what to buy? Our team knows tech inside and out. We help you pick the right product for your budget and needs.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

const stats = [
  { label: 'Products in stock', value: '200+' },
  { label: 'Happy customers', value: '1,000+' },
  { label: 'Brands carried', value: '50+' },
  { label: 'Years in business', value: '5+' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Who we are</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Zimbabwe&apos;s trusted tech partner
          </h1>
          <p className="mt-5 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Cansan Solutions is a Harare-based technology retailer dedicated to bringing quality electronics and honest advice to every customer — whether you&apos;re upgrading your phone, setting up a home network, or kitting out your office.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-zinc-100 sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-10">
              <span className="text-3xl font-bold text-zinc-900">{stat.value}</span>
              <span className="text-xs text-zinc-500 text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-5 text-2xl font-bold text-zinc-900">Our story</h2>
        <div className="space-y-4 text-sm leading-7 text-zinc-600">
          <p>
            Cansan Solutions was founded with a simple belief: everyone deserves access to quality technology at fair prices, with real support behind every purchase. We started as a small operation helping friends and family source the right devices, and grew into a full-service tech retailer serving customers across Zimbabwe.
          </p>
          <p>
            Today, we carry everything from smartphones and laptops to networking equipment, UPS power backup systems, and audio gear. Our catalogue spans the world&apos;s leading brands — Samsung, Apple, HP, Dell, TP-Link, Sony, and more — all sourced through verified supply chains.
          </p>
          <p>
            What sets us apart is how easy we make it to buy. Browse our catalogue, add items to your cart, and send us a WhatsApp message — we&apos;ll confirm availability, finalise pricing, and arrange delivery or collection. No complicated forms, no hidden fees.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">What we stand for</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  {v.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-zinc-900">{v.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Ready to shop?</h2>
        <p className="mt-2 text-sm text-zinc-500">Browse our full range or get in touch — we&apos;re here to help.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Shop Products
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
