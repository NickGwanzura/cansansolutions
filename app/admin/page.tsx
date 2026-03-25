'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '@/lib/types';

const CATEGORIES = [
  { id: 'mobile', label: 'Mobile & Accessories' },
  { id: 'laptops', label: 'Laptops & Computing' },
  { id: 'networking', label: 'Networking & Wi-Fi' },
  { id: 'power', label: 'Power & Backup' },
  { id: 'audio', label: 'Audio & Headphones' },
  { id: 'gadgets', label: 'Gadgets & Devices' },
  { id: 'accessories', label: 'Accessories & Cables' },
  { id: 'printing', label: 'Printing & Office' },
];

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: 'mobile',
  price: '',
  currency: 'USD',
  description: '',
  tags: '',
  image: '/images/products/placeholder.svg',
  inStock: true,
  featured: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─────────────────────────────────────────────
// Login screen
// ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) onLogin();
    else setError('Incorrect password');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-zinc-400">Cansan Solutions — Product Manager</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter admin password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Image upload field
// ─────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      onChange(url);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">Product Image</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2 p-4 min-h-[120px]
          ${dragOver ? 'border-red-400 bg-red-50' : 'border-zinc-200 bg-zinc-50 hover:border-red-300 hover:bg-red-50/50'}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            <span className="text-xs text-zinc-400">Uploading…</span>
          </div>
        ) : value && value !== '/images/products/placeholder.svg' ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <img src={value} alt="Product" className="h-24 object-contain rounded-lg" />
            <span className="text-[11px] text-zinc-400 truncate max-w-full px-2">{value.split('/').pop()}</span>
            <span className="text-[11px] text-red-500">Click or drop to replace</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-zinc-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-xs font-medium text-zinc-500">Click or drag & drop image</p>
            <p className="text-[11px] text-zinc-400">JPG, PNG, WebP, SVG</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
      {/* Direct URL input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/products/filename.jpg"
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Product form panel (Add / Edit)
// ─────────────────────────────────────────────
type FormData = typeof EMPTY_FORM;

function ProductForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [slugManual, setSlugManual] = useState(!!initial.slug);

  const set = (k: keyof FormData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleName = (v: string) => {
    set('name', v);
    if (!slugManual) set('slug', slugify(v));
  };

  const handleSlug = (v: string) => {
    setSlugManual(true);
    set('slug', slugify(v));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* panel */}
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="font-heading text-sm font-bold text-zinc-900">
            {initial.name ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100 transition">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Image */}
          <ImageUpload value={form.image} onChange={(url) => set('image', url)} />

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Product Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => handleName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="e.g. Samsung Galaxy A15"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => handleSlug(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="samsung-galaxy-a15"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Price (USD) *</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="99.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              placeholder="Short product description…"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">
              Tags <span className="font-normal text-zinc-400">(comma separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              placeholder="smartphone, android, samsung"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={form.inStock}
                onClick={() => set('inStock', !form.inStock)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.inStock ? 'bg-green-500' : 'bg-zinc-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs font-semibold text-zinc-700">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={form.featured}
                onClick={() => set('featured', !form.featured)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.featured ? 'bg-red-500' : 'bg-zinc-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs font-semibold text-zinc-700">Featured</span>
            </label>
          </div>
        </form>

        <div className="border-t border-zinc-100 px-5 py-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={() => {
              const el = document.querySelector('form');
              el?.requestSubmit();
            }}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : initial.name ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    const matchStock = filterStock === 'all' || (filterStock === 'in' ? p.inStock : !p.inStock);
    return matchSearch && matchCat && matchStock;
  });

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true); };

  const handleSave = async (form: typeof EMPTY_FORM) => {
    setSaving(true);
    const body = {
      ...form,
      price: parseFloat(String(form.price)),
      tags: String(form.tags).split(',').map((t) => t.trim()).filter(Boolean),
    };
    let res: Response;
    if (editTarget) {
      res = await fetch(`/api/admin/products/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    if (res.ok) {
      setFormOpen(false);
      fetchProducts();
      showToast(editTarget ? 'Product updated' : 'Product added');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteId(null);
      fetchProducts();
      showToast('Product deleted');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    onLogout();
  };

  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
              </svg>
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-zinc-900">Cansan Admin</span>
              <span className="ml-2 text-xs text-zinc-400">Product Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="text-xs text-zinc-400 hover:text-zinc-700 transition">
              View site ↗
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          {[
            { label: 'Total Products', value: products.length, color: 'text-zinc-900' },
            { label: 'In Stock', value: inStockCount, color: 'text-green-600' },
            { label: 'Out of Stock', value: products.length - inStockCount, color: 'text-red-500' },
            { label: 'Categories', value: new Set(products.map((p) => p.category)).size, color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
              <p className="text-xs text-zinc-400">{stat.label}</p>
              <p className={`font-heading text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-300"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as 'all' | 'in' | 'out')}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-300"
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
          <button
            onClick={openAdd}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Products table */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-zinc-400">
                No products found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3 hidden md:table-cell">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                              <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-zinc-400 font-mono">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 capitalize">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-900">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${p.inStock ? 'bg-green-500' : 'bg-red-400'}`} />
                            <span className={`text-xs font-medium ${p.inStock ? 'text-green-600' : 'text-red-500'}`}>
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {p.featured && (
                              <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Hot</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product form panel */}
      {formOpen && (
        <ProductForm
          initial={
            editTarget
              ? { ...editTarget, price: String(editTarget.price), tags: editTarget.tags.join(', ') }
              : EMPTY_FORM
          }
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
          saving={saving}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="font-heading text-base font-bold text-zinc-900 mb-1">Delete product?</h3>
            <p className="text-sm text-zinc-500 mb-5">
              {products.find((p) => p.id === deleteId)?.name} will be permanently removed from the catalog.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/products').then((r) => setAuthed(r.ok));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}
