import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import {
  formatInsightDate,
  getAllInsights,
  getInsightBySlug,
  getInsightHref,
} from '@/lib/articles';
import { buildAbsoluteMetadata } from '@/lib/seo';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

export const revalidate = 300;

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllInsights().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseMetadata = buildAbsoluteMetadata({
    title: `${article.title} | Cansan Insights`,
    description: article.description,
    path: getInsightHref(article.slug),
  });

  return {
    ...baseMetadata,
    keywords: [article.primaryKeyword, article.categoryLabel, article.intent],
    openGraph: {
      ...baseMetadata.openGraph,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [SITE_NAME],
    },
  };
}

export default async function InsightArticlePage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd
        headline={article.title}
        description={article.description}
        path={getInsightHref(article.slug)}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt}
        keywords={[article.primaryKeyword, article.categoryLabel, article.intent]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Insights', url: absoluteUrl('/insights') },
          { name: article.title, url: absoluteUrl(getInsightHref(article.slug)) },
        ]}
      />
      <FaqJsonLd questions={article.faqs} />

      <div>
        <section className="bg-zinc-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">{article.categoryLabel}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-zinc-400">
              <span>{formatInsightDate(article.publishedAt)}</span>
              <span>{article.readTimeMinutes} min read</span>
              <span>{article.intent}</span>
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-400">{article.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr]">
            <article>
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm leading-relaxed text-zinc-700">{article.intro}</p>
                <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Key takeaways</p>
                  <ul className="mt-4 space-y-3">
                    {article.takeaways.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {article.sections.map((section) => (
                  <section key={section.heading} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-zinc-900">{section.heading}</h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-relaxed text-zinc-600">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-5 space-y-3">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

              <section className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Frequently asked questions</p>
                <div className="mt-5 space-y-4">
                  {article.faqs.map((faq) => (
                    <div key={faq.question} className="rounded-2xl border border-zinc-200 bg-white p-5">
                      <h2 className="text-sm font-semibold text-zinc-900">{faq.question}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </article>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Target query</p>
                <p className="mt-3 text-lg font-semibold text-zinc-900">{article.primaryKeyword}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  This article is built to answer the buying question clearly and move the reader toward a product, service, or quote request.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommended next steps</p>
                <div className="mt-4 space-y-3">
                  {article.relatedLinks.map((item) => (
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
                <h2 className="text-xl font-bold">{article.cta.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-red-100">{article.cta.body}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={article.cta.primaryHref} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                    {article.cta.primaryLabel}
                  </Link>
                  <Link href={article.cta.secondaryHref} className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    {article.cta.secondaryLabel}
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
