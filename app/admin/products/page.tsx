'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Product, Category } from '@/lib/types';
import { CATALOG_CATEGORIES, getCategoryLabel, isBundleProduct } from '@/lib/catalog';
import AdminLayout from '../components/AdminLayout';
import AdminAuthGate from '../components/AdminAuthGate';

const CATEGORIES = CATALOG_CATEGORIES as Category[];

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: 'mobile',
  productType: 'single',
  bundleItems: '',
  condition: '',
  price: '',
  originalPrice: '',
  currency: 'USD',
  description: '',
  tags: '',
  images: [] as string[],
  inStock: true,
  featured: false,
  stockCount: '',
  rating: '',
  reviewCount: '',
  dealLabel: '',
  specsText: '',
};

const IMPORT_PLACEHOLDER = `[\n  {\n    "name": "Your Product Name",\n    "slug": "your-product-name",\n    "category": "mobile",\n    "productType": "single",\n    "condition": "new",\n    "price": 199,\n    "currency": "USD",\n    "description": "Short product description.",\n    "inStock": true,\n    "featured": false,\n    "tags": ["tag one", "tag two"]\n  },\n  {\n    "name": "Starter CCTV Bundle",\n    "slug": "starter-cctv-bundle",\n    "category": "cctv",\n    "productType": "bundle",\n    "price": 499,\n    "currency": "USD",\n    "description": "Bundle deal for a small shop or home setup.",\n    "inStock": true,\n    "featured": true,\n    "tags": ["bundle", "cctv"],\n    "bundleItems": ["4x HD Cameras", "1x 4-Channel DVR", "1x 1TB HDD", "Power Supply Kit"]\n  }\n]`;

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-32 rounded-lg border border-zinc-200 bg-zinc-50" />,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatAdminCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─────────────────────────────────────────────
// Image Gallery Upload (multiple images)
// ─────────────────────────────────────────────
function ImageGalleryUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      onChange([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [removed] = newImages.splice(from, 1);
    newImages.splice(to, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">
        Product Images {images.length > 0 && `(${images.length})`}
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50">
              <img src={img} alt={`Product ${idx + 1}`} className="h-20 w-full object-contain p-1" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1 bg-white rounded hover:bg-zinc-100 disabled:opacity-30"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx + 1)}
                  disabled={idx === images.length - 1}
                  className="p-1 bg-white rounded hover:bg-zinc-100 disabled:opacity-30"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl border-2 border-dashed border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : '+ Add Image'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Product form panel with Rich Text & Gallery
// ─────────────────────────────────────────────
type FormData = typeof EMPTY_FORM;

function ProductForm({
  initial,
  onSave,
  onSaveAndAdd,
  onClose,
  saving,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onSaveAndAdd?: (data: FormData) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormData>(initial);
  const [slugManual, setSlugManual] = useState(!!initial.slug);
  const [error, setError] = useState('');
  const [addAnother, setAddAnother] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'variants'>('basic');
  const [enhancing, setEnhancing] = useState(false);
  const [enhancingSpecs, setEnhancingSpecs] = useState(false);
  const initialSerialized = useMemo(() => JSON.stringify(initial), [initial]);
  const hasUnsavedChanges = useMemo(() => JSON.stringify(form) !== initialSerialized, [form, initialSerialized]);

  const enhanceDescription = async () => {
    if (!form.name.trim()) { setError('Enter a product name first'); return; }
    setEnhancing(true);
    try {
      const res = await fetch('/api/admin/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: form.price,
          tags: form.tags,
          condition: form.condition,
          currentDescription: form.description,
        }),
      });
      const data = await res.json();
      if (res.ok) set('description', data.description);
      else setError(data.error || 'AI enhance failed');
    } catch {
      setError('AI enhance failed');
    } finally {
      setEnhancing(false);
    }
  };

  const parseSpecsText = (value: string): Record<string, string> => {
    const specs: Record<string, string> = {};

    for (const line of value.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const delimiterIndex = trimmed.indexOf(':');
      if (delimiterIndex <= 0) continue;

      const key = trimmed.slice(0, delimiterIndex).trim();
      const val = trimmed.slice(delimiterIndex + 1).trim();
      if (key && val) {
        specs[key] = val;
      }
    }

    return specs;
  };

  const stringifySpecs = (specs: Record<string, string>) =>
    Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

  const enhanceSpecs = async () => {
    if (!form.name.trim()) {
      setError('Enter a product name first');
      return;
    }

    setEnhancingSpecs(true);
    try {
      const res = await fetch('/api/admin/enhance-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          condition: form.condition,
          price: form.price,
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          description: form.description,
          currentSpecs: parseSpecsText(form.specsText),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'AI specs generation failed');
        return;
      }

      const currentSpecs = parseSpecsText(form.specsText);
      const generatedSpecs = data.specs && typeof data.specs === 'object' ? (data.specs as Record<string, string>) : {};
      const mergedSpecs = { ...generatedSpecs, ...currentSpecs };
      set('specsText', stringifySpecs(mergedSpecs));
    } catch {
      setError('AI specs generation failed');
    } finally {
      setEnhancingSpecs(false);
    }
  };

  const set = (k: keyof FormData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleName = (v: string) => {
    set('name', v);
    if (!slugManual) set('slug', slugify(v));
  };

  const handleSlug = (v: string) => {
    setSlugManual(true);
    set('slug', slugify(v));
  };

  const validate = () => {
    if (!form.name.trim()) { setError('Product name is required'); return false; }
    if (!form.slug.trim()) { setError('Slug is required'); return false; }
    if (!form.price || isNaN(parseFloat(String(form.price)))) { setError('Valid price is required'); return false; }
    if (!form.description.trim()) { setError('Description is required'); return false; }
    if (form.productType === 'bundle' && !String(form.bundleItems).trim()) { setError('Add at least one bundle item'); return false; }
    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (addAnother && onSaveAndAdd) onSaveAndAdd(form);
    else onSave(form);
  };

  const requestClose = () => {
    if (saving) return;

    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }

    onClose();
  };

  // Convert legacy single image to array
  const images = form.images.length > 0 ? form.images : 
    ((form as unknown as { image?: string }).image ? [(form as unknown as { image: string }).image] : []);

  const updateImages = (newImages: string[]) => {
    set('images', newImages);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={requestClose} />
      <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="font-heading text-sm font-bold text-zinc-900">
            {initial.name ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={requestClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100 transition">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          {(['basic', 'details', 'variants'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form ref={formRef} onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {activeTab === 'basic' && (
            <>
              <ImageGalleryUpload images={images} onChange={updateImages} />

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
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Listing Type *</label>
                  <select
                    value={form.productType}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      set('productType', nextType);
                      if (nextType === 'bundle') set('condition', '');
                    }}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="single">Single Product</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => set('condition', e.target.value)}
                    disabled={form.productType === 'bundle'}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Select condition</option>
                    <option value="new">Brand New</option>
                    <option value="pre-owned">Pre-owned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Price *</label>
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
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                    <option value="ZAR">ZAR</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-500">Description *</label>
                  <button
                    type="button"
                    onClick={enhanceDescription}
                    disabled={enhancing}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-50 hover:bg-violet-100 disabled:opacity-50 text-violet-700 text-xs font-medium transition"
                  >
                    {enhancing ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Enhancing…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        Enhance with AI
                      </>
                    )}
                  </button>
                </div>
                <RichTextEditor
                  value={form.description}
                  onChange={(v) => set('description', v)}
                  placeholder="Describe your product…"
                />
              </div>

              {form.productType === 'bundle' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    Bundle Items * <span className="font-normal text-zinc-400">(one per line)</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.bundleItems}
                    onChange={(e) => set('bundleItems', e.target.value)}
                    className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    placeholder={`4x HD Cameras\n1x 4-Channel DVR\n1x 1TB HDD\nPower Supply Kit`}
                  />
                </div>
              )}

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
            </>
          )}

          {activeTab === 'details' && (
            <>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Deals & Details</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Original Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) => set('originalPrice', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      placeholder="1299.00"
                    />
                    <p className="mt-0.5 text-[10px] text-zinc-400">Set higher than price to show discount badge</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Deal Label</label>
                    <input
                      value={form.dealLabel}
                      onChange={(e) => set('dealLabel', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      placeholder="Top Laptop Deals"
                    />
                    <p className="mt-0.5 text-[10px] text-zinc-400">Products with same label appear in a deal section</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Stock Count</label>
                    <input
                      type="number"
                      min={0}
                      value={form.stockCount}
                      onChange={(e) => set('stockCount', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Rating (0-5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={form.rating}
                      onChange={(e) => set('rating', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Review Count</label>
                    <input
                      type="number"
                      min={0}
                      value={form.reviewCount}
                      onChange={(e) => set('reviewCount', e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      placeholder="12"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-500">
                      Specifications <span className="font-normal text-zinc-400">(one per line, Key: Value)</span>
                    </label>
                    <button
                      type="button"
                      onClick={enhanceSpecs}
                      disabled={enhancingSpecs}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      {enhancingSpecs ? (
                        <>
                          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Generating…
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                          </svg>
                          Add Specs with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={form.specsText}
                    onChange={(e) => set('specsText', e.target.value)}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    placeholder={`Processor: Intel Core i5\nRAM: 16 GB\nSSD / Storage: 512 GB\nScreen: 15.6 Inch`}
                  />
                </div>
              </div>

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
            </>
          )}

          {activeTab === 'variants' && (
            <div className="text-center py-8 text-zinc-500">
              <p>Product variants coming soon.</p>
              <p className="text-sm mt-2">Use the description field to mention available sizes/colors for now.</p>
            </div>
          )}
        </form>

        <div className="border-t border-zinc-100 px-5 py-4 space-y-2">
          {!initial.name && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setAddAnother(true);
                setTimeout(() => {
                  formRef.current?.requestSubmit();
                }, 0);
              }}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {saving && addAnother ? 'Saving…' : '+ Save & Add Another'}
            </button>
          )}
          <div className="flex gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
              type="button"
              disabled={saving}
                onClick={() => {
                  setAddAnother(false);
                  setTimeout(() => {
                    formRef.current?.requestSubmit();
                  }, 0);
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {saving && !addAnother ? 'Saving…' : initial.name ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Import Modal
// ─────────────────────────────────────────────
function ImportProductsModal({
  value,
  mode,
  loading,
  onChange,
  onModeChange,
  onImport,
  onClose,
}: {
  value: string;
  mode: 'replace' | 'append';
  loading: boolean;
  onChange: (value: string) => void;
  onModeChange: (mode: 'replace' | 'append') => void;
  onImport: () => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    onChange(await file.text());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-zinc-900">Import Your Products</h2>
            <p className="mt-1 text-sm text-zinc-500">Paste a JSON array or load a `.json` file from your computer.</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100 transition">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Use `replace current catalog` if you want only your products on the site. Use `add to current catalog` if you want to keep what is already there.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onModeChange('replace')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'replace' ? 'bg-red-600 text-white' : 'border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-red-600'}`}
            >
              Replace Current Catalog
            </button>
            <button
              type="button"
              onClick={() => onModeChange('append')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'append' ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'}`}
            >
              Add To Current Catalog
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-auto rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Load JSON File
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Products JSON</label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={18}
              spellCheck={false}
              placeholder={IMPORT_PLACEHOLDER}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-6 py-4">
          <p className="text-xs text-zinc-400">Required fields: `name`, `category`, `price`, `description`. Images are optional and can be added later.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onImport}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Importing…' : 'Import Products'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstShopImportModal({
  collectionHandle,
  limit,
  bankRate,
  productLinks,
  loading,
  onCollectionHandleChange,
  onLimitChange,
  onBankRateChange,
  onProductLinksChange,
  onImport,
  onClose,
}: {
  collectionHandle: string;
  limit: string;
  bankRate: string;
  productLinks: string;
  loading: boolean;
  onCollectionHandleChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onBankRateChange: (value: string) => void;
  onProductLinksChange: (value: string) => void;
  onImport: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-zinc-900">Import FirstShop SA Products</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Import by collection, or paste specific FirstShop product links.
            </p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Imported items are mapped to <strong>SA Imports</strong> and tagged for <strong>5-day delivery from SA</strong>.
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Collection Handle or URL
              </label>
              <input
                value={collectionHandle}
                onChange={(e) => onCollectionHandleChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="external-solid-state-drive-ssd"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Limit</label>
              <input
                type="number"
                min={1}
                max={120}
                value={limit}
                onChange={(e) => onLimitChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Bank Rate (ZAR per 1 USD)
              </label>
              <input
                type="number"
                min={0.01}
                step="0.0001"
                value={bankRate}
                onChange={(e) => onBankRateChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="16.3104"
              />
              <p className="mt-1 text-xs text-zinc-500">Leave blank to use live rate feed automatically.</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Specific Product Links (Optional)
            </label>
            <textarea
              rows={8}
              value={productLinks}
              onChange={(e) => onProductLinksChange(e.target.value)}
              placeholder={`https://www.firstshop.co.za/products/verbatim-1tb-m-2-usb-3-2-external-pocket-ssd-black-red-32192-316748\nhttps://www.firstshop.co.za/products/another-product-handle`}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Paste one link per line. When links are provided, these products are imported directly.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-6 py-4">
          <p className="text-xs text-zinc-400">Supports FirstShop product URLs or direct handles.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onImport}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Importing…' : 'Import FirstShop SA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Bulk Edit Modal
// ─────────────────────────────────────────────
function BulkEditModal({
  selectedCount,
  onClose,
  onApply,
  loading,
}: {
  selectedCount: number;
  onClose: () => void;
  onApply: (changes: Partial<Product>) => void;
  loading: boolean;
}) {
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState<boolean | ''>('');
  const [featured, setFeatured] = useState<boolean | ''>('');

  const handleApply = () => {
    const changes: Partial<Product> = {};
    if (category) changes.category = category;
    if (inStock !== '') changes.inStock = inStock;
    if (featured !== '') changes.featured = featured;
    onApply(changes);
  };

  const hasChanges = category || inStock !== '' || featured !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="font-heading text-base font-bold text-zinc-900 mb-1">Bulk Edit {selectedCount} Products</h3>
        <p className="text-sm text-zinc-500 mb-5">Select fields to update on all selected products.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Change Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="">— Keep unchanged —</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Stock Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInStock(inStock === true ? '' : true)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  inStock === true ? 'border-green-500 bg-green-50 text-green-700' : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Set In Stock
              </button>
              <button
                type="button"
                onClick={() => setInStock(inStock === false ? '' : false)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  inStock === false ? 'border-red-500 bg-red-50 text-red-700' : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Set Out of Stock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">Featured Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeatured(featured === true ? '' : true)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  featured === true ? 'border-red-500 bg-red-50 text-red-700' : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Set Featured
              </button>
              <button
                type="button"
                onClick={() => setFeatured(featured === false ? '' : false)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  featured === false ? 'border-zinc-500 bg-zinc-100 text-zinc-700' : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Remove Featured
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hasChanges || loading}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
          >
            {loading ? 'Applying…' : `Update ${selectedCount} Products`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Admin Dashboard with Pagination, Export, etc.
// ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;
type SortField = 'name' | 'price' | 'stock' | 'category';
type SortDirection = 'asc' | 'desc';

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'yes' | 'no'>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Batch operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditing, setBulkEditing] = useState(false);
  
  // Import
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importText, setImportText] = useState('');
  const [firstshopImportOpen, setFirstshopImportOpen] = useState(false);
  const [firstshopCollectionHandle, setFirstshopCollectionHandle] = useState('external-solid-state-drive-ssd');
  const [firstshopLimit, setFirstshopLimit] = useState('60');
  const [firstshopBankRate, setFirstshopBankRate] = useState('');
  const [firstshopProductLinks, setFirstshopProductLinks] = useState('');
  const [importingFirstshop, setImportingFirstshop] = useState(false);
  const [enrichingSpecs, setEnrichingSpecs] = useState(false);

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

  useEffect(() => {
    queueMicrotask(() => {
      void fetchProducts();
    });
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat, filterStock, filterFeatured, priceRange, sortField, sortDirection]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const query = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.productType.toLowerCase().includes(query) ||
        p.bundleItems.some((item) => item.toLowerCase().includes(query));
      const matchCat = !filterCat || p.category === filterCat;
      const matchStock = filterStock === 'all' || (filterStock === 'in' ? p.inStock : !p.inStock);
      const matchFeatured = filterFeatured === 'all' || (filterFeatured === 'yes' ? p.featured : !p.featured);
      const matchPrice = 
        (!priceRange.min || p.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || p.price <= parseFloat(priceRange.max));
      return matchSearch && matchCat && matchStock && matchFeatured && matchPrice;
    });
  }, [products, search, filterCat, filterStock, filterFeatured, priceRange]);

  const sortedFiltered = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let left: string | number = '';
      let right: string | number = '';

      if (sortField === 'name') {
        left = a.name.toLowerCase();
        right = b.name.toLowerCase();
      } else if (sortField === 'price') {
        left = a.price;
        right = b.price;
      } else if (sortField === 'stock') {
        left = a.inStock ? (typeof a.stockCount === 'number' ? a.stockCount : 9999) : -1;
        right = b.inStock ? (typeof b.stockCount === 'number' ? b.stockCount : 9999) : -1;
      } else if (sortField === 'category') {
        left = getCategoryLabel(a.category).toLowerCase();
        right = getCategoryLabel(b.category).toLowerCase();
      }

      if (left < right) return sortDirection === 'asc' ? -1 : 1;
      if (left > right) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filtered, sortDirection, sortField]);

  // Pagination
  const totalPages = Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const visibleStart = sortedFiltered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedFiltered.length);

  // Batch selection helpers
  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  
  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      paginatedProducts.forEach((p) => newSet.delete(p.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginatedProducts.forEach((p) => newSet.add(p.id));
      setSelectedIds(newSet);
    }
  };
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection(field === 'price' ? 'desc' : 'asc');
  };

  const sortGlyph = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true); };
  
  const handleDuplicate = (p: Product) => {
    const duplicated: Product = {
      ...p,
      id: '', // Will be assigned by server
      slug: `${p.slug}-copy`,
      name: `${p.name} (Copy)`,
    };
    setEditTarget(duplicated);
    setFormOpen(true);
  };

  const exportProducts = () => {
    const exportData = filtered.length > 0 ? filtered : products;
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cansan-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${exportData.length} products`);
  };

  const saveProduct = async (form: typeof EMPTY_FORM) => {
    const specs: Record<string, string> = {};
    if (form.specsText.trim()) {
      for (const line of form.specsText.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0) {
          const key = trimmed.slice(0, colonIdx).trim();
          const val = trimmed.slice(colonIdx + 1).trim();
          if (key && val) specs[key] = val;
        }
      }
    }

    const body = {
      ...form,
      price: parseFloat(String(form.price)),
      originalPrice: form.originalPrice ? parseFloat(String(form.originalPrice)) : undefined,
      condition: form.productType === 'bundle' ? undefined : (form.condition || undefined),
      tags: String(form.tags).split(',').map((t) => t.trim()).filter(Boolean),
      bundleItems: String(form.bundleItems).split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      stockCount: form.stockCount ? parseInt(String(form.stockCount), 10) : undefined,
      rating: form.rating ? Math.min(5, Math.max(0, parseInt(String(form.rating), 10))) : undefined,
      reviewCount: form.reviewCount ? parseInt(String(form.reviewCount), 10) : undefined,
      dealLabel: form.dealLabel.trim() || undefined,
      specs: Object.keys(specs).length > 0 ? specs : undefined,
      // Use first image as main image for backward compatibility
      image: form.images[0] || '',
    };
    
    if (editTarget && editTarget.id) {
      return fetch(`/api/admin/products/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    return fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const handleSave = async (form: typeof EMPTY_FORM) => {
    setSaving(true);
    const res = await saveProduct(form);
    setSaving(false);
    if (res.ok) {
      setFormOpen(false);
      fetchProducts();
      showToast(editTarget?.id ? 'Product updated' : 'Product added');
    } else {
      const err = await res.json().catch(() => ({ error: 'Failed' }));
      showToast(err.error || err.message || 'Failed to save');
    }
  };

  const handleSaveAndAdd = async (form: typeof EMPTY_FORM) => {
    setSaving(true);
    const res = await saveProduct(form);
    setSaving(false);
    if (res.ok) {
      setEditTarget(null);
      setFormOpen(false);
      setTimeout(() => setFormOpen(true), 0);
      fetchProducts();
      showToast('Product added — ready for next');
    } else {
      const err = await res.json().catch(() => ({ error: 'Failed' }));
      showToast(err.error || err.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchProducts();
        showToast('Product deleted');
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to delete' }));
        showToast(err.error || 'Failed to delete');
      }
    } catch {
      showToast('Network error — could not delete product');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setBatchDeleting(true);
    const res = await fetch('/api/admin/products/batch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    setBatchDeleting(false);
    
    if (res.ok) {
      const result = await res.json();
      setSelectedIds(new Set());
      setBatchDeleteOpen(false);
      fetchProducts();
      showToast(`${result.deleted} products deleted`);
    } else {
      showToast('Batch delete failed');
    }
  };

  const handleBulkEdit = async (changes: Partial<Product>) => {
    if (selectedIds.size === 0) return;
    
    setBulkEditing(true);
    const res = await fetch('/api/admin/products/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds), changes }),
    });
    setBulkEditing(false);
    
    if (res.ok) {
      const result = await res.json();
      setSelectedIds(new Set());
      setBulkEditOpen(false);
      fetchProducts();
      showToast(`${result.updated} products updated`);
    } else {
      showToast('Bulk update failed');
    }
  };

  const handleEnrichSpecs = async (ids?: string[]) => {
    const targetCount = ids && ids.length > 0 ? ids.length : products.length;
    if (targetCount === 0) {
      showToast('No products available for AI specs enrichment');
      return;
    }

    const confirmed = window.confirm(
      ids && ids.length > 0
        ? `Generate AI specs for ${ids.length} selected products? Existing specs will be preserved.`
        : `Generate AI specs across all ${products.length} products? Existing specs will be preserved.`
    );

    if (!confirmed) {
      return;
    }

    setEnrichingSpecs(true);
    try {
      const res = await fetch('/api/admin/products/enrich-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ids && ids.length > 0 ? ids : undefined,
          onlyMissing: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'AI specs enrichment failed');
        return;
      }

      await fetchProducts();
      const updated = Number(data.updated || 0);
      const skipped = Number(data.skipped || 0);
      const failed = Number(data.failed || 0);
      showToast(`AI specs done: ${updated} updated, ${skipped} skipped, ${failed} failed`);
    } finally {
      setEnrichingSpecs(false);
    }
  };

  const handleImport = async () => {
    let parsed;

    try {
      parsed = JSON.parse(importText);
    } catch {
      showToast('Invalid JSON format');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      showToast('Paste a JSON array with at least one product');
      return;
    }

    setImporting(true);
    const res = await fetch('/api/admin/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: parsed, mode: importMode }),
    });
    setImporting(false);

    if (res.ok) {
      setImportOpen(false);
      setImportText('');
      await fetchProducts();
      showToast(importMode === 'replace' ? 'Catalog replaced successfully' : 'Products imported successfully');
      return;
    }

    const err = await res.json().catch(() => ({ error: 'Import failed' }));
    showToast(err.error || 'Import failed');
  };

  const handleImportFirstShop = async () => {
    const parsedLimit = Number.parseInt(firstshopLimit, 10);
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(120, parsedLimit)) : 60;
    const parsedBankRate = Number.parseFloat(firstshopBankRate);
    const bankRate = Number.isFinite(parsedBankRate) && parsedBankRate > 0 ? parsedBankRate : undefined;
    const links = firstshopProductLinks
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const importMessage =
      links.length > 0
        ? `Import ${links.length} specific FirstShop products into SA Imports with 5-day delivery labeling?`
        : 'Import FirstShop SA products from collection into SA Imports with 5-day delivery labeling?';
    const confirmed = window.confirm(importMessage);
    if (!confirmed) return;

    setImportingFirstshop(true);
    try {
      const res = await fetch('/api/admin/products/import-firstshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'append',
          limit,
          collectionHandle: firstshopCollectionHandle,
          bankRate,
          productLinks: links.length > 0 ? links : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'FirstShop import failed');
        return;
      }

      await fetchProducts();
      setFirstshopImportOpen(false);
      setFirstshopProductLinks('');
      const rateUsed =
        data?.conversion && typeof data.conversion.usdToZarRate === 'number'
          ? ` @ rate ${data.conversion.usdToZarRate}`
          : '';
      showToast(`Imported ${data.imported || 0} SA products${rateUsed}`);
    } finally {
      setImportingFirstshop(false);
    }
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <AdminLayout onLogout={onLogout}>
      <main className="p-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
          {[
            { label: 'Total Products', value: products.length, color: 'text-zinc-900' },
            { label: 'In Stock', value: inStockCount, color: 'text-green-600' },
            { label: 'Out of Stock', value: products.length - inStockCount, color: 'text-red-500' },
            { label: 'Featured', value: featuredCount, color: 'text-red-600' },
            { label: 'Categories', value: new Set(products.map((p) => p.category)).size, color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-zinc-400">{stat.label}</p>
              <p className={`font-heading text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
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
            <button
              onClick={openAdd}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'yes' | 'no')}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-300"
            >
              <option value="all">All items</option>
              <option value="yes">Featured only</option>
              <option value="no">Not featured</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange((r) => ({ ...r, min: e.target.value }))}
                className="w-20 rounded-lg border border-zinc-200 px-2 py-2 text-sm"
              />
              <span className="text-zinc-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange((r) => ({ ...r, max: e.target.value }))}
                className="w-20 rounded-lg border border-zinc-200 px-2 py-2 text-sm"
              />
            </div>

            <button
              onClick={() => {
                setSearch('');
                setFilterCat('');
                setFilterStock('all');
                setFilterFeatured('all');
                setPriceRange({ min: '', max: '' });
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              Clear Filters
            </button>

            <div className="h-6 w-px bg-zinc-200" />

            {selectedIds.size > 0 ? (
              <>
                <button
                  onClick={() => setBulkEditOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                  Edit {selectedIds.size}
                </button>
                <button
                  onClick={() => handleEnrichSpecs(Array.from(selectedIds))}
                  disabled={enrichingSpecs}
                  className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                >
                  {enrichingSpecs ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-700 border-t-transparent" />
                  ) : (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  )}
                  AI Specs {selectedIds.size}
                </button>
                <button
                  onClick={() => setBatchDeleteOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-200"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.668 0 0 0-7.5 0" />
                  </svg>
                  Delete {selectedIds.size}
                </button>
              </>
            ) : null}

            <button
              onClick={() => handleEnrichSpecs()}
              disabled={enrichingSpecs || products.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
            >
              {enrichingSpecs ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-700 border-t-transparent" />
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
              AI Specs All
            </button>

            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4.5m0 12 4.5-4.5M12 16.5 7.5 12m-3 6h15" />
              </svg>
              Import
            </button>

            <button
              onClick={() => setFirstshopImportOpen(true)}
              disabled={importingFirstshop}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              {importingFirstshop ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h10.5v9H3.75zm10.5 2.25h3l3 3v3.75h-6zm-7.5 8.25a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm10.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                </svg>
              )}
              Import FirstShop SA
            </button>

            <button
              onClick={exportProducts}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Showing {visibleStart}-{visibleEnd} of {sortedFiltered.length} filtered ({products.length} total)
          </span>
          {selectedIds.size > 0 && <span>{selectedIds.size} selected</span>}
        </div>

        {/* Products table */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            {sortedFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-900">No products found</p>
                  <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters or import your catalog.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setImportOpen(true)}
                    className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Import Products JSON
                  </button>
                  <button
                    onClick={openAdd}
                    className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Add Product Manually
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="max-h-[70vh] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected; }}
                            onChange={toggleSelectAll}
                            className="rounded border-zinc-300 text-red-600 focus:ring-red-500"
                          />
                        </th>
                        <th className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleSort('name')}
                            className="inline-flex items-center gap-1 transition hover:text-zinc-700"
                          >
                            Product
                            <span className="text-[10px]">{sortGlyph('name')}</span>
                          </button>
                        </th>
                        <th className="px-4 py-3 hidden sm:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort('category')}
                            className="inline-flex items-center gap-1 transition hover:text-zinc-700"
                          >
                            Category
                            <span className="text-[10px]">{sortGlyph('category')}</span>
                          </button>
                        </th>
                        <th className="px-4 py-3 hidden lg:table-cell">Type</th>
                        <th className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleSort('price')}
                            className="inline-flex items-center gap-1 transition hover:text-zinc-700"
                          >
                            Price
                            <span className="text-[10px]">{sortGlyph('price')}</span>
                          </button>
                        </th>
                        <th className="px-4 py-3 hidden md:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort('stock')}
                            className="inline-flex items-center gap-1 transition hover:text-zinc-700"
                          >
                            Status
                            <span className="text-[10px]">{sortGlyph('stock')}</span>
                          </button>
                        </th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => (
                        <tr key={p.id} className={`border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors ${selectedIds.has(p.id) ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              className="rounded border-zinc-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                                <img 
                                  src={p.image || '/images/products/placeholder.svg'} 
                                  alt={p.name} 
                                  className="h-full w-full object-contain p-1" 
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-900 line-clamp-1">{p.name}</p>
                                <p className="text-[11px] text-zinc-400 font-mono">{p.slug}</p>
                                {isBundleProduct(p) && p.bundleItems.length > 0 && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                                    {p.bundleItems.length} bundled item{p.bundleItems.length === 1 ? '' : 's'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 capitalize">
                              {getCategoryLabel(p.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${isBundleProduct(p) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                              {isBundleProduct(p) ? 'Bundle' : 'Single'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-zinc-900">{formatAdminCurrency(p.price, p.currency)}</p>
                            <p className="text-[10px] font-medium uppercase text-zinc-400">{p.currency}</p>
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
                                onClick={() => handleDuplicate(p)}
                                className="rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 transition"
                                title="Duplicate"
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                                </svg>
                              </button>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
                    <p className="text-xs text-zinc-500">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-red-600 text-white'
                                : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Product form panel */}
      {formOpen && (
        <ProductForm
          initial={
            editTarget
              ? {
                  ...editTarget,
                  price: String(editTarget.price),
                  originalPrice: editTarget.originalPrice != null ? String(editTarget.originalPrice) : '',
                  tags: editTarget.tags.join(', '),
                  condition: editTarget.condition || '',
                  productType: editTarget.productType || 'single',
                  bundleItems: editTarget.bundleItems.join('\n'),
                  stockCount: editTarget.stockCount != null ? String(editTarget.stockCount) : '',
                  rating: editTarget.rating != null ? String(editTarget.rating) : '',
                  reviewCount: editTarget.reviewCount != null ? String(editTarget.reviewCount) : '',
                  dealLabel: editTarget.dealLabel || '',
                  specsText: editTarget.specs
                    ? Object.entries(editTarget.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
                    : '',
                  images: editTarget.image ? [editTarget.image] : [],
                }
              : EMPTY_FORM
          }
          onSave={handleSave}
          onSaveAndAdd={handleSaveAndAdd}
          onClose={() => setFormOpen(false)}
          saving={saving}
        />
      )}

      {importOpen && (
        <ImportProductsModal
          value={importText}
          mode={importMode}
          loading={importing}
          onChange={setImportText}
          onModeChange={setImportMode}
          onImport={handleImport}
          onClose={() => setImportOpen(false)}
        />
      )}

      {firstshopImportOpen && (
        <FirstShopImportModal
          collectionHandle={firstshopCollectionHandle}
          limit={firstshopLimit}
          bankRate={firstshopBankRate}
          productLinks={firstshopProductLinks}
          loading={importingFirstshop}
          onCollectionHandleChange={setFirstshopCollectionHandle}
          onLimitChange={setFirstshopLimit}
          onBankRateChange={setFirstshopBankRate}
          onProductLinksChange={setFirstshopProductLinks}
          onImport={handleImportFirstShop}
          onClose={() => setFirstshopImportOpen(false)}
        />
      )}

      {bulkEditOpen && (
        <BulkEditModal
          selectedCount={selectedIds.size}
          onClose={() => setBulkEditOpen(false)}
          onApply={handleBulkEdit}
          loading={bulkEditing}
        />
      )}

      {/* Single delete confirmation modal */}
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

      {/* Batch delete confirmation modal */}
      {batchDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="font-heading text-base font-bold text-zinc-900 mb-1">Delete {selectedIds.size} products?</h3>
            <p className="text-sm text-zinc-500 mb-5">
              This will permanently remove {selectedIds.size} selected products from the catalog. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setBatchDeleteOpen(false)} 
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBatchDelete} 
                disabled={batchDeleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {batchDeleting ? 'Deleting…' : `Delete ${selectedIds.size} Products`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────
export default function ProductsAdminPage() {
  return <AdminAuthGate>{({ onLogout }) => <Dashboard onLogout={onLogout} />}</AdminAuthGate>;
}
