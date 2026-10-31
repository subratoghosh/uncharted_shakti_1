'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Activity,
  FolderGit2,
  GitCompare,
  KeyRound,
  LayoutDashboard,
  Shield,
  Users,
  Webhook,
  Workflow,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ShaktiqLogoIcon } from '../shared/ShaktiqLogoIcon';

const userNav = [
  { name: 'Dashboard & Studio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Access Tokens', href: '/tokens', icon: KeyRound },
];

const adminNav = [
  { name: 'Platform Overview', href: '/admin/overview', icon: Activity },
  { name: 'All Projects', href: '/admin/projects', icon: Layers },
  { name: 'All Runs', href: '/admin/runs', icon: GitCompare },
  { name: 'Events & Webhooks', href: '/admin/events', icon: Webhook },
  { name: 'Workflow Health', href: '/admin/workflows', icon: Workflow },
  { name: 'User Management', href: '/admin/users', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isCurrentAdminPath = pathname.startsWith('/admin');

  return (
    <aside className="hidden md:flex w-60 border-r border-border bg-surface flex-col h-screen sticky top-0 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <Link
          href={isCurrentAdminPath ? '/admin/overview' : '/dashboard'}
          className="flex items-center gap-2.5 font-bold tracking-tight text-lg group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0A382C] flex items-center justify-center p-1 shadow-xs border border-emerald-500/20">
            <ShaktiqLogoIcon className="w-5 h-5" theme="dark" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            <span className="text-foreground">shakt</span>
            <span className="text-[#52B143]">IQ</span>
          </span>
        </Link>
        {isCurrentAdminPath ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" />
            Admin
          </span>
        ) : (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border">
            Workspace
          </span>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {isCurrentAdminPath ? (
          /* ================= ADMIN PANEL ================= */
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin Console
              </span>
            </div>
            <nav className="space-y-1">
              {adminNav.map(item => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shadow-xs'
                        : 'text-text hover:bg-surface-2 hover:text-text'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Switch to User Workspace */}
            <div className="mt-8 pt-4 border-t border-border/80">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted px-2 mb-2">
                Developer Panel
              </div>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#0C382E]/15 bg-[#0C382E]/5 hover:bg-[#0C382E]/10 text-xs font-semibold text-[#0C382E] dark:text-emerald-300 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>User Workspace</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          /* ================= USER PANEL ================= */
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
              <span>Developer Workspace</span>
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </div>
            <nav className="space-y-1">
              {userNav.map(item => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent font-semibold border border-accent/20 shadow-xs'
                        : 'text-text hover:bg-surface-2 hover:text-text'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* If user is an admin viewing user workspace, provide one-click return to Admin Panel */}
            {isAdmin && (
              <div className="mt-8 pt-4 border-t border-border/80">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 mb-2">
                  Platform Privileges
                </div>
                <Link
                  href="/admin/overview"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-800 dark:text-amber-300 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Admin Console</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border text-xs text-muted flex items-center justify-between">
        <div className="truncate pr-2">
          <div className="truncate font-semibold text-foreground">
            {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-[10px] opacity-75 truncate">{session?.user?.email}</div>
        </div>
        {session?.user && (
          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold border ${
            session.user.role === 'admin'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
          }`}>
            {session.user.role}
          </span>
        )}
      </div>
    </aside>
  );
}
