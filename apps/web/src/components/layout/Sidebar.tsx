'use client';

import React, { useState } from 'react';
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
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Pin,
  PinOff,
  Bot,
} from 'lucide-react';
import { ShaktiqLogoIcon } from '../shared/ShaktiqLogoIcon';

const userNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
  { name: 'FAQ Management', href: '/admin/faqs', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isCurrentAdminPath = pathname.startsWith('/admin');

  // Hover to expand / Collapsible state to save window space
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isPinned || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 select-none z-40 bg-butter-panel border-r border-green-dark/12 transition-all duration-300 ease-in-out shadow-xs ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
    >
      {/* Brand Header with Clickable Logo to Homepage */}
      <div className="h-16 border-b border-green-dark/12 flex items-center justify-between px-3">
        <Link
          href="/"
          title="shaktIQ Homepage"
          className="flex items-center gap-2.5 font-bold tracking-tight text-lg group overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-[#08261E] flex items-center justify-center p-1.5 shadow-xs border border-emerald-500/30 group-hover:border-emerald-400 transition-colors flex-shrink-0">
            <ShaktiqLogoIcon className="w-6 h-6" theme="dark" />
          </div>
          {isExpanded && (
            <span className="font-black text-xl tracking-tight text-green-dark transition-opacity duration-200">
              <span>shakt</span>
              <span className="text-[#16A34A]">IQ</span>
            </span>
          )}
        </Link>

        {isExpanded && (
          <div className="flex items-center gap-1">
            {isCurrentAdminPath ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                Admin
              </span>
            ) : (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-butter-warm text-green-dark border border-green-dark/15">
                Workspace
              </span>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin Sidebar (Hover to Reveal)' : 'Pin Sidebar Expanded'}
              className="p-1 rounded-md text-text-muted hover:text-green-dark hover:bg-butter-warm transition-colors"
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 overflow-x-hidden">
        {isCurrentAdminPath ? (
          /* ================= ADMIN CONSOLE PANEL ================= */
          <div>
            {isExpanded && (
              <div className="flex items-center justify-between px-2.5 mb-2">
                <span className="text-[11px] font-bold text-green-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Admin Console
                </span>
              </div>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isExpanded ? item.name : undefined}
                    prefetch={true}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-green-dark text-butter-cream font-bold shadow-xs'
                        : 'text-green-dark hover:bg-butter-warm hover:text-green-dark font-medium'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-butter-gold' : 'text-green-mid'}`} />
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Switch to User Workspace */}
            {isExpanded && (
              <div className="mt-8 pt-4 border-t border-green-dark/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-green-mid px-2 mb-2">
                  Developer Panel
                </div>
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-green-dark/15 bg-white hover:bg-butter-warm text-xs font-bold text-green-dark transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>User Workspace</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* ================= USER WORKSPACE PANEL ================= */
          <div>
            {isExpanded && (
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2.5 mb-2">
                Workspace
              </div>
            )}
            <nav className="space-y-1">
              {userNav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isExpanded ? item.name : undefined}
                    prefetch={true}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-green-dark text-butter-cream font-bold shadow-xs'
                        : 'text-green-dark hover:bg-butter-warm hover:text-green-dark font-medium'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-butter-gold' : 'text-green-mid'}`} />
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
                title={!isExpanded ? 'Natural Language AI Assistant' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all text-green-dark hover:bg-butter-warm font-medium ${
                  !isExpanded ? 'justify-center px-0' : ''
                }`}
              >
                <Bot className="w-4 h-4 flex-shrink-0 text-[#16A34A]" />
                {isExpanded && <span className="truncate">AI Assistant</span>}
              </button>
            </nav>

            {/* If admin is viewing user workspace, provide clear button to switch to Admin Console */}
            {isAdmin && isExpanded && (
              <div className="mt-8 pt-4 border-t border-green-dark/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-green-mid px-2 mb-2">
                  Platform Privileges
                </div>
                <Link
                  href="/admin/overview"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100/70 text-xs font-bold text-emerald-900 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span>Admin Console</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
