'use client';

import { useState, useEffect } from 'react';
import type { Client } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';
import { downloadCsv } from '@/lib/csv-export';

function getInitials(name: string) {
  return name.charAt(0).toUpperCase() || '?';
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-amber-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function emptyClient(): Client {
  return {
    id: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  };
}

export default function ClientsAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      if (res.ok) setClients(await res.json());
    } catch {
      setMessage('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async (client: Client) => {
    setSaving(true);
    try {
      const isNew = !client.id || !clients.find((c) => c.id === client.id);
      const url = isNew ? '/api/admin/clients' : `/api/admin/clients/${client.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) {
        setMessage(isNew ? 'Client created' : 'Client updated');
        setEditing(null);
        fetchClients();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Error saving client');
    } finally {
      setSaving(false);
    }
  };

  const removeClient = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Client deleted');
        fetchClients();
      }
    } catch {
      setMessage('Error deleting client');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (client?: Client) => {
    if (client) {
      setEditing({ ...client });
    } else {
      setEditing({ ...emptyClient(), id: `client-${Date.now()}` });
    }
  };

  // Stats
  const totalCount = clients.length;
  const withCompany = clients.filter((c) => c.company && c.company.trim() !== '').length;
  const now = new Date();
  const thisMonth = clients.filter((c) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filtered clients
  const q = search.toLowerCase();
  const filtered = q
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    : clients;

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
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Total Clients</p>
            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">With Company</p>
            <p className="text-2xl font-bold text-blue-600">{withCompany}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Recently Added</p>
            <p className="text-2xl font-bold text-green-600">{thisMonth}</p>
            <p className="text-xs text-zinc-400">this month</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Clients</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCsv(
                `clients-${new Date().toISOString().slice(0, 10)}.csv`,
                [
                  { header: 'Name', get: (c: Client) => c.name },
                  { header: 'Company', get: (c: Client) => c.company || '' },
                  { header: 'Email', get: (c: Client) => c.email },
                  { header: 'Phone', get: (c: Client) => c.phone },
                  { header: 'Address', get: (c: Client) => c.address },
                  { header: 'Notes', get: (c: Client) => c.notes || '' },
                ],
                clients,
              )}
              disabled={clients.length === 0}
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
              New Client
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full max-w-md rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 && !search ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <svg className="mx-auto mb-3 text-zinc-300" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="text-zinc-500 mb-3">No clients yet &mdash; add your first client</p>
            <button onClick={() => startEdit()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Add First Client
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <p className="text-zinc-500">No clients matching &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${getAvatarColor(c.name)}`}>
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 truncate">{c.name}</p>
                    {c.company && <p className="text-sm text-zinc-500 truncate">{c.company}</p>}
                    {c.email && <p className="text-sm text-zinc-500 truncate">{c.email}</p>}
                    {c.phone && <p className="text-sm text-zinc-500">{c.phone}</p>}
                    {c.address && <p className="text-xs text-zinc-400 mt-1 truncate">{c.address}</p>}
                  </div>
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button onClick={() => startEdit(c)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">Edit</button>
                  <button onClick={() => removeClient(c.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Slide Panel */}
        {editing && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h2 className="font-heading text-sm font-bold text-zinc-900">
                  {clients.find((c) => c.id === editing.id) ? 'Edit Client' : 'New Client'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600">&#10005;</button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); saveClient(editing); }}
                className="flex-1 overflow-y-auto p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Name *</label>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Company</label>
                  <input
                    value={editing.company || ''}
                    onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={editing.email}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Phone</label>
                  <input
                    value={editing.phone}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Address</label>
                  <textarea
                    value={editing.address}
                    onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Notes</label>
                  <textarea
                    value={editing.notes || ''}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Internal notes..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Client'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
