'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, ArrowRight, Terminal, Bot, LogIn, UserCheck } from 'lucide-react';
import { ShaktiqBrand } from './ShaktiqBrand';

const NAV_ITEMS = [
  { name: 'Workflow', href: '/workflow' },
  { name: 'Why Us', href: '/why-us' },
  { name: 'Intelligence', href: '/intelligence' },
  { name: 'FAQ', href: '/faq' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const consoleHref = session?.user?.role === 'admin' ? '/admin/overview' : '/dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      <div
        className={`max-w-[1240px] mx-auto pointer-events-auto transition-all duration-300 rounded-full border ${
          isScrolled
            ? 'bg-[#0A382C]/95 backdrop-blur-md border-green-light/60 shadow-[0_12px_36px_rgba(8,38,30,0.5)] py-2.5 px-5 text-butter-cream'
            : 'bg-[#0E4436]/90 backdrop-blur-md border-green-light/40 shadow-[0_8px_28px_rgba(8,38,30,0.35)] py-3.5 px-6 text-butter-cream'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <ShaktiqBrand href="/" theme="dark" size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-butter-cream text-green-dark shadow-sm font-bold'
                      : 'text-text-hero-sub hover:text-white hover:bg-green-mid/70 hover:shadow-xs'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-white/10 text-butter-cream font-bold text-xs border border-white/20 hover:bg-white/20 hover:border-[#52B143]/50 transition-all shrink-0 cursor-pointer"
              title="Open Natural Language AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-[#52B143]" />
              <span>AI Assistant</span>
            </button>

            {isLoggedIn ? (
              <Link
                href={consoleHref}
                prefetch={true}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-butter-cream text-green-dark font-bold text-xs hover:bg-butter-gold hover:shadow-[0_0_20px_rgba(255,240,179,0.35)] transition-all active:translate-y-0.5 shrink-0"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Go to Console</span>
                <span className="xs:hidden sm:hidden">Console</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                href="/login"
                prefetch={true}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full bg-butter-cream text-green-dark font-bold text-xs hover:bg-butter-gold hover:shadow-[0_0_20px_rgba(255,240,179,0.35)] transition-all active:translate-y-0.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-full bg-green-mid/70 text-butter-cream border border-green-light/40 hover:bg-green-light/40 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-[1240px] pointer-events-auto bg-[#0A382C] border border-green-light/50 rounded-3xl p-5 shadow-2xl animate-fade-in text-butter-cream">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-hero-sub hover:text-white hover:bg-green-mid/60 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-green-mid/60 mt-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/10 text-butter-cream font-bold text-xs border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Bot className="w-4 h-4 text-[#52B143]" />
                <span>Open Natural Language AI Assistant</span>
              </button>

              {isLoggedIn ? (
                <Link
                  href={consoleHref}
                  prefetch={true}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-butter-cream text-green-dark font-bold text-sm shadow-md hover:bg-butter-gold transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Go to Console</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    prefetch={true}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-butter-cream text-green-dark font-bold text-sm shadow-md hover:bg-butter-gold transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    prefetch={true}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/10 text-butter-cream font-bold text-xs border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
