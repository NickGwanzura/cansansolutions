'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import type { SeoAnalyticsPayload } from '@/lib/types';

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

function formatDate(value?: string) {
  if (!value) return 'No data yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No data yet';
  return parsed.toLocaleString();
}

function maxViews(points: { views: number }[]) {
  return Math.max(...points.map((point) => point.views), 1);
}

export default function SeoAdminPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [summary, setSummary] = useState<SeoAnalyticsPayload | null>(null);
  const [error, setError] = useState<string>('');

  const load = async (windowDays: number) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/seo?days=${windowDays}`, { cache: 'no-store' });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: 'Failed to load SEO analytics' }));
        throw new Error(payload.error || 'Failed to load SEO analytics');
      }

      const payload = (await res.json()) as SeoAnalyticsPayload;
      setSummary(payload);
      setAuthed(true);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load SEO analytics';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const derived = useMemo(() => {
    const totalViews = summary?.totalViews ?? 0;
    const organicShare = totalViews > 0 ? (100 * (summary?.organicViews ?? 0)) / totalViews : 0;
    const directShare = totalViews > 0 ? (100 * (summary?.directViews ?? 0)) / totalViews : 0;
    const referralShare = totalViews > 0 ? (100 * (summary?.referralViews ?? 0)) / totalViews : 0;
    const socialShare = totalViews > 0 ? (100 * (summary?.socialViews ?? 0)) / totalViews : 0;
    return { totalViews, organicShare, directShare, referralShare, socialShare };
  }, [summary]);

  const decorateClickLabel = (raw: string) => {
    const colon = raw.indexOf(':');
    if (colon < 0) return { kind: 'click', target: raw };
    return { kind: raw.slice(0, colon), target: raw.slice(colon + 1) };
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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">SEO Analytics</h1>
            <p className="text-sm text-zinc-500">Track search traffic, source quality, and top-performing pages</p>
          </div>
          <label className="text-sm font-medium text-zinc-700">
            Window
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="ml-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-7">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Page Views</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{summary?.totalViews ?? 0}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Unique Visitors</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{summary?.uniqueVisitors ?? 0}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Unique Pages</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{summary?.uniquePages ?? 0}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Organic Share</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPercent(derived.organicShare)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Social Share</p>
                <p className="mt-1 text-2xl font-bold text-pink-600">{formatPercent(derived.socialShare)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Direct Share</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{formatPercent(derived.directShare)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-400">Referral Share</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">{formatPercent(derived.referralShare)}</p>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-900">Google Integrations</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${
                      summary?.connectors?.ga4Configured ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    GA4 {summary?.connectors?.ga4Configured ? 'Connected' : 'Not configured'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${
                      summary?.connectors?.gscConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    Search Console {summary?.connectors?.gscConfigured ? 'Connected' : 'Not configured'}
                  </span>
                </div>
              </div>

              {!summary?.connectors?.ga4Configured || !summary?.connectors?.gscConfigured ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Configure env vars: `GOOGLE_SERVICE_ACCOUNT_JSON` (or `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`), `GA4_PROPERTY_ID`, and `GSC_SITE_URL`.
                </div>
              ) : null}

              {summary?.connectors?.ga4Error ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  GA4 error: {summary.connectors.ga4Error}
                </div>
              ) : null}
              {summary?.connectors?.gscError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Search Console error: {summary.connectors.gscError}
                </div>
              ) : null}
            </section>

            {summary?.ga4 ? (
              <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">GA4 Snapshot</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Sessions</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.ga4.sessions}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Users</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.ga4.users}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Page Views</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.ga4.pageViews}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Avg Session Duration</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">
                      {Math.round(summary.ga4.avgSessionDurationSeconds)}s
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">Top Channels</h3>
                    <div className="space-y-2">
                      {summary.ga4.channels.map((row) => (
                        <div key={row.channel} className="flex items-center justify-between text-sm">
                          <p className="text-zinc-700">{row.channel}</p>
                          <p className="font-semibold text-zinc-900">{row.sessions} sessions</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">Top Landing Pages</h3>
                    <div className="space-y-2">
                      {summary.ga4.topLandingPages.map((row) => (
                        <div key={row.page} className="flex items-center justify-between gap-3 text-sm">
                          <p className="min-w-0 flex-1 truncate text-zinc-700">{row.page}</p>
                          <p className="font-semibold text-zinc-900">{row.sessions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {summary?.gsc ? (
              <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Search Console Snapshot</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Clicks</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.gsc.clicks}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Impressions</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.gsc.impressions}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">CTR</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{formatPercent(summary.gsc.ctr * 100)}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-400">Avg Position</p>
                    <p className="mt-1 text-xl font-bold text-zinc-900">{summary.gsc.averagePosition.toFixed(1)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">Top Queries</h3>
                    <div className="space-y-2">
                      {summary.gsc.topQueries.map((row) => (
                        <div key={row.value} className="flex items-center justify-between gap-3 text-sm">
                          <p className="min-w-0 flex-1 truncate text-zinc-700">{row.value}</p>
                          <p className="font-semibold text-zinc-900">{row.clicks} clicks</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-100 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900">Top Pages from Search</h3>
                    <div className="space-y-2">
                      {summary.gsc.topPages.map((row) => (
                        <div key={row.value} className="flex items-center justify-between gap-3 text-sm">
                          <p className="min-w-0 flex-1 truncate text-zinc-700">{row.value}</p>
                          <p className="font-semibold text-zinc-900">{row.clicks} clicks</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900">Daily Views</h2>
                  <p className="text-xs text-zinc-500">Last tracked: {formatDate(summary?.lastTrackedAt)}</p>
                </div>
                {summary?.dailyViews?.length ? (
                  <div className="space-y-2">
                    {summary.dailyViews.map((point) => (
                      <div key={point.date} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-zinc-500">{point.date}</div>
                        <div className="h-5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-red-600"
                            style={{ width: `${(point.views / maxViews(summary.dailyViews)) * 100}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-xs font-semibold text-zinc-700">{point.views}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No SEO events tracked yet.</p>
                )}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Top Pages</h2>
                {summary?.topPages?.length ? (
                  <div className="space-y-2">
                    {summary.topPages.map((row) => (
                      <div key={row.label} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2">
                        <p className="min-w-0 flex-1 truncate text-sm text-zinc-700">{row.label}</p>
                        <p className="text-sm font-semibold text-zinc-900">{row.views}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No page data yet.</p>
                )}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Traffic Sources</h2>
                {summary?.topSources?.length ? (
                  <div className="space-y-2">
                    {summary.topSources.map((row) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <div className="w-24 text-xs uppercase text-zinc-500">{row.label}</div>
                        <div className="h-5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${(row.views / Math.max(summary.topSources[0]?.views || 1, 1)) * 100}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-xs font-semibold text-zinc-700">{row.views}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No source data yet.</p>
                )}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Device Mix</h2>
                {summary?.devices?.length ? (
                  <div className="space-y-2">
                    {summary.devices.map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2">
                        <p className="text-sm capitalize text-zinc-700">{row.label}</p>
                        <p className="text-sm font-semibold text-zinc-900">{row.views}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No device data yet.</p>
                )}
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Top Search Terms</h2>
              {summary?.topSearchTerms?.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.topSearchTerms.map((row) => (
                    <div key={row.label} className="rounded-lg border border-zinc-100 px-3 py-2">
                      <p className="truncate text-sm text-zinc-700">{row.label}</p>
                      <p className="mt-1 text-xs font-semibold text-zinc-900">{row.views} visits</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No keyword terms detected yet. Terms will appear from organic referrers and UTM term tracking.
                </p>
              )}
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Top CTAs Clicked</h2>
                {summary?.topClicks?.length ? (
                  <div className="space-y-2">
                    {summary.topClicks.map((row) => {
                      const { kind, target } = decorateClickLabel(row.label);
                      return (
                        <div key={row.label} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2">
                          <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-zinc-600">
                            {kind}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm text-zinc-700" title={target}>{target || '—'}</p>
                          <p className="text-sm font-semibold text-zinc-900 tabular-nums">{row.views}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No CTA clicks recorded yet (WhatsApp, tel:, mailto:, outbound links, internal CTAs).</p>
                )}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Broken URLs (404s)</h2>
                {summary?.brokenUrls?.length ? (
                  <div className="space-y-2">
                    {summary.brokenUrls.map((row) => (
                      <div key={row.label} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/40 px-3 py-2">
                        <p className="min-w-0 flex-1 truncate text-sm text-red-700" title={row.label}>{row.label}</p>
                        <p className="text-sm font-semibold text-red-700 tabular-nums">{row.views}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No broken URLs in this window.</p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
}
