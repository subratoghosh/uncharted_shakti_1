import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Terminal, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export const metadata: Metadata = {
  title: 'Knowledge Base & FAQ | ShaktIQ - OpenAPI Release Intelligence',
  description:
    'Frequently asked questions about deterministic AST diffing, blast radius scoring, Gemini AI remediation, and CI/CD pull request gate integration.',
};

export default function FAQPage() {
  return (
    <MarketingLayout>
      <div className="flex flex-col pt-24 md:pt-28">
        {/* Main Accordion */}
        <FAQAccordion />

        {/* Still Have Questions? Banner */}
        <section className="py-20 bg-butter-panel border-t border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="p-8 md:p-12 bg-white rounded-3xl border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4">
                  <HelpCircle className="w-3.5 h-3.5 text-green-accent" />
                  STILL HAVE QUESTIONS?
                </div>
                <h3 className="display-font text-2xl sm:text-3xl font-bold text-green-dark mb-3">
                  Need custom breaking change policies for your organization?
                </h3>
                <p className="text-text-dim text-sm sm:text-base leading-relaxed">
                  Whether you manage high-throughput financial transaction APIs or multi-tenant microservice meshes, our platform engineers can help configure custom severity thresholds and automated webhook pipelines.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link href="/dashboard" className="btn-butter">
                  <Terminal className="w-4 h-4" />
                  <span>Launch Live Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/workflow" className="btn-glass">
                  <span>Explore 5-Step Workflow</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
