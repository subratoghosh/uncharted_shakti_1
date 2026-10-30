'use client';

import { useState, useEffect } from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { Topbar } from '@/components/shared/Topbar';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden <1024 */}
      <div className="hidden lg:flex shrink-0">
        <UserSidebar />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal
        aria-label="Navigation"
      >
        <div className="relative flex h-full">
          <UserSidebar />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close sidebar"
            className="absolute -right-10 top-3 flex h-8 w-8 items-center justify-center rounded bg-[var(--surface)] text-[var(--text)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setDrawerOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg)] p-6 md:p-6 p-4">
          <div className="max-w-content mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

