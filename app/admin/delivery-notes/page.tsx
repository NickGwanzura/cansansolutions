'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DeliveryNote, DeliveryNoteStatus, LineItem, CustomerInfo, CompanyProfile, Product, Client } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';

const CURRENCIES = ['USD', 'KES', 'ZAR'];
const STATUSES: DeliveryNoteStatus[] = ['draft', 'dispatched', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<DeliveryNoteStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  dispatched: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-400 line-through',
};

function emptyCustomer(): CustomerInfo {
  return { name: '', email: '', phone: '', address: '', company: '' };
}

function emptyLineItem(): LineItem {
  return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: '', quantity: 1, unitPrice: 0, total: 0 };
}

function emptyDN(): DeliveryNote {
  return {
    id: '',
    number: '',
    status: 'draft',
    customer: emptyCustomer(),
    deliveryAddress: '',
    lineItems: [emptyLineItem()],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
    notes: '',
    invoiceRef: '',
    issueDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
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

export default function DeliveryNotesAdmin() {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DeliveryNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [printing, setPrinting] = useState<DeliveryNote | null>(null);
  const [downloading, setDownloading] = useState(false);
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
    fetchNotes();
    fetch('/api/admin/company').then(r => r.ok ? r.json() : null).then(d => { if (d) setCompany(d); }).catch(() => {});
    fetch('/api/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
    fetch('/api/admin/clients').then(r => r.ok ? r.json() : []).then(setClients).catch(() => {});
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/admin/delivery-notes');
      if (res.ok) setNotes(await res.json());
    } catch {
      setMessage('Failed to fetch delivery notes');
    } finally {
      setLoading(false);
    }
  };

  const recalc = useCallback((dn: DeliveryNote): DeliveryNote => {
    const lineItems = dn.lineItems.map((li) => ({ ...li, total: li.quantity * li.unitPrice }));
    const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
    const taxAmount = subtotal * dn.taxRate / 100;
    const total = subtotal + taxAmount - dn.discount;
    return { ...dn, lineItems, subtotal, taxAmount, total };
  }, []);

  const saveDN = async (dn: DeliveryNote) => {
    setSaving(true);
    try {
      const isNew = !dn.id || !notes.find((n) => n.id === dn.id);
      const url = isNew ? '/api/admin/delivery-notes' : `/api/admin/delivery-notes/${dn.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dn),
      });
      if (res.ok) {
        setMessage(isNew ? 'Delivery note created' : 'Delivery note updated');
        setEditing(null);
        fetchNotes();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Error saving delivery note');
    } finally {
      setSaving(false);
    }
  };

  const removeDN = async (id: string) => {
    if (!confirm('Delete this delivery note?')) return;
    try {
      const res = await fetch(`/api/admin/delivery-notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Delivery note deleted');
        fetchNotes();
      }
    } catch {
      setMessage('Error deleting delivery note');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (dn?: DeliveryNote) => {
    if (dn) {
      setEditing({ ...dn });
    } else {
      setClientPicker(true);
      setClientSearch('');
      setClientCreating(false);
      setNewClient({ name: '', company: '', email: '', phone: '', address: '' });
    }
  };

  const startEditWithClient = (client: Client) => {
    setEditing({
      ...emptyDN(),
      id: `dn-${Date.now()}`,
      customer: { name: client.name, email: client.email, phone: client.phone, address: client.address, company: client.company || '' },
      deliveryAddress: client.address,
    });
    setClientPicker(false);
  };

  const startEditBlank = () => {
    setEditing({ ...emptyDN(), id: `dn-${Date.now()}` });
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

  const pickProduct = (index: number, product: Product) => {
    if (!editing) return;
    const items = editing.lineItems.map((li, i) =>
      i === index ? { ...li, description: product.name, unitPrice: product.price, total: li.quantity * product.price } : li
    );
    setEditing(recalc({ ...editing, lineItems: items }));
    setShowProductPicker(null);
    setProductSearch({});
  };

  const downloadPdf = async (elementId: string, filename: string) => {
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = document.getElementById(elementId);
      if (!el) return;
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
    } finally {
      setDownloading(false);
    }
  };

  const totalCount = notes.length;
  const dispatchedCount = notes.filter((n) => n.status === 'dispatched').length;
  const deliveredCount = notes.filter((n) => n.status === 'delivered').length;
  const draftCount = notes.filter((n) => n.status === 'draft').length;

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
            <p className="text-xs font-medium text-zinc-500">Total Notes</p>
            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Drafts</p>
            <p className="text-2xl font-bold text-zinc-900">{draftCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Dispatched</p>
            <p className="text-2xl font-bold text-blue-600">{dispatchedCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Delivery Notes</h1>
          <button
            onClick={() => startEdit()}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Delivery Note
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <svg className="mx-auto mb-3 text-zinc-300" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-zinc-500 mb-3">No delivery notes yet</p>
            <button onClick={() => startEdit()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Create First Delivery Note
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  <th className="px-4 py-3 font-semibold text-zinc-500">Number</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Status</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Customer</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Issue Date</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Delivery Date</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Invoice Ref</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500 text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{n.number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[n.status]}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{n.customer.name || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{fmtDate(n.issueDate)}</td>
                    <td className="px-4 py-3 text-zinc-500">{n.deliveryDate ? fmtDate(n.deliveryDate) : '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{n.invoiceRef || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtCurrency(n.total, n.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(n)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Edit</button>
                        <button onClick={() => setPrinting(n)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Print</button>
                        <button onClick={() => removeDN(n.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
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
            <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {notes.find((n) => n.id === editing.id) ? 'Edit Delivery Note' : 'New Delivery Note'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); saveDN(recalc(editing)); }}
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
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Billing Address</label>
                    <input value={editing.customer.address} onChange={(e) => setEditing({ ...editing, customer: { ...editing.customer, address: e.target.value } })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Delivery Address (if different)</label>
                    <input value={editing.deliveryAddress || ''} onChange={(e) => setEditing({ ...editing, deliveryAddress: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Leave blank to use billing address" />
                  </div>
                </fieldset>

                {/* Line Items */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Items to Deliver</legend>
                  <div className="space-y-2">
                    {editing.lineItems.map((li, idx) => (
                      <div key={li.id} className="space-y-1">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            {idx === 0 && <label className="block text-xs text-zinc-400 mb-1">Description</label>}
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => { setShowProductPicker(showProductPicker === idx ? null : idx); setProductSearch({}); }}
                                className={`shrink-0 rounded-lg border px-2 py-2 transition ${showProductPicker === idx ? 'border-red-400 bg-red-50 text-red-600' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                                title="Pick from product catalog"
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                              </button>
                              <input value={li.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="Item description" required />
                            </div>
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
                        {showProductPicker === idx && (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                            <input
                              autoFocus
                              value={productSearch[idx] || ''}
                              onChange={(e) => setProductSearch({ ...productSearch, [idx]: e.target.value })}
                              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                              placeholder="Type to search products..."
                              onKeyDown={(e) => { if (e.key === 'Escape') setShowProductPicker(null); }}
                            />
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                              {products
                                .filter((p) => !productSearch[idx] || p.name.toLowerCase().includes((productSearch[idx] || '').toLowerCase()))
                                .slice(0, 8)
                                .map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-md bg-white px-3 py-2 text-sm hover:bg-red-600 hover:text-white group transition"
                                    onClick={() => pickProduct(idx, p)}
                                  >
                                    <span className="truncate text-left font-medium">{p.name}</span>
                                    <span className="ml-3 shrink-0 text-xs text-zinc-500 group-hover:text-red-100">{fmtCurrency(p.price, p.currency)}</span>
                                  </button>
                                ))}
                              {products.filter((p) => !productSearch[idx] || p.name.toLowerCase().includes((productSearch[idx] || '').toLowerCase())).length === 0 && (
                                <p className="px-3 py-2 text-xs text-zinc-400">No products found</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addLineItem} className="text-xs font-semibold text-red-600 hover:text-red-700">+ Add Item</button>
                </fieldset>

                {/* Meta & Totals */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Status</label>
                        <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as DeliveryNoteStatus })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Currency</label>
                        <select value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Issue Date</label>
                        <input type="date" value={editing.issueDate} onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Expected Delivery</label>
                        <input type="date" value={editing.deliveryDate || ''} onChange={(e) => setEditing({ ...editing, deliveryDate: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Invoice Ref (optional)</label>
                      <input value={editing.invoiceRef || ''} onChange={(e) => setEditing({ ...editing, invoiceRef: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder="INV-0001" />
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
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Delivery Note'}</button>
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
                <h3 className="font-semibold text-zinc-900">Delivery Note Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadPdf('dn-print', `${printing.number}.pdf`)}
                    disabled={downloading}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    {downloading ? 'Generating…' : 'Download PDF'}
                  </button>
                  <button onClick={() => window.print()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Print</button>
                  <button onClick={() => setPrinting(null)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50">Close</button>
                </div>
              </div>

              <div className="p-10 print:p-0" id="dn-print">
                <div className="h-1.5 bg-blue-600 -mx-10 -mt-10 mb-8 print:mx-0 print:mt-0" />
                <div className="flex justify-between items-start mb-10">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={company?.logoUrl || '/images/brand/cansan-logo.png'} alt={company?.name || 'Cansan Solutions'} className="h-14 w-auto mb-3 object-contain" />
                    <p className="text-[11px] text-zinc-400">{company?.tagline || 'Technology Solutions'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Delivery Note</p>
                    <p className="text-3xl font-black text-zinc-900 tracking-tight">{printing.number}</p>
                    <span className={`mt-2 inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[printing.status]}`}>
                      {printing.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-zinc-200">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">From</p>
                    <p className="text-sm font-semibold text-zinc-900">{company?.name || 'Cansan Solutions'}</p>
                    {company?.addressLine1 && <p className="text-xs text-zinc-500 mt-0.5">{company.addressLine1}</p>}
                    {company?.addressLine2 && <p className="text-xs text-zinc-500">{company.addressLine2}</p>}
                    {(company?.city || company?.country) && <p className="text-xs text-zinc-500">{[company?.city, company?.country].filter(Boolean).join(', ')}</p>}
                    {company?.phone && <p className="text-xs text-zinc-500 mt-1">{company.phone}</p>}
                    {company?.email && <p className="text-xs text-zinc-500">{company.email}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Deliver To</p>
                    <p className="text-sm font-semibold text-zinc-900">{printing.customer.name}</p>
                    {printing.customer.company && <p className="text-xs text-zinc-500 mt-0.5">{printing.customer.company}</p>}
                    {printing.customer.email && <p className="text-xs text-zinc-500">{printing.customer.email}</p>}
                    {printing.customer.phone && <p className="text-xs text-zinc-500">{printing.customer.phone}</p>}
                    <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">
                      {printing.deliveryAddress || printing.customer.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Details</p>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Issue Date</p>
                      <p className="text-sm font-semibold text-zinc-900">{fmtDate(printing.issueDate)}</p>
                      {printing.deliveryDate && (
                        <>
                          <p className="text-xs text-zinc-500 mt-2">Expected Delivery</p>
                          <p className="text-sm font-semibold text-zinc-900">{fmtDate(printing.deliveryDate)}</p>
                        </>
                      )}
                      {printing.invoiceRef && (
                        <>
                          <p className="text-xs text-zinc-500 mt-2">Invoice Ref</p>
                          <p className="text-sm font-semibold text-zinc-900">{printing.invoiceRef}</p>
                        </>
                      )}
                      <p className="text-xs text-zinc-500 mt-2">Currency</p>
                      <p className="text-sm font-semibold text-zinc-900">{printing.currency}</p>
                    </div>
                  </div>
                </div>

                <table className="w-full mb-6 text-sm">
                  <thead>
                    <tr className="bg-zinc-900 text-white">
                      <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-l">Description</th>
                      <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-16">Qty</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-28">Unit Price</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-28 rounded-r">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printing.lineItems.map((li, i) => (
                      <tr key={li.id} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                        <td className="px-4 py-3 text-zinc-800">{li.description}</td>
                        <td className="px-4 py-3 text-center text-zinc-600">{li.quantity}</td>
                        <td className="px-4 py-3 text-right text-zinc-600">{fmtCurrency(li.unitPrice, printing.currency)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900">{fmtCurrency(li.total, printing.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-8">
                  <div className="w-72">
                    <div className="flex justify-between py-1.5 text-sm border-t border-zinc-100"><span className="text-zinc-500">Subtotal</span><span className="text-zinc-800">{fmtCurrency(printing.subtotal, printing.currency)}</span></div>
                    {printing.taxRate > 0 && <div className="flex justify-between py-1.5 text-sm border-t border-zinc-100"><span className="text-zinc-500">Tax ({printing.taxRate}%)</span><span className="text-zinc-800">{fmtCurrency(printing.taxAmount, printing.currency)}</span></div>}
                    {printing.discount > 0 && <div className="flex justify-between py-1.5 text-sm border-t border-zinc-100"><span className="text-zinc-500">Discount</span><span className="text-green-600">-{fmtCurrency(printing.discount, printing.currency)}</span></div>}
                    <div className="flex justify-between items-center mt-1 bg-blue-700 text-white px-4 py-3 rounded">
                      <span className="text-sm font-bold uppercase tracking-wide">Total</span>
                      <span className="text-xl font-black">{fmtCurrency(printing.total, printing.currency)}</span>
                    </div>
                  </div>
                </div>

                {printing.notes && (
                  <div className="mb-8 rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Notes</p>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap">{printing.notes}</p>
                  </div>
                )}

                <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-3">
                  <svg className="text-blue-400 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-xs text-blue-700">Please inspect goods upon receipt. Sign and return a copy to confirm delivery.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Dispatched By</p>
                    <div className="border-t border-zinc-300 pt-8 mt-4">
                      <p className="text-xs text-zinc-400">Signature &amp; Date</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Received By</p>
                    <div className="border-t border-zinc-300 pt-8 mt-4">
                      <p className="text-xs text-zinc-400">Signature &amp; Date</p>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-zinc-900 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-zinc-700">{company?.name || 'Cansan Solutions'}</p>
                    <p className="text-[11px] text-zinc-400">{[company?.addressLine1, company?.city, company?.country].filter(Boolean).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-zinc-500">{company?.email || 'info@cansansolutions.co.zw'}</p>
                    <p className="text-[11px] text-zinc-500">{company?.phone || '+263 77 375 4747'}</p>
                    {company?.website && <p className="text-[11px] text-zinc-400">{company.website}</p>}
                  </div>
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
                                <p className="text-xs text-zinc-500 truncate">{[c.company, c.email].filter(Boolean).join(' \u00b7 ')}</p>
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
        @page { size: A4 portrait; margin: 1.2cm; }
        @media print {
          html, body { height: auto !important; overflow: visible !important; }
          body * { visibility: hidden !important; }
          #dn-print, #dn-print * { visibility: visible !important; }
          #dn-print { position: fixed !important; inset: 0 !important; width: 100% !important; padding: 1.5cm !important; box-sizing: border-box !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
