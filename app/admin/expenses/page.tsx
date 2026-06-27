'use client';

import { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';
import { downloadCsv } from '@/lib/csv-export';

const CURRENCIES = ['USD', 'ZWL', 'ZAR', 'KES'];

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'transport', label: 'Transport' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent: 'bg-purple-100 text-purple-700',
  utilities: 'bg-blue-100 text-blue-700',
  salaries: 'bg-indigo-100 text-indigo-700',
  inventory: 'bg-orange-100 text-orange-700',
  marketing: 'bg-pink-100 text-pink-700',
  transport: 'bg-teal-100 text-teal-700',
  equipment: 'bg-cyan-100 text-cyan-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  taxes: 'bg-red-100 text-red-700',
  other: 'bg-zinc-100 text-zinc-600',
};

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function emptyExpense(): Expense {
  return {
    id: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    description: '',
    amount: 0,
    currency: 'USD',
    vendor: '',
    notes: '',
  };
}

export default function ExpensesAdmin() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/admin/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch {
      setMessage('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async (expense: Expense) => {
    setSaving(true);
    try {
      const isNew = !expense.id || !expenses.find((e) => e.id === expense.id);
      const url = isNew ? '/api/admin/expenses' : `/api/admin/expenses/${expense.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        setMessage(isNew ? 'Expense created' : 'Expense updated');
        setEditing(null);
        fetchExpenses();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Error saving expense');
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Expense deleted');
        fetchExpenses();
      }
    } catch {
      setMessage('Error deleting expense');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (e?: Expense) => {
    if (e) {
      setEditing({ ...e });
    } else {
      setEditing({ ...emptyExpense(), id: `exp-${Date.now()}` });
    }
  };

  // Get available month options
  const monthOptions: string[] = [];
  const monthSet = new Set<string>();
  for (const e of expenses) {
    if (e.date) {
      const m = e.date.substring(0, 7);
      if (!monthSet.has(m)) {
        monthSet.add(m);
        monthOptions.push(m);
      }
    }
  }
  monthOptions.sort().reverse();

  // Filter expenses
  const filtered = expenses.filter((e) => {
    if (filterMonth && !e.date.startsWith(filterMonth)) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.description.toLowerCase().includes(q) && !e.vendor.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTotal = expenses.filter((e) => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.amount, 0);

  const categoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  }
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <AdminLayout onLogout={handleLogout}>
      <main className="p-6">
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex justify-between items-center">
            {message}
            <button onClick={() => setMessage('')} className="text-green-500 hover:text-green-700">&#10005;</button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Expenses</p>
            <p className="text-2xl font-bold text-zinc-900">{fmtCurrency(totalExpenses, 'USD')}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">This Month</p>
            <p className="text-2xl font-bold text-red-600">{fmtCurrency(thisMonthTotal, 'USD')}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Top Category</p>
            <p className="text-2xl font-bold text-zinc-900">{topCategory ? CATEGORIES.find((c) => c.value === topCategory[0])?.label || topCategory[0] : '-'}</p>
            {topCategory && <p className="text-xs text-zinc-400">{fmtCurrency(topCategory[1], 'USD')}</p>}
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Entries</p>
            <p className="text-2xl font-bold text-zinc-900">{expenses.length}</p>
          </div>
        </div>

        {/* Header + Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-zinc-900">Expenses</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCsv(
                `expenses-${new Date().toISOString().slice(0, 10)}.csv`,
                [
                  { header: 'Date', get: (e: Expense) => e.date },
                  { header: 'Category', get: (e: Expense) => e.category },
                  { header: 'Description', get: (e: Expense) => e.description },
                  { header: 'Vendor', get: (e: Expense) => e.vendor },
                  { header: 'Amount', get: (e: Expense) => e.amount.toFixed(2) },
                  { header: 'Currency', get: (e: Expense) => e.currency },
                  { header: 'Notes', get: (e: Expense) => e.notes || '' },
                ],
                expenses,
              )}
              disabled={expenses.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => startEdit()}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Expense
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">All Months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description or vendor..."
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <svg className="mx-auto mb-3 text-zinc-300" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <p className="text-zinc-500 mb-3">No expenses found</p>
            <button onClick={() => startEdit()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  <th className="px-4 py-3 font-semibold text-zinc-500">Date</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Category</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Description</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Vendor</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500 text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(exp.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[exp.category]}`}>
                        {CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-900">{exp.description}</td>
                    <td className="px-4 py-3 text-zinc-500">{exp.vendor || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtCurrency(exp.amount, exp.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(exp)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Edit</button>
                        <button onClick={() => removeExpense(exp.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {expenses.find((e) => e.id === editing.id) ? 'Edit Expense' : 'New Expense'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); saveExpense(editing); }}
                className="flex-1 overflow-y-auto p-5 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Date</label>
                    <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Category</label>
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as ExpenseCategory })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                  <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="What was this expense for?" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Vendor (optional)</label>
                  <input value={editing.vendor} onChange={(e) => setEditing({ ...editing, vendor: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Supplier / vendor name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Amount</label>
                    <input type="number" min="0" step="0.01" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Currency</label>
                    <select value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Notes (optional)</label>
                  <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Additional notes..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Expense'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
