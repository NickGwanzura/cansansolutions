import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { InsightCard } from '@/components/InsightCard';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { getAllInsights } from '@/lib/articles';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Tech Buying Guides and Local Advice | Cansan Insights',
  description:
    'Read practical buying guides on laptops, CCTV, Wi-Fi, UPS, and business tech purchases in Harare and across Zimbabwe.',
  path: '/insights',
});

const topicLinks = [
  {
    href: '/products/category/laptops',
    label: 'Laptop Buying',
    description: 'For students, offices, and everyday use.',
  },
  {
    href: '/products/category/networking',
    label: 'Home and Office Wi-Fi',
    description: 'Routers, access points, and setup decisions.',
  },
  {
    href: '/services',
    label: 'Installation and Support',
    description: 'CCTV, networking, and after-sales guidance.',
  },
  {
    href: '/bulk-orders',
    label: 'Business Procurement',
    description: 'Quotes for schools, SMEs, and organisations.',
  },
];

export default function InsightsPage() {
  const insights = getAllInsights();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Insights', url: absoluteUrl('/insights') },
        ]}
      />

      <div>
        <PageHero
          eyebrow="Insights"
          title="Buying guides that help customers choose faster"
          description="These guides target the questions buyers ask before they commit: what to buy, what to avoid, and which options make sense for Harare and Zimbabwean buyers."
          actions={
            <>
              <Link href="/products" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-50">
                Browse products
              </Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Ask for advice
              </Link>
            </>
          }
        />

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-4">
            {topicLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-1 hover:border-zinc-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {insights.map((article) => (
              <InsightCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-red-600 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Need help turning research into the right order?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-100">
              Read the guides, shortlist what fits, then ask Cansan for a quote. The goal is not vanity traffic. The goal is making the buying decision easier.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                Browse products
              </Link>
              <Link href="/contact" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Contact Cansan
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
