import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Bulk Orders & Business Quotes | Harare Tech Supplier',
  description:
    'Request bulk quotes for laptops, networking gear, CCTV, printers, and office tech from Cansan Solutions in Harare.',
  path: '/bulk-orders',
});

const faqs = [
  {
    question: 'Can Cansan quote for office, school, or organisational orders?',
    answer:
      'Yes. Cansan supports bulk and business purchasing for offices, schools, NGOs, and other organisations that need multiple units or bundled supply.',
  },
  {
    question: 'What should I send when requesting a bulk quote?',
    answer:
      'Send the product names or links, estimated quantities, your preferred brands, and when you need the order. That makes the quote process much faster.',
  },
  {
    question: 'Can you source products not currently listed?',
    answer:
      'Yes. If a required product is not shown on the site, Cansan can still check supplier availability and quote where practical.',
  },
  {
    question: 'Do bulk orders also cover delivery coordination?',
    answer:
      'Yes. Larger orders can include planning around collection, Harare delivery, or courier logistics depending on the products and destination.',
  },
];

export default function BulkOrdersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Bulk Orders', url: absoluteUrl('/bulk-orders') },
        ]}
      />
      <FaqJsonLd questions={faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Business Purchasing</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bulk orders and business quotes</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Cansan is not only a walk-in retail store. This page is for offices, schools, organisations, and teams that need multiple items and a clearer buying process.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Laptops and office hardware',
                body: 'Shortlist work laptops, accessories, printers, monitors, and core hardware for staff or department rollouts.',
              },
              {
                title: 'Networking and CCTV packages',
                body: 'Use Cansan for projects that combine devices with connectivity, surveillance, or support requirements.',
              },
              {
                title: 'Quote-first buying flow',
                body: 'Instead of pushing bulk buyers through a retail checkout, the process is structured around confirmation, quantity, and approval needs.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-50 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-zinc-900">Frequently asked bulk-order questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-zinc-900">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-zinc-900 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Ready to request a business or bulk quote?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
              Send the products, quantities, and timeline. We will respond with the next step, quote guidance, and stock feedback.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500">
                Contact Cansan
              </Link>
              <Link href="/products" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
