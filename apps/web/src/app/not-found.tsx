'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Home, Terminal, ArrowRight, Bot, Compass, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { ShaktiqBrand } from '@/components/landing/ShaktiqBrand';

export default function NotFound() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const consoleHref = session?.user?.role === 'admin' ? '/admin/overview' : '/dashboard';

  const openAiAssistant = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ai-assistant'));
    }
  };

  return (
    <div className="min-h-screen bg-[#07241C] text-[#FFFDF7] flex flex-col justify-between selection:bg-[#52B143]/30 relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#52B143]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#FFE382]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 253, 247, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <ShaktiqBrand href="/" theme="dark" size="md" />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAiAssistant}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFFDF7] text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#52B143]" />
            <span>Ask AI Assistant</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[#FFFDF7] text-xs font-semibold transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Center 404 Hero Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE382]/10 border border-[#FFE382]/30 text-[#FFE382] text-xs font-mono font-semibold uppercase tracking-wider mb-6 animate-fade-in shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FFE382]" />
            <span>Error 404 &bull; Route Contract Unresolved</span>
          </div>

          {/* Large Stylized 404 Display */}
          <div className="relative mb-6 select-none">
            <h1 className="text-8xl sm:text-9xl md:text-[13rem] font-black tracking-tighter leading-none bg-gradient-to-b from-[#FFFDF7] via-[#F6EED8] to-[#52B143]/30 bg-clip-text text-transparent drop-shadow-sm">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-2xl pointer-events-none">
              <span className="text-9xl font-black text-[#52B143]">404</span>
            </div>
          </div>

          {/* Primary Heading & Subtitle */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FFFDF7] mb-4">
            Destination Not Found in Service Registry
          </h2>
          <p className="text-sm sm:text-base text-[#FFFDF7]/70 max-w-lg mx-auto mb-10 leading-relaxed font-normal">
            The page, route handler, or contract documentation you requested does not exist or has been refactored to a new namespace.
          </p>

          {/* Interactive Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-12">
            {isLoggedIn ? (
              <Link
                href={consoleHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFE382] text-[#07241C] font-bold text-sm hover:bg-[#FCD860] hover:shadow-[0_0_24px_rgba(255,227,130,0.4)] transition-all active:scale-[0.98] shadow-md"
              >
                <Terminal className="w-4 h-4" />
                <span>Go to Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFE382] text-[#07241C] font-bold text-sm hover:bg-[#FCD860] hover:shadow-[0_0_24px_rgba(255,227,130,0.4)] transition-all active:scale-[0.98] shadow-md"
              >
                <Terminal className="w-4 h-4" />
                <span>Login to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFFDF7] font-semibold text-sm transition-all active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={openAiAssistant}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#52B143]/20 hover:bg-[#52B143]/30 border border-[#52B143]/40 text-[#52B143] font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#52B143]" />
              <span>Ask AI Guide</span>
            </button>
          </div>

          {/* Quick Route Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left pt-6 border-t border-white/10">
            <Link
              href="/workflow"
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#52B143]/50 transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFE382] mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Workflow</span>
              </div>
              <p className="text-[11px] text-[#FFFDF7]/60 group-hover:text-[#FFFDF7]/90 transition-colors">
                Explore our 4-step automated verification process.
              </p>
            </Link>

            <Link
              href="/why-us"
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#52B143]/50 transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFE382] mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Why Us</span>
              </div>
              <p className="text-[11px] text-[#FFFDF7]/60 group-hover:text-[#FFFDF7]/90 transition-colors">
                Learn how shaktIQ prevents downtime in production.
              </p>
            </Link>

            <Link
              href="/faq"
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#52B143]/50 transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFE382] mb-1">
                <Bot className="w-3.5 h-3.5" />
                <span>Platform FAQ</span>
              </div>
              <p className="text-[11px] text-[#FFFDF7]/60 group-hover:text-[#FFFDF7]/90 transition-colors">
                Answers to common questions about release safety.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-20 py-6 px-6 text-center text-xs text-[#FFFDF7]/50 border-t border-white/10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>&copy; {new Date().getFullYear()} shaktIQ Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-[#FFFDF7] transition-colors">
            Privacy Policy
          </Link>
          <span className="text-white/20">&bull;</span>
          <Link href="/terms" className="hover:text-[#FFFDF7] transition-colors">
            Terms of Service
          </Link>
          <span className="text-white/20">&bull;</span>
          <Link href="/faq" className="hover:text-[#FFFDF7] transition-colors">
            Help Center
          </Link>
        </div>
      </footer>
    </div>
  );
}
