'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

interface Category {
  id: string;
  label: string;
  icon: string;
  slug: string;
}

const ICON_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'printer', label: 'Printer' },
  { value: 'network', label: 'Network' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'plug', label: 'Plug/Accessory' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'cpu', label: 'CPU/Components' },
  { value: 'storage', label: 'Storage' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'shield-camera', label: 'Security/CCTV' },
  { value: 'deals', label: 'Deals' },
  { value: 'battery', label: 'Battery/Power' },
  { value: 'gadget', label: 'Gadget' },
  { value: 'wifi', label: 'WiFi' },
];

function CategoryIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    laptop: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>,
    printer: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>,
    network: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" /></svg>,
    desktop: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>,
    monitor: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>,
    plug: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.8 0A48.424 48.424 0 0 1 9.75 3.874c-.513.046-1.023.1-1.523.166M15 6.75h.008v.008H15V6.75Zm-3 0h.008v.008H12V6.75Zm-3 0h.008v.008H9V6.75Zm5.25 6h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" /></svg>,
    headphones: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>,
    cpu: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
    storage: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.375m-16.5-3.375v3.375m16.5 0v3.375c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.375m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>,
    smartphone: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>,
    'shield-camera': <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H15.75Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9.75v4.5m0 0v.008l0 .008" /></svg>,
    deals: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6Z" /></svg>,
    battery: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.8 0A48.424 48.424 0 0 1 9.75 3.874c-.513.046-1.023.1-1.523.166M15 6.75h.008v.008H15V6.75Z" /></svg>,
    gadget: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 3 3m13.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-3 3m-13.5 0v-3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125V15m-9 3h.008v.008H12V18Zm-3 0h.008v.008H9V18Zm6 0h.008v.008H15V18Z" /></svg>,
    wifi: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" /></svg>,
  };

  return (
    <span className="text-zinc-600">
      {icons[icon] || icons['laptop']}
    </span>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authed) fetchCategories();
  }, [authed]);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/products');
    setAuthed(res.ok);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      setMessage('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (category: Category) => {
    setSaving(true);
    try {
      const isNew = !categories.find((c) => c.id === category.id);
      const res = await fetch('/api/admin/categories', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (res.ok) {
        setMessage(isNew ? 'Category created' : 'Category updated');
        setEditing(null);
        fetchCategories();
      } else {
        setMessage('Failed to save');
      }
    } catch {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in this category will need to be reassigned.')) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Category deleted');
        fetchCategories();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Error deleting');
      }
    } catch {
      setMessage('Error deleting');
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
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
            <button onClick={() => setMessage('')} className="ml-2 text-green-800 hover:underline">Dismiss</button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Categories</h1>
            <p className="text-sm text-zinc-500">Manage product categories</p>
          </div>
          <button
            onClick={() => setEditing({ id: '', label: '', icon: 'laptop', slug: '' })}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-zinc-500">No categories yet. Create your first category.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 truncate">{category.label}</h3>
                    <p className="text-xs text-zinc-400">/{category.slug}</p>
                    <p className="text-xs text-zinc-500 mt-1">ID: {category.id}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditing(category)}
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
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
                  {editing.id ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveCategory(editing);
                }}
                className="flex-1 overflow-y-auto p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Category ID</label>
                  <input
                    value={editing.id}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono"
                    placeholder="e.g. laptops"
                    autoFocus
                    required
                    disabled={!!categories.find((c) => c.id === editing.id)}
                  />
                  <p className="mt-1 text-[10px] text-zinc-400">Unique identifier, used in URLs</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Display Name</label>
                  <input
                    value={editing.label}
                    onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="e.g. Laptops & Computers"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">URL Slug</label>
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono"
                    placeholder="e.g. laptops"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">Icon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setEditing({ ...editing, icon: icon.value })}
                        className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${
                          editing.icon === icon.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <CategoryIcon icon={icon.value} />
                        <span className="text-[10px] text-zinc-600 text-center leading-tight">{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

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
                    {saving ? 'Saving…' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
