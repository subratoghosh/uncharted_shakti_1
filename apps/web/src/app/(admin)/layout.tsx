'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Topbar } from '@/components/shared/Topbar';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  // Guard: only admin role may access this layout
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.auth.me(),
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;
    if (!data?.ok || data.data.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [data, isLoading, router]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isLoading) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal
        aria-label="Admin navigation"
      >
        <div className="relative flex h-full">
          <AdminSidebar />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close sidebar"
            className="absolute -right-10 top-3 flex h-8 w-8 items-center justify-center rounded bg-[var(--surface)] text-[var(--text)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setDrawerOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg)] p-4 md:p-6">
          <div className="max-w-content mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

