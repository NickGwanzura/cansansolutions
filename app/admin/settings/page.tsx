'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { CompanyProfile } from '@/lib/types';
import AdminLayout from '../components/AdminLayout';

export default function SettingsPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Site settings
  const [currency, setCurrency] = useState('USD');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [itemsPerPage, setItemsPerPage] = useState('20');

  // Company profile
  const [company, setCompany] = useState<CompanyProfile>({
    id: 'default',
    name: '',
    tagline: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    vatNumber: '',
    tinNumber: '',
    vendorNumber: '',
    logoUrl: '/images/brand/cansan-logo.png',
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [, setSavingSettings] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const res = await fetch('/api/admin/company');
      if (res.ok) setCompany(await res.json());
    } catch {
      /* ignore */
    }
  };

  const saveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      if (res.ok) {
        setCompany(await res.json());
        setMessage('Company profile saved successfully');
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to save company profile');
      }
    } catch {
      setMessage('Error saving company profile');
    } finally {
      setSavingCompany(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      setAuthed(res.ok);
    } catch {
      setAuthed(false);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          low_stock_threshold: String(lowStockThreshold),
          items_per_page: String(itemsPerPage),
        }),
      });
      if (res.ok) {
        setMessage('Settings saved successfully');
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to save settings');
      }
    } catch {
      setMessage('Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Unauthorized</div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <main className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500">Manage admin preferences</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.includes('success') || message.includes('saved')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message}
            <button onClick={() => setMessage('')} className="ml-2 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Company Profile */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">Company Profile</h3>
            <form onSubmit={saveCompanyProfile} className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Logo URL</label>
                  <input
                    value={company.logoUrl}
                    onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="/images/brand/cansan-logo.png"
                  />
                </div>
                {company.logoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={company.logoUrl}
                    alt="Logo preview"
                    className="h-10 w-auto rounded border border-zinc-200"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    Company Name
                  </label>
                  <input
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Tagline</label>
                  <input
                    value={company.tagline}
                    onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Address Line 1
                </label>
                <input
                  value={company.addressLine1}
                  onChange={(e) => setCompany({ ...company, addressLine1: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Address Line 2
                </label>
                <input
                  value={company.addressLine2}
                  onChange={(e) => setCompany({ ...company, addressLine2: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">City</label>
                  <input
                    value={company.city}
                    onChange={(e) => setCompany({ ...company, city: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Country</label>
                  <input
                    value={company.country}
                    onChange={(e) => setCompany({ ...company, country: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Phone</label>
                  <input
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Email</label>
                  <input
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Website</label>
                  <input
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    TIN Number
                  </label>
                  <input
                    value={company.tinNumber}
                    onChange={(e) => setCompany({ ...company, tinNumber: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="e.g. 2001360981"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    VAT Number
                  </label>
                  <input
                    value={company.vatNumber}
                    onChange={(e) => setCompany({ ...company, vatNumber: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="e.g. 220445061"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">
                    Vendor Number
                  </label>
                  <input
                    value={company.vendorNumber}
                    onChange={(e) => setCompany({ ...company, vendorNumber: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="e.g. 723804"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingCompany}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {savingCompany ? 'Saving...' : 'Save Company Profile'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-zinc-900">Admin password</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              The admin password is managed through the{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-zinc-800">
                ADMIN_PASSWORD
              </code>{' '}
              deployment environment variable. Update it in Dokploy, then redeploy the service to
              apply the change.
            </p>
          </div>

          {/* Site Settings */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">Site Preferences</h3>
            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[10px] text-zinc-400">
                  Products with stock count below this will be flagged
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Products Per Page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Save Settings
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-2">Homepage Banner</h3>
            <p className="text-sm text-zinc-500">
              The &quot;Premium Tech Collection&quot; banner image is managed from the Banners
              screen, not this settings page.
            </p>
            <Link
              href="/admin/banners"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Open Banners
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* About */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900 mb-4">About</h3>
            <div className="space-y-2 text-sm text-zinc-600">
              <p>
                <span className="font-medium">Cansan Solutions</span> - Admin Panel
              </p>
              <p>Version: 2.0.0</p>
              <p>Features: Product Management, Categories, Banners, Analytics</p>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
