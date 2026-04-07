'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Receipt, PaymentMethod, LineItem, CustomerInfo, CompanyProfile, Product, Client } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';

const CURRENCIES = ['USD', 'KES', 'ZAR'];
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'other', label: 'Other' },
];

function emptyCustomer(): CustomerInfo {
  return { name: '', email: '', phone: '', address: '', company: '' };
}

function emptyLineItem(): LineItem {
  return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: '', quantity: 1, unitPrice: 0, total: 0 };
}

function emptyReceipt(): Receipt {
  return {
    id: '',
    number: '',
    invoiceId: '',
    customer: emptyCustomer(),
    lineItems: [emptyLineItem()],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
    paymentMethod: 'cash',
    notes: '',
    paidAt: new Date().toISOString().split('T')[0],
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

function paymentLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
}

export default function ReceiptsAdmin() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Receipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [printing, setPrinting] = useState<Receipt | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<Record<number, string>>({});
  const [showProductPicker, setShowProductPicker] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientPicker, setClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientCreating, setClientCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', address: '' });
  const [clientSaving, setClientSaving] = useState(false);

  useEffect(() => {
    fetchReceipts();
    fetch('/api/admin/company').then(r => r.ok ? r.json() : null).then(d => { if (d) setCompany(d); }).catch(() => {});
    fetch('/api/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
    fetch('/api/admin/clients').then(r => r.ok ? r.json() : []).then(setClients).catch(() => {});
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/admin/receipts');
      if (res.ok) setReceipts(await res.json());
    } catch {
      setMessage('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const recalc = useCallback((r: Receipt): Receipt => {
    const lineItems = r.lineItems.map((li) => ({ ...li, total: li.quantity * li.unitPrice }));
    const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
    const taxAmount = subtotal * r.taxRate / 100;
    const total = subtotal + taxAmount - r.discount;
    return { ...r, lineItems, subtotal, taxAmount, total };
  }, []);

  const saveReceipt = async (receipt: Receipt) => {
    setSaving(true);
    try {
      const isNew = !receipt.id || !receipts.find((r) => r.id === receipt.id);
      const url = isNew ? '/api/admin/receipts' : `/api/admin/receipts/${receipt.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt),
      });
      if (res.ok) {
        setMessage(isNew ? 'Receipt created' : 'Receipt updated');
        setEditing(null);
        fetchReceipts();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Error saving receipt');
    } finally {
      setSaving(false);
    }
  };

  const removeReceipt = async (id: string) => {
    if (!confirm('Delete this receipt?')) return;
    try {
      const res = await fetch(`/api/admin/receipts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Receipt deleted');
        fetchReceipts();
      }
    } catch {
      setMessage('Error deleting receipt');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (r?: Receipt) => {
    if (r) {
      setEditing({ ...r });
    } else {
      setClientPicker(true);
      setClientSearch('');
      setClientCreating(false);
      setNewClient({ name: '', company: '', email: '', phone: '', address: '' });
    }
  };

  const startEditWithClient = (client: Client) => {
    setEditing({
      ...emptyReceipt(),
      id: `rec-${Date.now()}`,
      customer: { name: client.name, email: client.email, phone: client.phone, address: client.address, company: client.company || '' },
    });
    setClientPicker(false);
  };

  const startEditBlank = () => {
    setEditing({ ...emptyReceipt(), id: `rec-${Date.now()}` });
    setClientPicker(false);
  };

  const handleQuickCreateClient = async () => {
    if (!newClient.name.trim()) return;
    setClientSaving(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        const saved = await res.json() as Client;
        setClients((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
        startEditWithClient(saved);
      }
    } catch {
      setMessage('Error creating client');
    } finally {
      setClientSaving(false);
    }
  };

  const changeClient = (client: Client) => {
    if (!editing) return;
    setEditing({
      ...editing,
      customer: { name: client.name, email: client.email, phone: client.phone, address: client.address, company: client.company || '' },
    });
    setClientPicker(false);
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

  const totalCount = receipts.length;
  const totalAmount = receipts.reduce((s, r) => s + r.total, 0);
  const cashCount = receipts.filter((r) => r.paymentMethod === 'cash').length;
  const cardCount = receipts.filter((r) => r.paymentMethod === 'card').length;

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
            <p className="text-xs font-medium text-zinc-500">Total Receipts</p>
            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">{fmtCurrency(totalAmount, 'USD')}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Cash Payments</p>
            <p className="text-2xl font-bold text-zinc-900">{cashCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Card Payments</p>
            <p className="text-2xl font-bold text-zinc-900">{cardCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Receipts</h1>
          <button
            onClick={() => startEdit()}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Receipt
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <svg className="mx-auto mb-3 text-zinc-300" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="text-zinc-500 mb-3">No receipts yet</p>
            <button onClick={() => startEdit()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Create First Receipt
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  <th className="px-4 py-3 font-semibold text-zinc-500">Number</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Customer</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Paid At</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Payment Method</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Invoice Ref</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500 text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{r.number}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.customer.name || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(r.paidAt)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {paymentLabel(r.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{r.invoiceId || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtCurrency(r.total, r.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(r)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Edit</button>
                        <button onClick={() => setPrinting(r)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Print</button>
                        <button onClick={() => removeReceipt(r.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
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
                  {receipts.find((r) => r.id === editing.id) ? 'Edit Receipt' : 'New Receipt'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); saveReceipt(recalc(editing)); }}
                className="flex-1 overflow-y-auto p-5 space-y-5"
              >
                {/* Customer */}
                <fieldset className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Customer</p>
                    <button type="button" onClick={() => { setClientPicker(true); setClientSearch(''); setClientCreating(false); }} className="text-xs text-red-500 hover:text-red-400">
                      Change Client
                    </button>
                  </div>
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
                        <div className="relative flex-1">
                          {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Description</label>}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setShowProductPicker(showProductPicker === idx ? null : idx)}
                              className="shrink-0 rounded-lg border border-zinc-200 px-2 py-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                              title="Search products"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                            </button>
                            <input value={li.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Item description" required />
                          </div>
                          {showProductPicker === idx && (
                            <div className="absolute left-0 top-full z-50 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-2">
                              <input
                                autoFocus
                                value={productSearch[idx] || ''}
                                onChange={(e) => setProductSearch({ ...productSearch, [idx]: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm mb-1"
                                placeholder="Search products..."
                                onKeyDown={(e) => { if (e.key === 'Escape') setShowProductPicker(null); }}
                              />
                              <div className="max-h-40 overflow-y-auto">
                                {products
                                  .filter((p) => !productSearch[idx] || p.name.toLowerCase().includes((productSearch[idx] || '').toLowerCase()))
                                  .slice(0, 6)
                                  .map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50"
                                      onClick={() => {
                                        updateLineItem(idx, 'description', p.name);
                                        updateLineItem(idx, 'unitPrice', p.price);
                                        setShowProductPicker(null);
                                        setProductSearch({ ...productSearch, [idx]: '' });
                                      }}
                                    >
                                      <span className="text-zinc-900 truncate">{p.name}</span>
                                      <span className="text-xs text-zinc-500 ml-2 shrink-0">{fmtCurrency(p.price, p.currency)}</span>
                                    </button>
                                  ))}
                                {products.filter((p) => !productSearch[idx] || p.name.toLowerCase().includes((productSearch[idx] || '').toLowerCase())).length === 0 && (
                                  <p className="text-xs text-zinc-400 p-2">No products found</p>
                                )}
                              </div>
                            </div>
                          )}
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
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Paid At</label>
                        <input type="date" value={editing.paidAt} onChange={(e) => setEditing({ ...editing, paidAt: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Payment Method</label>
                        <select value={editing.paymentMethod} onChange={(e) => setEditing({ ...editing, paymentMethod: e.target.value as PaymentMethod })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
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
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Invoice Ref (optional)</label>
                        <input value={editing.invoiceId || ''} onChange={(e) => setEditing({ ...editing, invoiceId: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="INV-0001" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Notes</label>
                      <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Additional notes..." />
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
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Receipt'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Print View */}
        {printing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-transparent">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl print:shadow-none print:rounded-none print:max-h-none print:max-w-none">
              <div className="flex justify-between items-center p-4 border-b border-zinc-100 print:hidden">
                <h3 className="font-semibold text-zinc-900">Receipt Preview</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Print</button>
                  <button onClick={() => setPrinting(null)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50">Close</button>
                </div>
              </div>

              <div className="p-8 print:p-0" id="receipt-print">
                {/* Header bar */}
                <div className="h-2 bg-red-600 rounded-t-sm mb-8 -mx-8 -mt-8 print:rounded-none" />

                <div className="flex justify-between items-start mb-8">
                  {/* Company info */}
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company?.logoUrl || '/images/brand/cansan-logo.png'}
                      alt={company?.name || 'Cansan Solutions'}
                      className="h-12 w-auto mb-3"
                    />
                    {company?.addressLine1 && <p className="text-xs text-zinc-500 leading-5">{company.addressLine1}</p>}
                    {company?.addressLine2 && <p className="text-xs text-zinc-500 leading-5">{company.addressLine2}</p>}
                    {(company?.city || company?.country) && <p className="text-xs text-zinc-500 leading-5">{[company?.city, company?.country].filter(Boolean).join(', ')}</p>}
                    {company?.phone && <p className="text-xs text-zinc-500 leading-5">{company.phone}</p>}
                    {company?.email && <p className="text-xs text-zinc-500 leading-5">{company.email}</p>}
                    {company?.website && <p className="text-xs text-zinc-500 leading-5">{company.website}</p>}
                    {company?.vatNumber && <p className="text-xs text-zinc-500 leading-5">VAT: {company.vatNumber}</p>}
                  </div>
                  {/* Document title */}
                  <div className="text-right">
                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">RECEIPT</h2>
                    <p className="text-xl font-bold text-red-600 mt-1">{printing.number}</p>
                    <span className="mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-700">Paid</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Received From</p>
                    <p className="font-semibold text-zinc-900">{printing.customer.name}</p>
                    {printing.customer.company && <p className="text-sm text-zinc-600">{printing.customer.company}</p>}
                    <p className="text-sm text-zinc-600">{printing.customer.email}</p>
                    <p className="text-sm text-zinc-600">{printing.customer.phone}</p>
                    <p className="text-sm text-zinc-600">{printing.customer.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Details</p>
                    <p className="text-sm text-zinc-600">Payment Date: <span className="font-medium text-zinc-900">{fmtDate(printing.paidAt)}</span></p>
                    <p className="text-sm text-zinc-600">Payment Method: <span className="font-medium text-zinc-900">{paymentLabel(printing.paymentMethod)}</span></p>
                    <p className="text-sm text-zinc-600">Currency: <span className="font-medium text-zinc-900">{printing.currency}</span></p>
                    {printing.invoiceId && <p className="text-sm text-zinc-600">Invoice Ref: <span className="font-medium text-zinc-900">{printing.invoiceId}</span></p>}
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
                    <div className="flex justify-between text-lg font-bold"><span>Total Paid</span><span>{fmtCurrency(printing.total, printing.currency)}</span></div>
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
                  <span>{company?.name || 'Cansan Solutions'} · {company?.addressLine1 || 'Shop 7, ZB House'}, {company?.city || 'Harare'}, {company?.country || 'Zimbabwe'}</span>
                  <span>{company?.email || 'info@cansansolutions.co.zw'} · {company?.phone || '+263 77 375 4747'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Picker Modal */}
        {clientPicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <h3 className="font-heading text-sm font-bold text-zinc-900">Select a Client</h3>
                <button onClick={() => setClientPicker(false)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {!clientCreating && (
                  <>
                    <input
                      autoFocus
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search clients..."
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <div className="space-y-2">
                      {clients
                        .filter((c) => {
                          if (!clientSearch) return true;
                          const q = clientSearch.toLowerCase();
                          return c.name.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
                        })
                        .map((c) => {
                          const colors = ['bg-red-500','bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-teal-500','bg-pink-500','bg-indigo-500'];
                          let hash = 0;
                          for (let i = 0; i < c.name.length; i++) hash = c.name.charCodeAt(i) + ((hash << 5) - hash);
                          const color = colors[Math.abs(hash) % colors.length];
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => editing ? changeClient(c) : startEditWithClient(c)}
                              className="flex w-full items-start gap-3 rounded-xl border border-zinc-100 p-3 text-left hover:bg-zinc-50 transition"
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${color}`}>
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 text-sm">{c.name}</p>
                                <p className="text-xs text-zinc-500 truncate">
                                  {[c.company, c.email].filter(Boolean).join(' \u00b7 ')}
                                </p>
                                {c.phone && <p className="text-xs text-zinc-400">{c.phone}</p>}
                              </div>
                            </button>
                          );
                        })}
                      {clients.length === 0 && (
                        <p className="text-sm text-zinc-400 text-center py-4">No clients yet</p>
                      )}
                    </div>
                  </>
                )}

                {clientCreating && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase">New Client</h4>
                    <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="Name *" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                    <input value={newClient.company} onChange={(e) => setNewClient({ ...newClient, company: e.target.value })} placeholder="Company" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    <input value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} placeholder="Phone" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    <input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} placeholder="Address" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setClientCreating(false)} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600">Back</button>
                      <button type="button" onClick={handleQuickCreateClient} disabled={clientSaving || !newClient.name.trim()} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-60">{clientSaving ? 'Saving...' : 'Create & Select'}</button>
                    </div>
                  </div>
                )}
              </div>

              {!clientCreating && (
                <div className="border-t border-zinc-100 px-5 py-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => { setClientCreating(true); setNewClient({ name: '', company: '', email: '', phone: '', address: '' }); }}
                    className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    + Create New Client
                  </button>
                  <button
                    type="button"
                    onClick={() => editing ? setClientPicker(false) : startEditBlank()}
                    className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 py-1"
                  >
                    Continue without selecting a client
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
        }
      `}</style>
    </AdminLayout>
  );
}
