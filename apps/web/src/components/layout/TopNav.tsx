'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRunStream } from '../../hooks/useRunStream';
import { apiClient } from '../../lib/api-client';
import { LogOut } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useRunStream();

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error during logout
    }
    router.push('/login');
  };

  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">ShaktIQ</span>
        {segments.map((seg, i) => (
          <React.Fragment key={seg + i}>
            <span className="text-muted/60">/</span>
            <span className={i === segments.length - 1 ? 'font-medium text-text' : 'text-muted'}>
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Live SSE Status Dot */}
        <div className="flex items-center gap-1.5 text-xs">
          {status === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
              <span className="text-muted hidden sm:inline">Live Sync</span>
            </>
          ) : status === 'reconnecting' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-600 dark:text-amber-400 text-xs">Reconnecting...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-muted text-xs">Offline</span>
            </>
          )}
        </div>

        {/* Logout action */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-text transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
