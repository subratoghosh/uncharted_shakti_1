'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, Layers, HelpCircle, Terminal } from 'lucide-react';

const PRIMARY_TABS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Why Us', href: '/why-us', icon: ShieldCheck },
  { label: 'Workflow', href: '/workflow', icon: Layers },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
  { label: 'Console', href: '/dashboard', icon: Terminal },
];

export const MarketingMobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-dark/95 backdrop-blur-md border-t border-butter-cream/20 py-2 px-3 text-butter-cream shadow-2xl"
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
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-butter-cream text-green-dark font-bold'
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
