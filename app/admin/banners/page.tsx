'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Banner {
  id: string;
  name: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  position: string;
}

const EMPTY_BANNER = {
  id: '',
  name: '',
  image: '',
  title: '',
  subtitle: '',
  badge: 'New Arrivals',
  buttonText: 'Shop Now',
  buttonLink: '/products',
  active: true,
  position: 'homepage-hero',
};

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async (banner: Banner) => {
    setSaving(true);
    try {
      const isNew = !banner.id;
      const res = await fetch('/api/admin/banners', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      
      if (res.ok) {
        setMessage(isNew ? 'Banner created' : 'Banner updated');
        setEditing(null);
        fetchBanners();
      } else {
        setMessage('Failed to save');
      }
    } catch {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setMessage('Banner deleted');
        fetchBanners();
      }
    } catch {
      setMessage('Error deleting');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
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
              <span className="ml-2 text-xs text-zinc-400">Banner Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-zinc-400 hover:text-zinc-700 transition">
              ← Back to Products
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Homepage Banners</h1>
          <button
            onClick={() => setEditing({ ...EMPTY_BANNER, id: `banner-${Date.now()}` })}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Banner
          </button>
        </div>

        {/* Banner List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-zinc-500">No banners yet. Create your first banner.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-32 shrink-0 rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
                    {banner.image ? (
                      <img src={banner.image} alt={banner.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900">{banner.name}</h3>
                      {!banner.active && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 line-clamp-1">{banner.title}</p>
                    <p className="text-xs text-zinc-400">{banner.buttonText} → {banner.buttonLink}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(banner)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {editing.id ? 'Edit Banner' : 'New Banner'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  saveBanner(editing);
                }}
                className="flex-1 overflow-y-auto p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Banner Name</label>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Homepage Hero"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Image URL</label>
                  <input
                    value={editing.image}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="/images/banners/hero.jpg"
                    required
                  />
                  <p className="mt-1 text-[10px] text-zinc-400">Upload images via Admin → Upload, then paste the URL here</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Badge Text</label>
                  <input
                    value={editing.badge}
                    onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="New Arrivals"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
                  <input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Premium Tech Collection"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Subtitle</label>
                  <textarea
                    value={editing.subtitle}
                    onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Discover our latest range..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Button Text</label>
                    <input
                      value={editing.buttonText}
                      onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Button Link</label>
                    <input
                      value={editing.buttonLink}
                      onChange={(e) => setEditing({ ...editing, buttonLink: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="/products"
                    />
                  </div>
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
                    {saving ? 'Saving…' : 'Save Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
