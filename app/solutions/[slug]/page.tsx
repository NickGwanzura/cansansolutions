import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from '@/components/JsonLd';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import {
  getAllSolutions,
  getSolutionBySlug,
  getSolutionHref,
} from '@/lib/solutions';

export const revalidate = 300;

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllSolutions().map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    return {
      title: 'Solution Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    ...buildAbsoluteMetadata({
      title: solution.title,
      description: solution.description,
      path: getSolutionHref(solution.slug),
    }),
    keywords: [solution.primaryKeyword, solution.intent, solution.eyebrow],
  };
}

export default async function SolutionPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  return (
    <>
      <ServiceJsonLd
        name={solution.title}
        description={solution.description}
        path={getSolutionHref(solution.slug)}
        serviceType={solution.eyebrow}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Solutions', url: absoluteUrl('/solutions') },
          { name: solution.title, url: absoluteUrl(getSolutionHref(solution.slug)) },
        ]}
      />
      <FaqJsonLd questions={solution.faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">{solution.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{solution.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-400">{solution.heroBody}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.82fr]">
            <div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Who this page is for</p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-700">{solution.buyerSummary}</p>

                <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">What buyers usually need help with</p>
                  <ul className="mt-4 space-y-3">
                    {solution.proofPoints.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-900">{solution.checklistTitle}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {solution.checklist.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                      <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-900">{solution.processTitle}</h2>
                <div className="mt-6 space-y-4">
                  {solution.processSteps.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-600">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                <h2 className="text-2xl font-bold text-zinc-900">Frequently asked questions</h2>
                <div className="mt-6 space-y-4">
                  {solution.faqs.map((faq) => (
                    <div key={faq.question} className="rounded-2xl border border-zinc-200 bg-white p-5">
                      <h3 className="text-sm font-semibold text-zinc-900">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Why this works</p>
                <h2 className="mt-3 text-lg font-semibold text-zinc-900">{solution.fitTitle}</h2>
                <ul className="mt-4 space-y-3">
                  {solution.fitBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommended next steps</p>
                <div className="mt-4 space-y-3">
                  {solution.relatedLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-red-200 hover:bg-red-50/40"
                    >
                      <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-red-600 p-6 text-white">
                <h2 className="text-xl font-bold">Ready to move this solution forward?</h2>
                <p className="mt-3 text-sm leading-relaxed text-red-100">
                  Use the quote or contact path below and send the problem, budget, and timeline. That gets the conversation out of guesswork and into a real buying decision.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={solution.primaryCtaHref} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                    {solution.primaryCtaLabel}
                  </Link>
                  <Link href={solution.secondaryCtaHref} className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    {solution.secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
