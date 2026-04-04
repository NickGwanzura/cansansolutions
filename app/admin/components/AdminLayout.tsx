'use client';

import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar onLogout={onLogout} />
      <div className="ml-60">
        {children}
      </div>
    </div>
  );
}
