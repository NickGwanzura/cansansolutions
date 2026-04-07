import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Payment Options | Buy Tech in Harare',
  description:
    'See the payment methods accepted by Cansan Solutions and how pricing confirmation works before you complete an order.',
  path: '/payments',
});

const faqs = [
  {
    question: 'Which payment methods do you accept?',
    answer:
      'Cansan accepts cash, bank transfer, and EcoCash according to the site business information. Buyers should confirm the preferred method for the specific order before payment.',
  },
  {
    question: 'Why are prices described as indicative?',
    answer:
      'Because stock, supplier cost changes, and deal conditions can shift. The site is designed to shortlist products, then confirm the final price with the store before payment is made.',
  },
  {
    question: 'Can I get an invoice or quote before paying?',
    answer:
      'Yes. This is especially important for business, office, school, or bulk purchases where internal approval may be required before payment.',
  },
  {
    question: 'Do you support bulk-order pricing discussions?',
    answer:
      'Yes. Larger orders should not be treated like one-off retail checkouts. Contact the store for a quote based on quantity, brands, and required timeline.',
  },
];

export default function PaymentsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Payment Options', url: absoluteUrl('/payments') },
        ]}
      />
      <FaqJsonLd questions={faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Payment Clarity</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How pricing and payment work</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Buyers should know the accepted payment methods and when a price becomes final. This page makes that explicit before the order moves forward.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Final price confirmed before payment',
                body: 'The site helps customers shortlist products, but the transaction is confirmed through direct communication before money changes hands.',
              },
              {
                title: 'Retail and business use cases',
                body: 'Smaller purchases may move quickly, while corporate, school, or office orders can be handled through quotes and invoices.',
              },
              {
                title: 'Clear next step',
                body: 'Instead of forcing checkout friction, Cansan uses WhatsApp and direct support to confirm the details that matter most.',
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
            <h2 className="text-2xl font-bold text-zinc-900">Frequently asked payment questions</h2>
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
          <div className="mx-auto max-w-5xl rounded-3xl bg-emerald-600 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Need a final quote before you pay?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
              Send the product links or quantities you want. We will confirm price, stock, and the best payment route for the order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/bulk-orders" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                Request a Quote
              </Link>
              <Link href="/contact" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Contact the Store
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
