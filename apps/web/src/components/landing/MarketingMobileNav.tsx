'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, Layers, Zap, Terminal } from 'lucide-react';

const PRIMARY_TABS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Workflow', href: '/workflow', icon: Layers },
  { label: 'Why Us', href: '/why-us', icon: ShieldCheck },
  { label: 'Intelligence', href: '/intelligence', icon: Zap },
  { label: 'Console', href: '/dashboard', icon: Terminal },
];

export const MarketingMobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0C382E]/95 backdrop-blur-md border-t border-green-light/40 py-1.5 px-3 text-butter-cream shadow-[0_-8px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {PRIMARY_TABS.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname === tab.href || pathname.startsWith(tab.href + '/');
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
