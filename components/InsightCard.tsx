import Link from 'next/link';
import type { InsightArticle } from '@/lib/articles';
import { formatInsightDate, getInsightHref } from '@/lib/articles';

interface InsightCardProps {
  article: InsightArticle;
}

export function InsightCard({ article }: InsightCardProps) {
  return (
    <Link
      href={getInsightHref(article.slug)}
      className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_2px_5px_rgba(24,24,27,0.06)] transition duration-200 hover:border-zinc-300 hover:shadow-[0_12px_28px_rgba(24,24,27,0.10)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 sm:p-7"
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        <span>{article.categoryLabel}</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>{article.readTimeMinutes} min read</span>
      </div>

      <h3 className="mt-4 text-xl font-bold leading-tight tracking-[-0.02em] text-zinc-900 transition-colors group-hover:text-red-700 sm:text-2xl">
        {article.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{article.excerpt}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600">
          {article.intent}
        </span>
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] text-zinc-500">
          {article.primaryKeyword}
        </span>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-sm">
        <span className="text-zinc-500">{formatInsightDate(article.publishedAt)}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-red-600">
          Read guide
          <svg
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
