'use client';

import { useEffect, useRef, useState } from 'react';
import type { Brand } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';

const EMPTY_BRAND: Brand = {
  id: '',
  name: '',
  logoUrl: '',
  active: true,
  sortOrder: 0,
  createdAt: undefined,
};

const MAX_LOGO_FILE_SIZE = 2.5 * 1024 * 1024;
const MAX_LOGO_DIMENSION = 2400;

async function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image dimensions'));
    };

    image.src = objectUrl;
  });
}

async function validateLogoFile(file: File) {
  if (!['image/svg+xml', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Upload an SVG, PNG, or WebP logo. JPG screenshots and posters look bad in the homepage strip.';
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    return 'Logo file is too large. Keep it under 2.5MB.';
  }

  if (file.type !== 'image/svg+xml') {
    const { width, height } = await getImageDimensions(file);
    const longestSide = Math.max(width, height);
    const ratio = width / height;

    if (longestSide > MAX_LOGO_DIMENSION) {
      return `This file is ${width}x${height}. Resize or export a trimmed logo under 2400px on the longest side.`;
    }

    if (ratio > 6 || ratio < 0.45) {
      return 'This logo shape is too extreme for the homepage strip. Use a cleaner wordmark or badge export.';
    }
  }

  return null;
}

function LogoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');

    const validationError = await validateLogoFile(file);
    if (validationError) {
      setPreview(value);
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setPreview(data.url);
        setError('');
      } else {
        setError('Upload failed');
      }
    } catch {
      setError('Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-500 mb-1">Brand Logo</label>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        Use a transparent SVG, PNG, or WebP logo on a clean background. Avoid screenshots, full posters, or oversized artwork.
      </p>

      {preview ? (
        <div className="relative flex h-32 items-center justify-center rounded-lg border border-zinc-200 bg-white overflow-hidden p-4">
          <img src={preview} alt="Logo preview" className="max-h-full w-auto max-w-full object-contain" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium opacity-0 hover:opacity-100 transition"
          >
            Change Logo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              <span className="text-xs">Uploading...</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <span className="text-xs font-medium">Click to upload logo</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value ? <p className="text-[10px] text-zinc-400 truncate">{value}</p> : null}
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authed) fetchBrands();
  }, [authed]);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/products');
    setAuthed(res.ok);
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      } else {
        setMessage('Failed to fetch brands');
      }
    } catch {
      setMessage('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const save = async (brand: Brand) => {
    setSaving(true);
    try {
      const isNew = !brand.id || !brands.find((item) => item.id === brand.id);
      const res = await fetch('/api/admin/brands', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });

      if (res.ok) {
        setMessage(isNew ? 'Brand created' : 'Brand updated');
        setEditing(null);
        fetchBrands();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to save brand');
      }
    } catch {
      setMessage('Error saving brand');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this brand logo?')) return;

    try {
      const res = await fetch('/api/admin/brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessage('Brand deleted');
        fetchBrands();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to delete brand');
      }
    } catch {
      setMessage('Error deleting brand');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Unauthorized</div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <main className="p-6">
        {message ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
            <button onClick={() => setMessage('')} className="ml-2 hover:underline">Dismiss</button>
          </div>
        ) : null}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Brands</h1>
              <p className="text-sm text-zinc-500">Upload and order brand logos for the homepage slider</p>
            </div>
          <button
            onClick={() => setEditing({ ...EMPTY_BRAND, id: `brand-${Date.now()}`, sortOrder: brands.length })}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Brand
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Homepage logos must be clean brand marks, not screenshots or promotional artwork. Wide wordmarks and transparent badge exports display best.
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : brands.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-zinc-500">No uploaded brands yet. Add your first logo to power the homepage slider.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <div key={brand.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex min-h-28 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <img src={brand.logoUrl} alt={brand.name} className="max-h-16 w-auto max-w-full object-contain" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-900">{brand.name}</h3>
                    {!brand.active ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">Inactive</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Sort order: {brand.sortOrder}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(brand)}
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(brand.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing ? (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="flex w-full max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {editing.id && brands.find((item) => item.id === editing.id) ? 'Edit Brand' : 'New Brand'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save(editing);
                }}
                className="flex-1 space-y-4 overflow-y-auto p-5"
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">Brand Name</label>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Samsung"
                    required
                  />
                </div>

                <LogoUpload value={editing.logoUrl} onChange={(url) => setEditing({ ...editing, logoUrl: url })} />

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    min={0}
                  />
                  <p className="mt-1 text-[10px] text-zinc-400">Lower numbers appear first in the slider.</p>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    className="rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-700">Active (visible on site)</span>
                </label>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </AdminLayout>
  );
}
