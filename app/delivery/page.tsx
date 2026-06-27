import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Delivery Information | Harare Tech Store',
  description:
    'Read how Harare delivery and nationwide courier work for orders placed with Cansan Solutions, including stock confirmation and timing.',
  path: '/delivery',
});

const faqs = [
  {
    question: 'Do you offer same-day delivery in Harare?',
    answer:
      'Yes, for some stocked items and depending on order timing, location, and delivery load. Same-day delivery should be confirmed on WhatsApp before payment.',
  },
  {
    question: 'Do you deliver outside Harare?',
    answer:
      'Yes. Nationwide courier can be arranged for many products. Timing and cost depend on the item, destination, and courier availability.',
  },
  {
    question: 'When is delivery confirmed?',
    answer:
      'Delivery is only confirmed after stock is checked, pricing is agreed, and payment terms are settled. That avoids failed deliveries and outdated assumptions.',
  },
  {
    question: 'Can I collect in-store instead of using delivery?',
    answer:
      'Yes. Customers can arrange collection from the shop after confirming stock and readiness with the team.',
  },
];

export default function DeliveryPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Delivery Information', url: absoluteUrl('/delivery') },
        ]}
      />
      <FaqJsonLd questions={faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Delivery & Collection</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How delivery works at Cansan</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Buyers care about when they can get the product, not vague promises. This page sets expectations for Harare delivery, courier orders, and in-store collection.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Harare-first delivery support',
                body: 'The strongest delivery promise is local. Cansan can coordinate same-day or next-step delivery inside Harare when stock and timing allow.',
              },
              {
                title: 'Courier where practical',
                body: 'Nationwide delivery is available for many items, but it should be quoted and confirmed based on the product and destination.',
              },
              {
                title: 'Stock confirmation before movement',
                body: 'The process is designed to prevent wasted trips and failed drop-offs by confirming the item before delivery is arranged.',
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
            <h2 className="text-2xl font-bold text-zinc-900">Common delivery questions</h2>
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
            <h2 className="text-2xl font-bold">Need delivery timing before you order?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
              Send the product link and your location. We will confirm stock, collection readiness, or delivery options before you pay.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
                Ask About Delivery
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
