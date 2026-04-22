'use client';

import { useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';

interface AdminAuthGateProps {
  children: (ctx: { onLogout: () => void }) => React.ReactNode;
  probeUrl?: string;
}

export default function AdminAuthGate({ children, probeUrl = '/api/admin/products' }: AdminAuthGateProps) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(probeUrl)
      .then((r) => { if (!cancelled) setAuthed(r.ok); })
      .catch(() => { if (!cancelled) setAuthed(false); });
    return () => { cancelled = true; };
  }, [probeUrl]);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <>{children({ onLogout: () => setAuthed(false) })}</>;
}
