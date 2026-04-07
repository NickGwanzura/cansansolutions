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
      className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        <span>{article.categoryLabel}</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>{article.readTimeMinutes} min read</span>
      </div>

      <h3 className="mt-4 text-xl font-bold leading-tight text-zinc-900 group-hover:text-red-600">
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

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-500">{formatInsightDate(article.publishedAt)}</span>
        <span className="font-semibold text-red-600 group-hover:underline">Read guide</span>
      </div>
    </Link>
  );
}
