'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isMarketingPage =
    pathname === '/' ||
    pathname === '/why-us' ||
    pathname === '/faq' ||
    pathname === '/workflow' ||
    pathname === '/intelligence';

  if (isAuthPage || isMarketingPage) {
    return <main className="min-h-screen w-full bg-butter-bg text-green-dark">{children}</main>;
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-butter-bg text-green-dark antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
