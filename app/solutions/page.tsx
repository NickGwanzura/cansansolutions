import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { getAllSolutions, getSolutionHref } from '@/lib/solutions';

export const metadata: Metadata = buildAbsoluteMetadata({
  title: 'Commercial Tech Solutions in Harare | Office, CCTV, Wi-Fi, Backup',
  description:
    'Explore commercial tech solutions in Harare for office laptops, CCTV packages, home Wi-Fi setup, and load-shedding backup.',
  path: '/solutions',
});

export default function SolutionsPage() {
  const solutions = getAllSolutions();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Solutions', url: absoluteUrl('/solutions') },
        ]}
      />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Popular Buying Paths</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Choose the solution that matches what you need</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Some buyers need office laptops. Others need CCTV, stronger home Wi-Fi, or backup during load shedding. These pages help you go straight to the right conversation instead of browsing blindly.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {solutions.map((solution) => (
              <Link
                key={solution.slug}
                href={getSolutionHref(solution.slug)}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{solution.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-zinc-900 group-hover:text-red-600">
                  {solution.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{solution.shortDescription}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:underline">
                  Explore this solution
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
