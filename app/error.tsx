'use client';

import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">&#9888;</div>
      <h1 className="font-heading text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
      <p className="max-w-md text-sm text-zinc-500 mb-8">
        We encountered an unexpected error. Please try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
        >
          Go Home
        </Link>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-8 max-w-lg text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
}
