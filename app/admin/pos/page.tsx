'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product, Client, CompanyProfile, LineItem, CustomerInfo, PaymentMethod, Invoice, Receipt } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';
import AdminAuthGate from '../components/AdminAuthGate';

const WALK_IN: CustomerInfo = { name: 'Walk-in Customer', email: '', phone: '', address: '' };
const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'mobile_money', 'other'];
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  other: 'Other',
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function newLineId() {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

type SaleResult = { invoice: Invoice; receipt: Receipt };

function POS({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<LineItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [clientPicker, setClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSale, setLastSale] = useState<SaleResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/products').then((r) => r.ok ? r.json() : []).then(setProducts).catch(() => {});
    fetch('/api/admin/clients').then((r) => r.ok ? r.json() : []).then(setClients).catch(() => {});
    fetch('/api/admin/company').then((r) => r.ok ? r.json() : null).then((d) => {
      if (d) setCompany(d);
    }).catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const available = products.filter((p) => p.inStock !== false);
    if (!q) return available.slice(0, 48);
    return available.filter((p) =>
      p.name.toLowerCase().includes(q)
      || (p.category || '').toLowerCase().includes(q)
      || (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    ).slice(0, 48);
  }, [products, search]);

  const subtotal = cart.reduce((s, li) => s + li.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((li) => li.description === p.name && li.unitPrice === p.price);
      if (existing) {
        return prev.map((li) =>
          li.id === existing.id
            ? { ...li, quantity: li.quantity + 1, total: (li.quantity + 1) * li.unitPrice }
            : li,
        );
      }
      return [...prev, { id: newLineId(), description: p.name, quantity: 1, unitPrice: p.price, total: p.price }];
    });
    if (currency !== p.currency) setCurrency(p.currency);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((li) => li.id !== id));
      return;
    }
    setCart((prev) => prev.map((li) => (li.id === id ? { ...li, quantity: qty, total: qty * li.unitPrice } : li)));
  };

  const updatePrice = (id: string, price: number) => {
    setCart((prev) => prev.map((li) => (li.id === id ? { ...li, unitPrice: price, total: li.quantity * price } : li)));
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((li) => li.id !== id));
  };

  const clearSale = () => {
    setCart([]);
    setDiscount(0);
    setClient(null);
    setMessage('');
    setLastSale(null);
    setSearch('');
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    setPosting(true);
    setMessage('');
    try {
      const customer: CustomerInfo = client
        ? { name: client.name, email: client.email, phone: client.phone, address: client.address, company: client.company || '' }
        : WALK_IN;
      const today = new Date().toISOString().slice(0, 10);
      const invoicePayload: Partial<Invoice> = {
        status: 'paid',
        customer,
        lineItems: cart,
        taxRate,
        discount,
        currency,
        issueDate: today,
        dueDate: today,
      };
      const invRes = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload),
      });
      if (!invRes.ok) throw new Error('Invoice create failed');
      const invoice = await invRes.json() as Invoice;

      const receiptPayload: Partial<Receipt> = {
        invoiceId: invoice.id,
        customer,
        lineItems: cart,
        taxRate,
        discount,
        currency,
        paymentMethod,
        paidAt: today,
      };
      const recRes = await fetch('/api/admin/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptPayload),
      });
      if (!recRes.ok) throw new Error('Receipt create failed');
      const receipt = await recRes.json() as Receipt;

      setLastSale({ invoice, receipt });
      setCart([]);
      setDiscount(0);
    } catch {
      setMessage('Sale failed. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const downloadLastReceipt = async () => {
    if (!lastSale) return;
    setDownloading(true);
    try {
      const { downloadElementAsPdf } = await import('@/lib/pdf');
      await downloadElementAsPdf('pos-receipt-print', `${lastSale.receipt.number}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const visibleClients = clients.filter((c) => {
    if (!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <AdminLayout onLogout={onLogout}>
      <main className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* Product catalog */}
        <section className="flex flex-1 flex-col border-b border-zinc-200 bg-zinc-50 lg:border-b-0 lg:border-r">
          <div className="border-b border-zinc-200 bg-white p-4">
            <h1 className="text-lg font-bold text-zinc-900">POS</h1>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, category, or tag…"
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-sm text-zinc-400 py-12">
                {search ? 'No products match that search.' : 'No products available.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-red-400 hover:shadow-md"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{p.name}</p>
                    {p.category && <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-400">{p.category}</p>}
                    <p className="mt-auto pt-3 text-base font-bold text-red-600">{fmt(p.price, p.currency)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cart */}
        <aside className="flex w-full flex-col bg-white lg:w-[400px] xl:w-[440px]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Current Sale</p>
              <button
                type="button"
                onClick={() => { setClientPicker(true); setClientSearch(''); }}
                className="text-sm font-semibold text-zinc-900 hover:text-red-600"
              >
                {client ? client.name : 'Walk-in Customer'} <span className="text-xs text-zinc-400">(change)</span>
              </button>
            </div>
            {cart.length > 0 && (
              <button onClick={clearSale} className="text-xs text-zinc-500 hover:text-red-600">Clear</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {lastSale ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">Sale Complete</p>
                <p className="mt-1 text-lg font-bold text-green-900">{lastSale.receipt.number}</p>
                <p className="text-sm text-green-800">{fmt(lastSale.receipt.total, lastSale.receipt.currency)} · {PAYMENT_LABELS[lastSale.receipt.paymentMethod]}</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={downloadLastReceipt}
                    disabled={downloading}
                    className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
                  >
                    {downloading ? 'Generating…' : 'Download Receipt PDF'}
                  </button>
                  <button
                    onClick={clearSale}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    New Sale
                  </button>
                  <Link
                    href={`/admin/invoices`}
                    className="block text-center text-xs text-zinc-500 hover:text-zinc-700"
                  >
                    Invoice {lastSale.invoice.number} →
                  </Link>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <p className="mt-3 text-sm">Click products to start a sale.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((li) => (
                  <div key={li.id} className="rounded-lg border border-zinc-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm font-medium text-zinc-900">{li.description}</p>
                      <button onClick={() => removeItem(li.id)} className="text-zinc-300 hover:text-red-500" aria-label="Remove">&#10005;</button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-zinc-200">
                        <button onClick={() => updateQty(li.id, li.quantity - 1)} className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-50">−</button>
                        <input
                          type="number"
                          min="1"
                          value={li.quantity}
                          onChange={(e) => updateQty(li.id, Math.max(1, parseInt(e.target.value || '1', 10)))}
                          className="w-10 border-x border-zinc-200 py-1 text-center text-sm focus:outline-none"
                        />
                        <button onClick={() => updateQty(li.id, li.quantity + 1)} className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-50">+</button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={li.unitPrice}
                        onChange={(e) => updatePrice(li.id, parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-zinc-200 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <p className="w-24 text-right text-sm font-semibold text-zinc-900">{fmt(li.total, currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Totals */}
          {!lastSale && (
            <div className="border-t border-zinc-200 bg-zinc-50 p-5 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Tax (%)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-right text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Discount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-right text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</span>
                  <span className="text-xl font-bold text-zinc-900">{fmt(total, currency)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  {['USD', 'ZWL', 'ZAR', 'KES'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
                </select>
              </div>

              {message && <p className="text-center text-sm text-red-600">{message}</p>}

              <button
                onClick={completeSale}
                disabled={cart.length === 0 || posting}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50 disabled:shadow-none"
              >
                {posting ? 'Processing…' : `Complete Sale · ${fmt(total, currency)}`}
              </button>
            </div>
          )}
        </aside>

        {/* Client picker modal */}
        {clientPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h3 className="font-semibold text-zinc-900">Select Customer</h3>
                <button onClick={() => setClientPicker(false)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                <input
                  autoFocus
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search clients…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => { setClient(null); setClientPicker(false); }}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 p-3 text-left hover:bg-zinc-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white text-sm font-bold">W</div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Walk-in Customer</p>
                    <p className="text-xs text-zinc-500">No record kept</p>
                  </div>
                </button>
                {visibleClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setClient(c); setClientPicker(false); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 p-3 text-left hover:bg-zinc-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">{c.name}</p>
                      <p className="truncate text-xs text-zinc-500">{[c.company, c.email].filter(Boolean).join(' · ')}</p>
                    </div>
                  </button>
                ))}
                {visibleClients.length === 0 && <p className="text-center text-sm text-zinc-400 py-4">No matching clients.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Hidden receipt for PDF capture */}
        {lastSale && (
          <div className="fixed left-[-10000px] top-0" aria-hidden>
            <div id="pos-receipt-print" className="bg-white p-10" style={{ width: '800px' }}>
              <div className="h-1.5 bg-red-600 -mx-10 -mt-10 mb-8" />
              <div className="mb-10 flex items-start justify-between">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={company?.logoUrl || '/images/brand/cansan-logo.png'} alt={company?.name || 'Cansan Solutions'} className="mb-3 h-14 w-auto object-contain" />
                  <p className="text-[11px] text-zinc-400">{company?.tagline || 'Technology Solutions'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Receipt</p>
                  <p className="text-3xl font-black tracking-tight text-zinc-900">{lastSale.receipt.number}</p>
                  <span className="mt-2 inline-block rounded bg-green-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">Paid</span>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-3 gap-6 border-b border-zinc-200 pb-8">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">From</p>
                  <p className="text-sm font-semibold text-zinc-900">{company?.name || 'Cansan Solutions'}</p>
                  {company?.phone && <p className="mt-1 text-xs text-zinc-500">{company.phone}</p>}
                  {company?.email && <p className="text-xs text-zinc-500">{company.email}</p>}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer</p>
                  <p className="text-sm font-semibold text-zinc-900">{lastSale.receipt.customer.name}</p>
                  {lastSale.receipt.customer.phone && <p className="text-xs text-zinc-500">{lastSale.receipt.customer.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Details</p>
                  <p className="text-xs text-zinc-500">Date</p>
                  <p className="text-sm font-semibold text-zinc-900">{new Date(lastSale.receipt.paidAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-xs text-zinc-500">Payment</p>
                  <p className="text-sm font-semibold text-zinc-900">{PAYMENT_LABELS[lastSale.receipt.paymentMethod]}</p>
                </div>
              </div>

              <table className="mb-6 w-full text-sm">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="rounded-l px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">Item</th>
                    <th className="w-16 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider">Qty</th>
                    <th className="w-28 px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">Price</th>
                    <th className="w-28 rounded-r px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSale.receipt.lineItems.map((li, i) => (
                    <tr key={li.id} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                      <td className="px-4 py-3 text-zinc-800">{li.description}</td>
                      <td className="px-4 py-3 text-center text-zinc-600">{li.quantity}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{fmt(li.unitPrice, lastSale.receipt.currency)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900">{fmt(li.total, lastSale.receipt.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mb-8 flex justify-end">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between py-1 border-t border-zinc-100">
                    <span className="text-zinc-500">Subtotal</span>
                    <span>{fmt(lastSale.receipt.subtotal, lastSale.receipt.currency)}</span>
                  </div>
                  {lastSale.receipt.taxRate > 0 && (
                    <div className="flex justify-between py-1 border-t border-zinc-100">
                      <span className="text-zinc-500">Tax ({lastSale.receipt.taxRate}%)</span>
                      <span>{fmt(lastSale.receipt.taxAmount, lastSale.receipt.currency)}</span>
                    </div>
                  )}
                  {lastSale.receipt.discount > 0 && (
                    <div className="flex justify-between py-1 border-t border-zinc-100">
                      <span className="text-zinc-500">Discount</span>
                      <span className="text-green-600">-{fmt(lastSale.receipt.discount, lastSale.receipt.currency)}</span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between rounded bg-zinc-900 px-4 py-3 text-white">
                    <span className="text-sm font-bold uppercase tracking-wide">Paid</span>
                    <span className="text-xl font-black">{fmt(lastSale.receipt.total, lastSale.receipt.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-zinc-900 pt-4 text-center">
                <p className="text-sm font-semibold text-zinc-700">Thank you for your business.</p>
                {company?.website && <p className="text-[11px] text-zinc-400 mt-1">{company.website}</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}

export default function POSPage() {
  return <AdminAuthGate>{({ onLogout }) => <POS onLogout={onLogout} />}</AdminAuthGate>;
}
