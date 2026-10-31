'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRunStream } from '../../hooks/useRunStream';
import { LogOut, Shield, User, ExternalLink, ShieldAlert } from 'lucide-react';
import { ShaktiqLogoIcon } from '../shared/ShaktiqLogoIcon';

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { status } = useRunStream();

  const isAdmin = session?.user?.role === 'admin';
  const isAdminRoute = pathname.startsWith('/admin');

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="h-14 border-b border-green-mid/50 bg-[#0A382C] text-butter-cream px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
        <Link
          href={isAdminRoute ? '/admin/overview' : '/dashboard'}
          className="flex items-center gap-1.5 hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <ShaktiqLogoIcon className="w-5 h-5" theme="dark" />
          <span className="font-extrabold tracking-tight">
            <span className="text-butter-cream">shakt</span>
            <span className="text-[#52B143]">IQ</span>
          </span>
        </Link>
        {segments.map((seg, i) => (
          <React.Fragment key={seg + i}>
            <span className="text-green-sage/60">/</span>
            <span className={i === segments.length - 1 ? 'font-semibold text-butter-cream' : 'text-green-sage'}>
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Panel Switcher for Admins */}
        {isAdmin && (
          <div>
            {isAdminRoute ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all shadow-xs"
                title="Switch to User Workspace"
              >
                <span>User Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                href="/admin/overview"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 border border-amber-400/40 transition-all shadow-xs"
                title="Switch to Admin Console"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        )}

        {/* Live SSE Status Dot */}
        <div className="flex items-center gap-1.5 text-xs bg-green-deep/60 border border-green-light/40 px-2.5 py-1 rounded-full">
          {status === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
              <span className="text-text-hero-sub font-mono hidden sm:inline text-[11px]">Live Sync</span>
            </>
          ) : status === 'reconnecting' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-300 font-mono text-[11px]">Reconnecting...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-text-hero-sub/70 font-mono text-[11px]">Offline</span>
            </>
          )}
        </div>

        {/* User Profile Pill */}
        {session?.user && (
          <div className="flex items-center gap-2 pl-2 border-l border-green-mid/60 text-xs">
            <div className="w-7 h-7 rounded-full bg-butter-cream text-green-dark flex items-center justify-center font-bold text-xs shadow-xs">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-semibold text-butter-cream leading-tight">{session.user.name || session.user.email}</span>
              <span className="text-[10px] text-green-sage leading-tight">{session.user.email}</span>
            </div>
            {session.user.role === 'admin' ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-butter-cream text-green-dark border border-butter-gold uppercase tracking-wider">
                <Shield className="w-2.5 h-2.5" />
                Admin
              </span>
            ) : (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-mid/70 text-text-hero-sub border border-green-light/40 uppercase">
                User
              </span>
            )}
          </div>
        )}

        {/* Logout action */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded-lg hover:bg-green-mid/70 text-green-sage hover:text-butter-cream transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
