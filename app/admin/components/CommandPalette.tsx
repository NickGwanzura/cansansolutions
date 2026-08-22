'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Invoice, Quote, Receipt, Client, Product } from '@/lib/types';

type Hit = {
  kind: 'invoice' | 'quote' | 'receipt' | 'client' | 'product' | 'nav';
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string;
};

const NAV_HITS: Hit[] = [
  { kind: 'nav', title: 'Dashboard', href: '/admin', keywords: 'home overview' },
  { kind: 'nav', title: 'Products', href: '/admin/products', keywords: 'catalog stock' },
  { kind: 'nav', title: 'Categories', href: '/admin/categories' },
  { kind: 'nav', title: 'Banners', href: '/admin/banners' },
  { kind: 'nav', title: 'Brands', href: '/admin/brands' },
  { kind: 'nav', title: 'Clients', href: '/admin/clients', keywords: 'customers' },
  { kind: 'nav', title: 'Invoices', href: '/admin/invoices', keywords: 'bills' },
  { kind: 'nav', title: 'Quotes', href: '/admin/quotes', keywords: 'quotations' },
  { kind: 'nav', title: 'Receipts', href: '/admin/receipts', keywords: 'payments' },
  { kind: 'nav', title: 'Delivery Notes', href: '/admin/delivery-notes' },
  { kind: 'nav', title: 'Expenses', href: '/admin/expenses' },
  { kind: 'nav', title: 'Reports', href: '/admin/reports' },
  { kind: 'nav', title: 'Analytics', href: '/admin/analytics' },
  { kind: 'nav', title: 'SEO Analytics', href: '/admin/seo' },
  { kind: 'nav', title: 'Settings', href: '/admin/settings' },
];

const KIND_LABEL: Record<Hit['kind'], string> = {
  invoice: 'Invoice',
  quote: 'Quote',
  receipt: 'Receipt',
  client: 'Client',
  product: 'Product',
  nav: 'Page',
};

const KIND_TONE: Record<Hit['kind'], string> = {
  invoice: 'text-blue-600 bg-blue-50',
  quote: 'text-amber-600 bg-amber-50',
  receipt: 'text-green-600 bg-green-50',
  client: 'text-purple-600 bg-purple-50',
  product: 'text-zinc-700 bg-zinc-100',
  nav: 'text-zinc-500 bg-zinc-50',
};

function fuzzyScore(hay: string, needle: string): number {
  if (!needle) return 0;
  const h = hay.toLowerCase();
  const n = needle.toLowerCase();
  if (h.includes(n)) return 1000 - h.indexOf(n) * 2 - h.length;
  let hi = 0;
  let score = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const idx = h.indexOf(n[ni], hi);
    if (idx === -1) return -1;
    score += 50 - (idx - hi);
    hi = idx + 1;
  }
  return score;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hotkey: ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (!open) {
          setQuery('');
          setSelected(0);
        }
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const openFromSidebar = () => {
      setQuery('');
      setSelected(0);
      setOpen(true);
    };
    window.addEventListener('open-admin-search', openFromSidebar);
    return () => window.removeEventListener('open-admin-search', openFromSidebar);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Lazy-load searchable data on first open
  const [data, setData] = useState<{
    invoices: Invoice[];
    quotes: Quote[];
    receipts: Receipt[];
    clients: Client[];
    products: Product[];
  } | null>(null);
  useEffect(() => {
    if (!open || data) return;
    Promise.all([
      fetch('/api/admin/invoices')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/admin/quotes')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/admin/receipts')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/admin/clients')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch('/api/products')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([invoices, quotes, receipts, clients, products]) => {
      setData({ invoices, quotes, receipts, clients, products });
    });
  }, [open, data]);

  const allHits = useMemo<Hit[]>(() => {
    const out: Hit[] = [...NAV_HITS];
    if (!data) return out;
    for (const i of data.invoices) {
      out.push({
        kind: 'invoice',
        title: `${i.number} · ${i.customer?.name || 'Unknown'}`,
        subtitle: `${i.status} · ${i.currency} ${i.total}`,
        href: '/admin/invoices',
      });
    }
    for (const q of data.quotes) {
      out.push({
        kind: 'quote',
        title: `${q.number} · ${q.customer?.name || 'Unknown'}`,
        subtitle: `${q.status} · ${q.currency} ${q.total}`,
        href: '/admin/quotes',
      });
    }
    for (const r of data.receipts) {
      out.push({
        kind: 'receipt',
        title: `${r.number} · ${r.customer?.name || 'Unknown'}`,
        subtitle: `${r.paymentMethod} · ${r.currency} ${r.total}`,
        href: '/admin/receipts',
      });
    }
    for (const c of data.clients) {
      out.push({
        kind: 'client',
        title: c.name,
        subtitle: [c.company, c.email].filter(Boolean).join(' · '),
        href: '/admin/clients',
        keywords: `${c.email} ${c.phone}`,
      });
    }
    for (const p of data.products) {
      out.push({
        kind: 'product',
        title: p.name,
        subtitle: `${p.category} · ${p.currency} ${p.price}`,
        href: '/admin/products',
        keywords: `${p.slug} ${(p.tags || []).join(' ')}`,
      });
    }
    return out;
  }, [data]);

  const hits = useMemo(() => {
    if (!query.trim()) {
      return NAV_HITS.slice(0, 8);
    }
    const q = query.trim();
    const scored = allHits
      .map((h) => ({
        hit: h,
        score: Math.max(
          fuzzyScore(h.title, q),
          fuzzyScore(h.subtitle || '', q) - 50,
          fuzzyScore(h.keywords || '', q) - 50,
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    return scored.map((s) => s.hit);
  }, [query, allHits]);

  const activeIndex = Math.min(selected, Math.max(0, hits.length - 1));

  const commit = (h: Hit | undefined) => {
    if (!h) return;
    setOpen(false);
    router.push(h.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(hits.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit(hits[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4">
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            className="text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 15.75 21 21m-9.75-1.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Jump to invoice, quote, client, product…"
            className="flex-1 py-4 text-sm outline-none placeholder-zinc-400"
          />
          <kbd className="text-[10px] font-semibold text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!data && <div className="px-4 py-8 text-center text-sm text-zinc-400">Loading…</div>}
          {hits.length === 0 && data && (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">No matches</div>
          )}
          {hits.map((h, i) => (
            <button
              key={`${h.kind}-${h.title}-${i}`}
              type="button"
              onMouseEnter={() => setSelected(i)}
              onClick={() => commit(h)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                i === activeIndex ? 'bg-zinc-50' : 'hover:bg-zinc-50'
              }`}
            >
              <span
                className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${KIND_TONE[h.kind]}`}
              >
                {KIND_LABEL[h.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">{h.title}</p>
                {h.subtitle && <p className="text-xs text-zinc-500 truncate">{h.subtitle}</p>}
              </div>
              {i === activeIndex && (
                <kbd className="text-[10px] font-semibold text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5">
                  ↵
                </kbd>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">
          <span>
            Press <kbd className="border border-zinc-200 rounded px-1">↑</kbd>{' '}
            <kbd className="border border-zinc-200 rounded px-1">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="border border-zinc-200 rounded px-1">⌘K</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
