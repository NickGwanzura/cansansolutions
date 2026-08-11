'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import AdminLayout from './components/AdminLayout';
import AdminAuthGate from './components/AdminAuthGate';

type OverviewData = {
  summary: {
    mtdInvoiced: number;
    mtdReceived: number;
    mtdExpenses: number;
    netCashMtd: number;
    outstanding: number;
    outstandingCount: number;
    overdueAmount: number;
    overdueCount: number;
    quotesPending: number;
    quotesPendingCount: number;
    acceptedQuotesMtd: number;
    totalClients: number;
    totalProducts: number;
  };
  attention: {
    overdueInvoices: {
      id: string;
      number: string;
      customer: string;
      total: number;
      currency: string;
      dueDate: string;
      daysLate: number;
    }[];
    expiringQuotes: {
      id: string;
      number: string;
      customer: string;
      total: number;
      currency: string;
      validUntil: string;
      daysLeft: number;
    }[];
    outOfStockFeatured: { id: string; slug: string; name: string; category: string }[];
    lowStock: { id: string; slug: string; name: string; stockCount: number }[];
  };
  months: { key: string; label: string; revenue: number; expenses: number }[];
  topCustomers: { name: string; invoiceCount: number; totalInvoiced: number; totalPaid: number }[];
  activity: {
    type: string;
    label: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    href: string;
  }[];
};

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function AdminActionIcon({ type }: { type: string }) {
  const shared = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const paths: Record<string, ReactNode> = {
    invoice: (
      <>
        <path {...shared} d="M7 3h7l3 3v15H7z" />
        <path {...shared} d="M14 3v4h4M10 11h4M10 15h4" />
      </>
    ),
    quote: (
      <>
        <path {...shared} d="M6 3h9l3 3v15H6z" />
        <path {...shared} d="M10 12h5M10 16h5" />
        <path {...shared} d="m9 9 5-5" />
      </>
    ),
    receipt: (
      <>
        <path {...shared} d="M7 3h10v18l-2-1.5-3 1.5-3-1.5L7 21z" />
        <path {...shared} d="M10 8h4M10 12h4M10 16h2" />
      </>
    ),
    expense: (
      <>
        <circle {...shared} cx="12" cy="12" r="8" />
        <path
          {...shared}
          d="M14.5 9.5c-.5-.7-1.3-1-2.4-1-1.4 0-2.3.7-2.3 1.7 0 2.6 4.7 1.1 4.7 3.8 0 1.1-.9 1.8-2.5 1.8-1.1 0-2-.4-2.7-1.2M12 7v10"
        />
      </>
    ),
    delivery: (
      <>
        <path {...shared} d="M3 6h11v10H3zM14 10h3l3 3v3h-6z" />
        <circle {...shared} cx="7" cy="18" r="1.5" />
        <circle {...shared} cx="17" cy="18" r="1.5" />
      </>
    ),
    product: (
      <>
        <path {...shared} d="m4 8 8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      {paths[type] || paths.product}
    </svg>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  href?: string;
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-green-600'
      : tone === 'warning'
        ? 'text-amber-600'
        : tone === 'danger'
          ? 'text-red-600'
          : 'text-zinc-900';
  const Card = (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className={`font-heading text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
      {hint && <p className="text-[11px] text-zinc-400 mt-0.5">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{Card}</Link> : Card;
}

function RevenueChart({ months }: { months: OverviewData['months'] }) {
  const maxVal = Math.max(1, ...months.flatMap((m) => [m.revenue, m.expenses]));
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Revenue vs Expenses
          </p>
          <p className="text-sm font-semibold text-zinc-900 mt-0.5">Last 12 months</p>
        </div>
        <div className="flex gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Expenses
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-48">
        {months.map((m) => {
          const rPct = (m.revenue / maxVal) * 100;
          const ePct = (m.expenses / maxVal) * 100;
          return (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${m.label}: Rev ${fmt(m.revenue)} / Exp ${fmt(m.expenses)}`}
            >
              <div className="flex items-end gap-0.5 h-full w-full justify-center">
                <div
                  className="w-2.5 rounded-t-sm bg-green-500 transition-all"
                  style={{ height: `${rPct}%` }}
                />
                <div
                  className="w-2.5 rounded-t-sm bg-red-400 transition-all"
                  style={{ height: `${ePct}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttentionSection({ attention }: { attention: OverviewData['attention'] }) {
  const sections = [
    {
      key: 'overdue',
      title: 'Overdue Invoices',
      tone: 'bg-red-50 text-red-700 border-red-100',
      items: attention.overdueInvoices.map((i) => ({
        key: i.id,
        primary: `${i.number} · ${i.customer}`,
        secondary: `${i.daysLate}d late · due ${fmtDate(i.dueDate)}`,
        amount: fmt(i.total, i.currency),
        href: '/admin/invoices',
      })),
      empty: 'No overdue invoices',
    },
    {
      key: 'quotes',
      title: 'Quotes Expiring ≤ 7d',
      tone: 'bg-amber-50 text-amber-700 border-amber-100',
      items: attention.expiringQuotes.map((q) => ({
        key: q.id,
        primary: `${q.number} · ${q.customer}`,
        secondary:
          q.daysLeft === 0
            ? 'Expires today'
            : `${q.daysLeft}d left · valid to ${fmtDate(q.validUntil)}`,
        amount: fmt(q.total, q.currency),
        href: '/admin/quotes',
      })),
      empty: 'No quotes expiring soon',
    },
    {
      key: 'stock',
      title: 'Out-of-Stock Featured',
      tone: 'bg-zinc-50 text-zinc-700 border-zinc-200',
      items: attention.outOfStockFeatured.map((p) => ({
        key: p.id,
        primary: p.name,
        secondary: p.category,
        amount: '',
        href: '/admin/products',
      })),
      empty: 'All featured products in stock',
    },
    {
      key: 'low',
      title: 'Low Stock',
      tone: 'bg-orange-50 text-orange-700 border-orange-100',
      items: attention.lowStock.map((p) => ({
        key: p.id,
        primary: p.name,
        secondary: `${p.stockCount} left`,
        amount: '',
        href: '/admin/products',
      })),
      empty: 'No low-stock items',
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Needs Your Attention
        </p>
        <p className="text-sm font-semibold text-zinc-900 mt-0.5">
          Action items across the business
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((s) => (
          <div key={s.key} className={`rounded-lg border ${s.tone} p-3`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide">{s.title}</span>
              <span className="text-[10px] font-semibold opacity-70">{s.items.length}</span>
            </div>
            {s.items.length === 0 ? (
              <p className="text-xs opacity-70">{s.empty}</p>
            ) : (
              <ul className="space-y-1.5">
                {s.items.map((it) => (
                  <li key={it.key}>
                    <Link
                      href={it.href}
                      className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-white/50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{it.primary}</p>
                        <p className="text-[10px] opacity-60 truncate">{it.secondary}</p>
                      </div>
                      {it.amount && <span className="font-semibold tabular-nums">{it.amount}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { href: '/admin/invoices', label: 'Invoice', icon: 'invoice' },
    { href: '/admin/quotes', label: 'Quote', icon: 'quote' },
    { href: '/admin/receipts', label: 'Receipt', icon: 'receipt' },
    { href: '/admin/delivery-notes', label: 'Delivery', icon: 'delivery' },
    { href: '/admin/expenses', label: 'Expense', icon: 'expense' },
    { href: '/admin/products', label: 'Product', icon: 'product' },
  ];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-100 bg-white p-3 text-center transition hover:border-red-200 hover:bg-red-50"
          >
            <span className="text-red-600">
              <AdminActionIcon type={a.icon} />
            </span>
            <span className="text-xs font-semibold text-zinc-700">+ {a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const TYPE_TONE: Record<string, string> = {
  invoice: 'text-blue-600',
  quote: 'text-amber-600',
  receipt: 'text-green-600',
  expense: 'text-red-600',
  delivery: 'text-purple-600',
};

function ActivityFeed({ activity }: { activity: OverviewData['activity'] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
        Recent Activity
      </p>
      {activity.length === 0 ? (
        <p className="text-sm text-zinc-400">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {activity.map((a, i) => (
            <li key={`${a.type}-${i}-${a.label}`}>
              <Link
                href={a.href}
                className="flex items-center gap-3 py-2 -mx-1 px-1 rounded hover:bg-zinc-50"
              >
                <span className={`shrink-0 ${TYPE_TONE[a.type] || 'text-zinc-500'}`}>
                  <AdminActionIcon type={a.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">{a.label}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {a.description} · {fmtDate(a.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                  {fmt(a.amount, a.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopCustomers({ customers }: { customers: OverviewData['topCustomers'] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
        Top Customers (90d)
      </p>
      {customers.length === 0 ? (
        <p className="text-sm text-zinc-400">No invoices in the last 90 days.</p>
      ) : (
        <ul className="space-y-2.5">
          {customers.map((c) => {
            const paidPct =
              c.totalInvoiced > 0 ? Math.round((c.totalPaid / c.totalInvoiced) * 100) : 0;
            return (
              <li key={c.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-800 truncate">{c.name}</p>
                    <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                      {fmt(c.totalInvoiced)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${paidPct}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-400 tabular-nums">
                      {paidPct}% paid · {c.invoiceCount}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DashboardOverview({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json().catch(() => ({})))))
      .then((d: OverviewData) => setData(d))
      .catch((e) => setError(e?.error || 'Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout onLogout={onLogout}>
      <main className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Live snapshot of receivables, expenses, and inventory.
            </p>
          </div>
          <Link
            href="/admin/reports"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-white"
          >
            Full reports →
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <KpiCard
                label="Received MTD"
                value={fmt(data.summary.mtdReceived)}
                hint="payments received"
                tone="positive"
                href="/admin/receipts"
              />
              <KpiCard
                label="Invoiced MTD"
                value={fmt(data.summary.mtdInvoiced)}
                hint="new invoices issued"
                href="/admin/invoices"
              />
              <KpiCard
                label="Expenses MTD"
                value={fmt(data.summary.mtdExpenses)}
                hint="spent this month"
                tone="warning"
                href="/admin/expenses"
              />
              <KpiCard
                label="Net Cash MTD"
                value={fmt(data.summary.netCashMtd)}
                hint="received − expenses"
                tone={data.summary.netCashMtd >= 0 ? 'positive' : 'danger'}
              />
              <KpiCard
                label="Outstanding AR"
                value={fmt(data.summary.outstanding)}
                hint={`${data.summary.outstandingCount} invoice${data.summary.outstandingCount === 1 ? '' : 's'} unpaid`}
                href="/admin/invoices"
              />
              <KpiCard
                label="Overdue"
                value={fmt(data.summary.overdueAmount)}
                hint={`${data.summary.overdueCount} past due`}
                tone="danger"
                href="/admin/invoices"
              />
              <KpiCard
                label="Quotes Pending"
                value={fmt(data.summary.quotesPending)}
                hint={`${data.summary.quotesPendingCount} draft/sent`}
                href="/admin/quotes"
              />
              <KpiCard
                label="Accepted Quotes MTD"
                value={fmt(data.summary.acceptedQuotesMtd)}
                hint="won this month"
                tone="positive"
                href="/admin/quotes"
              />
            </div>

            <QuickActions />

            <AttentionSection attention={data.attention} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart months={data.months} />
              <TopCustomers customers={data.topCustomers} />
            </div>

            <ActivityFeed activity={data.activity} />
          </>
        )}
      </main>
    </AdminLayout>
  );
}

export default function AdminHomePage() {
  return (
    <AdminAuthGate>{({ onLogout }) => <DashboardOverview onLogout={onLogout} />}</AdminAuthGate>
  );
}
