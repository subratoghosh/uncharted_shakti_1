import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MarketingMobileNav } from './MarketingMobileNav';

export const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-butter-bg text-green-dark flex flex-col pb-[80px] md:pb-0 font-sans selection:bg-butter-cream selection:text-green-dark">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MarketingMobileNav />
    </div>
  );
};
