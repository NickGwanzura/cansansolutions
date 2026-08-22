'use client';

import { useState } from 'react';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) onLogin();
      else
        setError(
          res.status === 429 ? 'Too many attempts. Try again shortly.' : 'Incorrect password',
        );
    } catch {
      setError('Unable to connect. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(220,38,38,0.28),transparent_32%),radial-gradient(circle_at_86%_90%,rgba(127,29,29,0.22),transparent_34%)]"
      />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg mb-4">
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"
              />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Admin Access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Manage products, orders, customers, and storefront content.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <label
              htmlFor="admin-password"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400"
            >
              Admin password
            </label>
            <input
              id="admin-password"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
            {error && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-300">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Protected workspace · Cansan Electronics
        </p>
      </div>
    </div>
  );
}
