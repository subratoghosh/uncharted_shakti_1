import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldCheck, ArrowRight } from 'lucide-react';

export const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="p-8 md:p-14 bg-green-hero text-butter-cream rounded-3xl border border-butter-cream/20 shadow-hero-card flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-butter-cream/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-butter-cream/10 border border-butter-cream/20 text-butter-cream text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
              READY FOR PRODUCTION SAFETY
            </div>
            <h3 className="display-font text-3xl sm:text-4xl font-bold text-butter-cream mb-4 tracking-tight">
              Zero breaking changes shipped to production.
            </h3>
            <p className="text-text-hero-sub text-sm sm:text-base leading-relaxed">
              Connect your OpenAPI repository or paste base and candidate schemas directly into our live sandbox. Instant AST diffing, blast radius matrix, and Gemini AI release dossiers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 relative z-10 w-full sm:w-auto">
            <Link href="/dashboard" className="btn-butter">
              <Terminal className="w-4 h-4" />
              <span>Launch Live Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/workflow" className="btn-hero-ghost">
              <span>Explore 4-Step Workflow</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
