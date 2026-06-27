import { ProductSkeleton } from '@/components/ProductSkeleton';

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-zinc-100" />
      <div className="mb-8 h-4 w-96 animate-pulse rounded bg-zinc-100" />
      <ProductSkeleton count={8} />
    </div>
  );
}
