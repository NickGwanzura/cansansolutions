import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">&#128533;</div>
      <h1 className="font-heading text-2xl font-bold text-zinc-900 mb-2">Page not found</h1>
      <p className="max-w-md text-sm text-zinc-500 mb-8">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        Go Home
      </Link>
    </div>
  );
}
