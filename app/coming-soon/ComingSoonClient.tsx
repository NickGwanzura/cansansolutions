'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { WA_NUMBER, SITE_PHONE } from '@/lib/site';

const FEATURES = [
  {
    label: 'Mobiles & Accessories',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="6.75" y="2.5" width="10.5" height="19" rx="2" />
        <path strokeLinecap="round" d="M10.5 18.25h3" />
      </svg>
    ),
  },
  {
    label: 'Laptops & Computing',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="5" width="18" height="11" rx="1.5" />
        <path strokeLinecap="round" d="M2 19h20" />
      </svg>
    ),
  },
  {
    label: 'Networking Gear',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9c4.8-4.7 11.2-4.7 16 0M7.5 12.5c2.9-2.8 6.1-2.8 9 0M11.2 16.2a1.1 1.1 0 1 1 1.6 1.6 1.1 1.1 0 0 1-1.6-1.6Z" />
      </svg>
    ),
  },
  {
    label: 'CCTV & Security',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.2-3.6 4.6-6 8.8-6 4.1 0 7.5 2.4 8.7 6-1.2 3.6-4.6 6-8.7 6-4.2 0-7.6-2.4-8.8-6Z" />
        <circle cx="11.3" cy="12" r="2.7" />
      </svg>
    ),
  },
];

const TRUST_ITEMS = ['Genuine Products', 'WhatsApp Ordering', 'Warranty Backed', 'Trusted Since 2018'];

function useCountdown(until: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!until) return;
    const target = new Date(until).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [until]);

  return remainingMs;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

type ComingSoonClientProps = {
  until: string | null;
};

export function ComingSoonClient({ until }: ComingSoonClientProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const remainingMs = useCountdown(until);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Use replace + full page reload so the cookie is committed before
        // the middleware evaluates the next request — avoids redirect loop.
        window.location.replace('/');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const countdown = remainingMs !== null ? formatRemaining(remainingMs) : null;
  const whatsappHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hi Cansan Solutions, I'm reaching out while the site is under maintenance — I have a question."
  )}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "url('/circuit-pattern.svg')", backgroundSize: '120px 120px' }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-red-600/15 blur-[150px]" />
        <div className="absolute -left-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-red-900/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-10 flex justify-center lg:justify-start">
          <div className="rounded-2xl bg-white p-2.5 shadow-lg shadow-black/20">
            <BrandLogo className="w-[150px]" priority />
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          {/* Left: message + trust + WhatsApp */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Scheduled Maintenance
            </div>
            <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
              Zimbabwe&apos;s Trusted Tech Store Is Getting an Upgrade
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400 lg:mx-0">
              We&apos;re making quick improvements behind the scenes. Your order, pricing, and stock questions don&apos;t
              have to wait &mdash; reach us directly on WhatsApp and our team will help right away.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-500 sm:w-auto"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </a>
              <a
                href={`tel:+${WA_NUMBER}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 sm:w-auto"
              >
                {SITE_PHONE}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
                >
                  <svg aria-hidden="true" className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: status card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {countdown ? (
              <div className="mb-7 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Back online in approximately</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {[
                    { value: countdown.hours, label: 'hrs' },
                    { value: countdown.minutes, label: 'min' },
                    { value: countdown.seconds, label: 'sec' },
                  ].map((unit) => (
                    <div key={unit.label} className="w-16 rounded-2xl bg-white/5 py-3">
                      <p className="font-heading text-2xl font-extrabold tabular-nums text-white">
                        {String(unit.value).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{unit.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-7 text-center">
                <h2 className="text-lg font-bold text-white">We&apos;ll Be Back Shortly</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Our team is finishing up a few improvements. Thanks for your patience.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <div className="mb-1 flex items-center justify-center text-red-400">{item.icon}</div>
                  <div className="text-xs text-zinc-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              {showStaffLogin ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter access password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    />
                    <svg
                      aria-hidden="true"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                    </svg>
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      'Access Site'
                    )}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowStaffLogin(true)}
                  className="text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
                >
                  Staff sign-in
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-zinc-600 lg:text-left">
          &copy; {new Date().getFullYear()} Cansan Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
