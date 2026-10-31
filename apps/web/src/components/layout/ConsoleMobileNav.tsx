'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, FolderGit2, KeyRound, ShieldAlert } from 'lucide-react';

export const ConsoleMobileNav: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const items = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Tokens', href: '/tokens', icon: KeyRound },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin/overview', icon: ShieldAlert }] : []),
  ];

  return (
    <nav
      aria-label="Console Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C382E]/95 backdrop-blur-lg border-t border-green-light/40 py-1.5 px-3 text-butter-cream shadow-[0_-8px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-150 min-h-[44px] ${
                isActive
                  ? 'bg-butter-cream text-green-dark font-bold shadow-xs scale-105'
                  : 'text-text-hero-sub/80 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

