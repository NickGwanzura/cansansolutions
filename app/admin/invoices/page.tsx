'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceStatus, LineItem, CustomerInfo } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';

const CURRENCIES = ['USD', 'KES', 'ZAR'];
const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-zinc-100 text-zinc-400 line-through',
};

function emptyCustomer(): CustomerInfo {
  return { name: '', email: '', phone: '', address: '', company: '' };
}

function emptyLineItem(): LineItem {
  return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: '', quantity: 1, unitPrice: 0, total: 0 };
}

function emptyInvoice(): Invoice {
  return {
    id: '',
    number: '',
    status: 'draft',
    customer: emptyCustomer(),
    lineItems: [emptyLineItem()],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
    notes: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  };
}

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function InvoicesAdmin() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [printing, setPrinting] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/invoices');
      if (res.ok) setInvoices(await res.json());
    } catch {
      setMessage('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const recalc = useCallback((inv: Invoice): Invoice => {
    const lineItems = inv.lineItems.map((li) => ({ ...li, total: li.quantity * li.unitPrice }));
    const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
    const taxAmount = subtotal * inv.taxRate / 100;
    const total = subtotal + taxAmount - inv.discount;
    return { ...inv, lineItems, subtotal, taxAmount, total };
  }, []);

  const saveInvoice = async (invoice: Invoice) => {
    setSaving(true);
    try {
      const isNew = !invoice.id || !invoices.find((i) => i.id === invoice.id);
      const url = isNew ? '/api/admin/invoices' : `/api/admin/invoices/${invoice.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (res.ok) {
        setMessage(isNew ? 'Invoice created' : 'Invoice updated');
        setEditing(null);
        fetchInvoices();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Error saving invoice');
    } finally {
      setSaving(false);
    }
  };

  const removeInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Invoice deleted');
        fetchInvoices();
      }
    } catch {
      setMessage('Error deleting invoice');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (inv?: Invoice) => {
    if (inv) {
      setEditing({ ...inv });
    } else {
      setEditing({ ...emptyInvoice(), id: `inv-${Date.now()}` });
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (!editing) return;
    const items = [...editing.lineItems];
    items[index] = { ...items[index], [field]: value };
    setEditing(recalc({ ...editing, lineItems: items }));
  };

  const addLineItem = () => {
    if (!editing) return;
    setEditing({ ...editing, lineItems: [...editing.lineItems, emptyLineItem()] });
  };

  const removeLineItem = (index: number) => {
    if (!editing || editing.lineItems.length <= 1) return;
    const items = editing.lineItems.filter((_, i) => i !== index);
    setEditing(recalc({ ...editing, lineItems: items }));
  };

  // Stats
  const totalCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const paidAmount = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const outstandingAmount = invoices.filter((i) => ['draft', 'sent'].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

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
            <p className="text-xs font-medium text-zinc-500">Total Invoices</p>
            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{fmtCurrency(paidAmount, 'USD')}</p>
            <p className="text-xs text-zinc-400">{paidCount} invoices</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Outstanding</p>
            <p className="text-2xl font-bold text-blue-600">{fmtCurrency(outstandingAmount, 'USD')}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Invoices</h1>
          <button
            onClick={() => startEdit()}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invoice
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <svg className="mx-auto mb-3 text-zinc-300" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-zinc-500 mb-3">No invoices yet</p>
            <button onClick={() => startEdit()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  <th className="px-4 py-3 font-semibold text-zinc-500">Number</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Customer</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Date</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Status</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500 text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{inv.number}</td>
                    <td className="px-4 py-3 text-zinc-600">{inv.customer.name || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtCurrency(inv.total, inv.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(inv)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Edit</button>
                        <button onClick={() => setPrinting(inv)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Print</button>
                        <button onClick={() => removeInvoice(inv.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
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
            <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {invoices.find((i) => i.id === editing.id) ? 'Edit Invoice' : 'New Invoice'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); saveInvoice(recalc(editing)); }}
                className="flex-1 overflow-y-auto p-5 space-y-5"
              >
                {/* Customer */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Customer</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name</label>
                      <input value={editing.customer.name} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, name: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Email</label>
                      <input type="email" value={editing.customer.email} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, email: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Phone</label>
                      <input value={editing.customer.phone} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, phone: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Company</label>
                      <input value={editing.customer.company || ''} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, company: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Address</label>
                    <input value={editing.customer.address} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, address: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                  </div>
                </fieldset>

                {/* Line Items */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Line Items</legend>
                  <div className="space-y-2">
                    {editing.lineItems.map((li, idx) => (
                      <div key={li.id} className="flex gap-2 items-end">
                        <div className="flex-1">
                          {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Description</label>}
                          <input value={li.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Item description" required />
                        </div>
                        <div className="w-20">
                          {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Qty</label>}
                          <input type="number" min="1" value={li.quantity} onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                        </div>
                        <div className="w-28">
                          {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Unit Price</label>}
                          <input type="number" min="0" step="0.01" value={li.unitPrice} onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                        </div>
                        <div className="w-24 text-right">
                          {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Total</label>}
                          <p className="py-2 text-sm font-medium text-zinc-700">{fmtCurrency(li.quantity * li.unitPrice, editing.currency)}</p>
                        </div>
                        <button type="button" onClick={() => removeLineItem(idx)} className="pb-2 text-zinc-400 hover:text-red-500" title="Remove">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addLineItem} className="text-xs font-semibold text-red-600 hover:text-red-700">+ Add Line Item</button>
                </fieldset>

                {/* Totals & Meta */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Issue Date</label>
                        <input type="date" value={editing.issueDate} onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Due Date</label>
                        <input type="date" value={editing.dueDate} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Currency</label>
                        <select value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Status</label>
                        <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as InvoiceStatus })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Notes</label>
                      <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Payment terms, notes..." />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl bg-zinc-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-medium">{fmtCurrency(recalc(editing).subtotal, editing.currency)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">Tax Rate (%)</span>
                      <input type="number" min="0" step="0.01" value={editing.taxRate} onChange={(e) => setEditing(recalc({ ...editing, taxRate: parseFloat(e.target.value) || 0 }))} className="w-20 ml-auto rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Tax Amount</span>
                      <span>{fmtCurrency(recalc(editing).taxAmount, editing.currency)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">Discount</span>
                      <input type="number" min="0" step="0.01" value={editing.discount} onChange={(e) => setEditing(recalc({ ...editing, discount: parseFloat(e.target.value) || 0 }))} className="w-24 ml-auto rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right" />
                    </div>
                    <hr className="border-zinc-200" />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{fmtCurrency(recalc(editing).total, editing.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Invoice'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Print View */}
        {printing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-transparent">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl print:shadow-none print:rounded-none print:max-h-none print:max-w-none">
              {/* Print controls - hidden when printing */}
              <div className="flex justify-between items-center p-4 border-b border-zinc-100 print:hidden">
                <h3 className="font-semibold text-zinc-900">Invoice Preview</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Print</button>
                  <button onClick={() => setPrinting(null)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50">Close</button>
                </div>
              </div>

              {/* Printable content */}
              <div className="p-8 print:p-0" id="invoice-print">
                {/* Header bar */}
                <div className="h-2 bg-red-600 rounded-t-sm mb-8 -mx-8 -mt-8 print:rounded-none" />

                <div className="flex justify-between items-start mb-8">
                  {/* Company info */}
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/brand/cansan-logo.png"
                      alt="Cansan Solutions"
                      className="h-12 w-auto mb-3"
                    />
                    <p className="text-xs text-zinc-500 leading-5">Shop 7, ZB House, Corner Speke &amp; 1st Street</p>
                    <p className="text-xs text-zinc-500 leading-5">Harare, Zimbabwe</p>
                    <p className="text-xs text-zinc-500 leading-5">+263 77 375 4747</p>
                    <p className="text-xs text-zinc-500 leading-5">info@cansansolutions.co.zw</p>
                    <p className="text-xs text-zinc-500 leading-5">www.cansansolutions.co.zw</p>
                  </div>
                  {/* Document title */}
                  <div className="text-right">
                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">INVOICE</h2>
                    <p className="text-xl font-bold text-red-600 mt-1">{printing.number}</p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      printing.status === 'paid' ? 'bg-green-100 text-green-700' :
                      printing.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      printing.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      printing.status === 'cancelled' ? 'bg-zinc-100 text-zinc-500' :
                      'bg-amber-100 text-amber-700'
                    }`}>{printing.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Bill To</p>
                    <p className="font-semibold text-zinc-900">{printing.customer.name}</p>
                    {printing.customer.company && <p className="text-sm text-zinc-600">{printing.customer.company}</p>}
                    <p className="text-sm text-zinc-600">{printing.customer.email}</p>
                    <p className="text-sm text-zinc-600">{printing.customer.phone}</p>
                    <p className="text-sm text-zinc-600">{printing.customer.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Details</p>
                    <p className="text-sm text-zinc-600">Issue Date: <span className="font-medium text-zinc-900">{fmtDate(printing.issueDate)}</span></p>
                    <p className="text-sm text-zinc-600">Due Date: <span className="font-medium text-zinc-900">{fmtDate(printing.dueDate)}</span></p>
                    <p className="text-sm text-zinc-600">Currency: <span className="font-medium text-zinc-900">{printing.currency}</span></p>
                  </div>
                </div>

                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-zinc-900">
                      <th className="text-left py-2 text-xs font-bold text-zinc-500 uppercase">Description</th>
                      <th className="text-right py-2 text-xs font-bold text-zinc-500 uppercase">Qty</th>
                      <th className="text-right py-2 text-xs font-bold text-zinc-500 uppercase">Unit Price</th>
                      <th className="text-right py-2 text-xs font-bold text-zinc-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printing.lineItems.map((li) => (
                      <tr key={li.id} className="border-b border-zinc-100">
                        <td className="py-2.5 text-sm text-zinc-900">{li.description}</td>
                        <td className="py-2.5 text-sm text-zinc-600 text-right">{li.quantity}</td>
                        <td className="py-2.5 text-sm text-zinc-600 text-right">{fmtCurrency(li.unitPrice, printing.currency)}</td>
                        <td className="py-2.5 text-sm font-medium text-zinc-900 text-right">{fmtCurrency(li.total, printing.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-zinc-500">Subtotal</span><span>{fmtCurrency(printing.subtotal, printing.currency)}</span></div>
                    {printing.taxRate > 0 && <div className="flex justify-between text-sm"><span className="text-zinc-500">Tax ({printing.taxRate}%)</span><span>{fmtCurrency(printing.taxAmount, printing.currency)}</span></div>}
                    {printing.discount > 0 && <div className="flex justify-between text-sm"><span className="text-zinc-500">Discount</span><span>-{fmtCurrency(printing.discount, printing.currency)}</span></div>}
                    <hr className="border-zinc-300" />
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{fmtCurrency(printing.total, printing.currency)}</span></div>
                  </div>
                </div>

                {printing.notes && (
                  <div className="mt-8 pt-4 border-t border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Notes</p>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap">{printing.notes}</p>
                  </div>
                )}

                {/* Print footer */}
                <div className="mt-12 pt-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-400">
                  <span>Cansan Solutions · Shop 7, ZB House, Harare, Zimbabwe</span>
                  <span>info@cansansolutions.co.zw · +263 77 375 4747</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
        }
      `}</style>
    </AdminLayout>
  );
}
