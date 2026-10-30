'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
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
        className={`max-w-[1240px] mx-auto pointer-events-auto transition-all duration-300 rounded-full ${
          isScrolled
            ? 'bg-green-dark/95 backdrop-blur-md border border-butter-cream/20 shadow-lg py-2.5 px-5 text-butter-cream'
            : 'bg-green-dark/70 backdrop-blur-sm border border-white/10 py-3.5 px-6 text-butter-cream'
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-butter-cream text-green-dark shadow-xs'
                      : 'text-text-hero-sub hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-butter-cream text-green-dark font-bold text-xs hover:bg-butter-gold hover:shadow-md transition-all active:translate-y-0.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-full bg-white/10 text-butter-cream hover:bg-white/20 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-[1240px] pointer-events-auto bg-green-dark border border-butter-cream/20 rounded-3xl p-5 shadow-2xl animate-fade-in text-butter-cream">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-hero-sub hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 mt-1">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-butter-cream text-green-dark font-bold text-sm shadow-md"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Interactive Console</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
