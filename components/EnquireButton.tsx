import Link from 'next/link';
import { WA_NUMBER } from '@/lib/site';

type Props = {
  text?: string;
  className?: string;
};

export function EnquireButton({
  className = '',
  text = "Hi Cansan Solutions, I'd like to enquire about a product.",
}: Props) {
  const encoded = encodeURIComponent(text);
  const href = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${className}`}
    >
      <span>WhatsApp Us</span>
    </Link>
  );
}
