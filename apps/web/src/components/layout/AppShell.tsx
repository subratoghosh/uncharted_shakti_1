'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ConsoleMobileNav } from './ConsoleMobileNav';
import { PullToRefresh } from '../common/PullToRefresh';
import { AskAiAssistant } from '../shared/AskAiAssistant';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isMarketingPage =
    pathname === '/' ||
    pathname === '/why-us' ||
    pathname === '/faq' ||
    pathname === '/workflow' ||
    pathname === '/intelligence' ||
    pathname === '/privacy' ||
    pathname === '/terms';

  if (isAuthPage) {
    return (
      <PullToRefresh>
        <main className="min-h-screen w-full bg-butter-bg text-green-dark">{children}</main>
      </PullToRefresh>
    );
  }

  if (isMarketingPage) {
    return (
      <PullToRefresh>
        <main className="min-h-screen w-full bg-butter-bg text-green-dark">{children}</main>
        <AskAiAssistant />
      </PullToRefresh>
    );
  }

  return (
    <PullToRefresh>
      <div className="flex flex-row w-full min-h-screen bg-butter-bg text-green-dark antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <TopNav />
          <main className="flex-1 p-3 sm:p-5 w-full mx-auto max-w-[1750px]">{children}</main>
          <ConsoleMobileNav />
        </div>
      </div>
      <AskAiAssistant />
    </PullToRefresh>
  );
}
