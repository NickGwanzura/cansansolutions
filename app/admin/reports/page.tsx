'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

type ReportData = {
  summary: {
    totalRevenue: number;
    totalReceived: number;
    totalExpenses: number;
    netProfit: number;
    outstanding: number;
    overdue: number;
  };
  months: { key: string; label: string; revenue: number; expenses: number }[];
  statusSummary: { status: string; count: number; amount: number }[];
  categoryTotals: Record<string, number>;
  topCustomers: { name: string; invoiceCount: number; totalInvoiced: number; totalPaid: number }[];
  activity: { type: string; description: string; amount: number; currency: string; date: string }[];
};

const CATEGORY_COLORS: Record<string, string> = {
  rent: 'bg-purple-500',
  utilities: 'bg-blue-500',
  salaries: 'bg-indigo-500',
  inventory: 'bg-orange-500',
  marketing: 'bg-pink-500',
  transport: 'bg-teal-500',
  equipment: 'bg-cyan-500',
  maintenance: 'bg-yellow-500',
  taxes: 'bg-red-500',
  other: 'bg-zinc-500',
};

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-500',
  sent: 'bg-blue-500',
  draft: 'bg-zinc-400',
  overdue: 'bg-red-500',
  cancelled: 'bg-zinc-300',
};

const TYPE_BADGE: Record<string, string> = {
  invoice: 'bg-blue-100 text-blue-700',
  receipt: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
};

function fmtCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReportsAdmin() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) setData(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const { downloadElementAsPdf } = await import('@/lib/pdf');
      const stamp = new Date().toISOString().slice(0, 10);
      await downloadElementAsPdf('report-print', `financial-report-${stamp}.pdf`, '', 'paginate');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <main className="p-6 flex h-96 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </main>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <main className="p-6">
          <p className="text-zinc-500">Failed to load report data.</p>
        </main>
      </AdminLayout>
    );
  }

  const { summary, months, statusSummary, categoryTotals, topCustomers, activity } = data;

  // Compute max for bar charts
  const maxMonthly = Math.max(...months.map((m) => Math.max(m.revenue, m.expenses)), 1);
  const maxStatus = Math.max(...statusSummary.map((s) => s.amount), 1);
  const totalExpenseAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <AdminLayout onLogout={handleLogout}>
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Financial Reports</h1>
          <button
            onClick={downloadReport}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>

        <div id="report-print" className="space-y-6 bg-white">

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">{fmtCurrency(summary.totalRevenue)}</p>
            <p className="text-[10px] text-zinc-400">Paid invoices</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Received</p>
            <p className="text-xl font-bold text-green-600">{fmtCurrency(summary.totalReceived)}</p>
            <p className="text-[10px] text-zinc-400">All receipts</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">{fmtCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Net Profit</p>
            <p className={`text-xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtCurrency(summary.netProfit)}</p>
            <p className="text-[10px] text-zinc-400">Receipts - Expenses</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Outstanding</p>
            <p className="text-xl font-bold text-blue-600">{fmtCurrency(summary.outstanding)}</p>
            <p className="text-[10px] text-zinc-400">Draft + Sent</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Overdue</p>
            <p className="text-xl font-bold text-red-600">{fmtCurrency(summary.overdue)}</p>
          </div>
        </div>

        {/* 2. Monthly Revenue vs Expenses */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Monthly Revenue vs Expenses (Last 6 Months)</h2>
          <div className="flex items-end gap-4 h-48">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end w-full h-40">
                  <div className="flex-1 flex flex-col justify-end h-full">
                    <div
                      className="bg-green-500 rounded-t-sm w-full min-h-[2px]"
                      style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                      title={`Revenue: ${fmtCurrency(m.revenue)}`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-end h-full">
                    <div
                      className="bg-red-500 rounded-t-sm w-full min-h-[2px]"
                      style={{ height: `${(m.expenses / maxMonthly) * 100}%` }}
                      title={`Expenses: ${fmtCurrency(m.expenses)}`}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> Expenses</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3. Invoice Status Breakdown */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Invoice Status Breakdown</h2>
            <div className="space-y-3">
              {statusSummary.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-zinc-700">{s.status}</span>
                    <span className="text-zinc-500">{s.count} invoices · {fmtCurrency(s.amount)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[s.status] || 'bg-zinc-400'}`}
                      style={{ width: `${(s.amount / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Expense Breakdown by Category */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Expense Breakdown by Category</h2>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-zinc-700">{cat}</span>
                      <span className="text-zinc-500">{fmtCurrency(amount)} · {((amount / totalExpenseAmount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[cat] || 'bg-zinc-400'}`}
                        style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              {Object.keys(categoryTotals).length === 0 && (
                <p className="text-sm text-zinc-400">No expenses recorded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* 5. Top Customers */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Top Customers</h2>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-zinc-400">No invoices recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left">
                    <th className="px-4 py-2 font-semibold text-zinc-500">Customer</th>
                    <th className="px-4 py-2 font-semibold text-zinc-500 text-right">Invoices</th>
                    <th className="px-4 py-2 font-semibold text-zinc-500 text-right">Total Invoiced</th>
                    <th className="px-4 py-2 font-semibold text-zinc-500 text-right">Total Paid</th>
                    <th className="px-4 py-2 font-semibold text-zinc-500 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr key={c.name} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="px-4 py-2 font-medium text-zinc-900">{c.name}</td>
                      <td className="px-4 py-2 text-right text-zinc-600">{c.invoiceCount}</td>
                      <td className="px-4 py-2 text-right text-zinc-600">{fmtCurrency(c.totalInvoiced)}</td>
                      <td className="px-4 py-2 text-right text-green-600">{fmtCurrency(c.totalPaid)}</td>
                      <td className="px-4 py-2 text-right text-red-600">{fmtCurrency(c.totalInvoiced - c.totalPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 6. Recent Activity */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[item.type] || 'bg-zinc-100 text-zinc-600'}`}>
                      {item.type}
                    </span>
                    <span className="text-sm text-zinc-700">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-zinc-500">{fmtDate(item.date)}</span>
                    <span className={`font-medium ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {item.type === 'expense' ? '-' : '+'}{fmtCurrency(item.amount, item.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </AdminLayout>
  );
}
