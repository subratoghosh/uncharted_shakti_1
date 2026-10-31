'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Shield, User, ExternalLink, ShieldAlert, Bot } from 'lucide-react';
import { ShaktiqLogoIcon } from '../shared/ShaktiqLogoIcon';

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'admin';
  const isAdminRoute = pathname.startsWith('/admin');

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="h-16 border-b border-green-mid/50 bg-[#0A382C] text-butter-cream px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Breadcrumbs with Clickable Logo pointing to Homepage */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-sm sm:text-base truncate max-w-[240px] sm:max-w-none">
        <Link href="/" title="Go to Homepage" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#08261E] flex items-center justify-center p-1 border border-emerald-500/30 group-hover:border-emerald-400 transition-colors shadow-xs">
            <ShaktiqLogoIcon className="w-6 h-6" theme="dark" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight">
            <span className="text-butter-cream">shakt</span>
            <span className="text-[#52B143]">IQ</span>
          </span>
        </Link>
        {segments.map((seg, i) => (
          <React.Fragment key={seg + i}>
            <span className="text-green-sage/60 font-bold text-sm sm:text-base">/</span>
            <span className={i === segments.length - 1 ? 'font-bold text-base sm:text-lg text-butter-cream capitalize' : 'font-medium text-sm sm:text-base text-green-sage capitalize'}>
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3.5 sm:gap-5">
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

        {/* Natural Language AI Assistant Quick Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#14533F] text-butter-cream hover:bg-[#1A6B52] border border-[#52B143]/40 transition-all shadow-xs"
          title="Open Natural Language AI Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-[#52B143]" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* User Profile Pill */}
        {session?.user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-green-mid/60">
            <div className="w-9 h-9 rounded-full bg-butter-cream text-green-dark flex items-center justify-center font-black text-sm shadow-xs">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-bold text-sm sm:text-base text-butter-cream leading-tight">{session.user.name || session.user.email}</span>
              <span className="text-xs text-green-sage leading-tight">{session.user.email}</span>
            </div>
            {session.user.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-butter-cream text-green-dark border border-butter-gold uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-green-mid/70 text-text-hero-sub border border-green-light/40 uppercase">
                User
              </span>
            )}
          </div>
        )}

        {/* Logout action */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 rounded-lg hover:bg-green-mid/70 text-green-sage hover:text-butter-cream transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
