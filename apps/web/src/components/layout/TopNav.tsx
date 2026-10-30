'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRunStream } from '../../hooks/useRunStream';
import { LogOut, Shield, User } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { status } = useRunStream();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
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

        {/* User Profile Pill */}
        {session?.user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border text-xs">
            <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[11px]">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-semibold text-text leading-tight">{session.user.name || session.user.email}</span>
              <span className="text-[10px] text-muted leading-tight">{session.user.email}</span>
            </div>
            {session.user.role === 'admin' ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                <Shield className="w-2.5 h-2.5" />
                Admin
              </span>
            ) : (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border uppercase">
                User
              </span>
            )}
          </div>
        )}

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
