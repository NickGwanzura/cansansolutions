'use client';

import AdminSidebar from './AdminSidebar';
import CommandPalette from './CommandPalette';
import ErrorBoundary from './ErrorBoundary';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-900 selection:bg-red-100 selection:text-red-900">
      <AdminSidebar onLogout={onLogout} />
      <div className="min-w-0 pt-14 lg:ml-60 lg:pt-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <CommandPalette />
    </div>
  );
}
