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
  Lock,
} from 'lucide-react';

const userNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Access Tokens', href: '/tokens', icon: KeyRound },
];

const adminNav = [
  { name: 'Platform Overview', href: '/admin/overview', icon: Activity },
  { name: 'All Projects', href: '/admin/projects', icon: FolderGit2 },
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
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg tracking-tight"
        >
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
          <span>ShaktIQ</span>
        </Link>
        {isCurrentAdminPath || isAdmin ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            Admin
          </span>
        ) : (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border">
            v1.0
          </span>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider px-2 mb-2">
            Workspace
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
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-sm transition-colors ${
                    active
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text hover:bg-surface-2 hover:text-text'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Administration
            </span>
            <Shield className="w-3 h-3 text-muted" />
          </div>
          <nav className="space-y-1">
            {adminNav.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={isAdmin ? item.href : '/dashboard?error=AdminRequired'}
                  prefetch={true}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm text-sm transition-colors ${
                    active
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-text hover:bg-surface-2 hover:text-text'
                  } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </div>
                  {!isAdmin && <Lock className="w-3 h-3 text-muted" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border text-xs text-muted flex items-center justify-between">
        <div>
          <div>Track 3: Developer Tools</div>
          <div className="text-[10px] opacity-75">MongoDB Hackathon</div>
        </div>
        {session?.user && (
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-surface-2 border border-border">
            {session.user.role}
          </span>
        )}
      </div>
    </aside>
  );
}
