import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Warranty Information | Electronics Store in Harare',
  description:
    'Read how warranty support works at Cansan Solutions for laptops, phones, CCTV, networking gear, and accessories bought in Harare.',
  path: '/warranty',
});

const faqs = [
  {
    question: 'Do products bought from Cansan come with a warranty?',
    answer:
      'Yes. Products are sold with the applicable manufacturer or supplier warranty where available. Warranty terms can differ by brand and product type, so buyers should confirm the exact cover before payment.',
  },
  {
    question: 'What should I do if a product develops a fault?',
    answer:
      'Contact Cansan as soon as possible with the product name, date of purchase, and issue. We will guide you through the next step, including inspection, supplier follow-up, or manufacturer warranty handling where applicable.',
  },
  {
    question: 'Does warranty mean instant replacement?',
    answer:
      'Not always. Some items can be swapped quickly if the issue is confirmed and stock is available, but many warranty cases depend on supplier testing, brand policy, and the condition of the item returned.',
  },
  {
    question: 'Are physical damage and misuse covered?',
    answer:
      'No. Accidental damage, liquid damage, power surges, tampering, and misuse are typically excluded. Buyers should use products according to the manufacturer guidelines and keep packaging or proof of purchase when possible.',
  },
];

export default function WarrantyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Warranty Information', url: absoluteUrl('/warranty') },
        ]}
      />
      <FaqJsonLd questions={faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Buying Confidence</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Warranty information for Cansan customers</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Buyers need clarity before they spend. This page explains how Cansan handles product support, warranty claims, and next steps when something goes wrong.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Clear pre-sale confirmation',
                body: 'Before payment, confirm the warranty type, expected support route, and whether the item is brand new or pre-owned.',
              },
              {
                title: 'Fast first response',
                body: 'When issues are reported quickly and with the right details, Cansan can triage the problem faster and advise the best next step.',
              },
              {
                title: 'Support that does not disappear',
                body: 'Cansan positions after-sales support as part of the purchase, not an afterthought once payment is made.',
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
            <h2 className="text-2xl font-bold text-zinc-900">Frequently asked warranty questions</h2>
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
          <div className="mx-auto max-w-5xl rounded-3xl bg-red-600 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Need help with a product issue or want warranty clarity before buying?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-100">
              Message the store with the product name and your question. We will tell you what cover applies and what to expect before you commit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                Contact Cansan
              </Link>
              <Link href="/products" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
