'use client';

interface ProductSkeletonProps {
  count?: number;
}

export function ProductSkeleton({ count = 8 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-4"
        >
          {/* Image skeleton */}
          <div className="mb-4 aspect-[4/3] animate-pulse rounded-xl bg-zinc-100" />
          
          {/* Title skeleton */}
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
          
          {/* Price skeleton */}
          <div className="mt-auto flex items-center justify-between">
            <div className="h-5 w-16 animate-pulse rounded bg-zinc-100" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3 w-10 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-2 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-14 animate-pulse rounded bg-zinc-100" />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-20 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
          
          <div className="mt-4 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100" />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-zinc-100" />
          </div>

          <div className="mt-4 h-10 w-32 animate-pulse rounded bg-zinc-100" />

          <div className="mt-6 flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-12 flex-1 animate-pulse rounded-full bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
