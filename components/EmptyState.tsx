'use client';

import Link from 'next/link';

interface EmptyStateProps {
  type: 'search' | 'cart' | 'products' | 'error';
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const icons = {
  search: (
    <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  cart: (
    <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  products: (
    <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  error: (
    <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  ),
};

const defaultContent = {
  search: {
    title: 'No products found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  cart: {
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet.',
  },
  products: {
    title: 'No products available',
    description: 'Check back later for new arrivals.',
  },
  error: {
    title: 'Something went wrong',
    description: 'We couldn\'t load the content. Please try again.',
  },
};

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const content = defaultContent[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-zinc-200">
        {icons[type]}
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">
        {title || content.title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-zinc-500">
        {description || content.description}
      </p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
