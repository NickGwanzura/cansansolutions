'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComingSoonPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-red-600/10 blur-[150px]" />
        <div className="absolute -left-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-red-900/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.617A3.001 3.001 0 0 0 9 9.348m0 0a3 3 0 0 0 3 0m0 0a3.001 3.001 0 0 0 3.75.617A3.001 3.001 0 0 0 18 9.348" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cansan Solutions</h1>
          <p className="mt-2 text-zinc-400">Quality Tech & Electronics</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Launching Soon
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">We&apos;re Getting Ready</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our store is currently under construction. We&apos;re curating the best tech products for you. Check back soon!
            </p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: '📱', label: 'Mobiles & Accessories' },
              { icon: '💻', label: 'Laptops & Computing' },
              { icon: '🌐', label: 'Networking Gear' },
              { icon: '🔋', label: 'Power Solutions' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-zinc-400">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Password access */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-xs text-zinc-500 text-center mb-4">
              Team access only
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                />
                <svg 
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
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Access Site
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-zinc-600 text-xs">
            © 2025 Cansan Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
