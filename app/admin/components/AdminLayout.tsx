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
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar onLogout={onLogout} />
      <div className="pt-14 lg:ml-60 lg:pt-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <CommandPalette />
    </div>
  );
}
