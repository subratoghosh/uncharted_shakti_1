import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Network,
  Zap,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
} from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Blast Radius & Contract Intelligence | ShaktIQ',
  description:
    'Deep downstream consumer dependency mapping, explainable release scoring, and non-bypassable CI contract governance for modern API platforms.',
};

export const revalidate = 3600; // Cache static page for ultra-fast, zero-lag delivery

export default function IntelligencePage() {
  const pillars = [
    {
      icon: Network,
      title: 'Consumer Dependency Graph',
      subtitle: 'Mapping altered endpoints to registered microservice consumers',
      description:
        'When an endpoint schema changes, ShaktIQ traces consumer contracts across your organization. If an internal billing service or external iOS client relies on a modified parameter, ShaktIQ highlights the exact breaking path.',
      benefit: 'Prevents silent downstream client outages before merging',
    },
    {
      icon: Zap,
      title: 'Autonomous Patch Synthesis',
      subtitle: 'Gemini 3.8 Flash writes backward-compatible alternatives',
      description:
        'When a breaking change is flagged, ShaktIQ uses Gemini 3.8 Flash to synthesize backward-compatible alternatives: parameter deprecation wrappers, route shims, and RFC 8594 sunset schedules.',
      benefit: 'Turns blockers into immediate 1-click refactoring steps',
    },
    {
      icon: Lock,
      title: 'Zero Telemetry & Private Processing',
      subtitle: 'Schema payloads remain inside your security boundary',
      description:
        'Your proprietary API specifications and internal endpoint topologies are processed securely with enterprise data isolation. AI prompts use minimal structural diff fragments without leaking sensitive corporate payloads.',
      benefit: 'Meets SOC2, ISO 27001, and enterprise security compliance',
    },
  ];

  return (
    <MarketingLayout>
      <div className="flex flex-col pt-24 md:pt-28">
        {/* Header Hero */}
        <section className="py-16 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4 border border-green-dark/10">
              <Network className="w-3.5 h-3.5 text-green-accent" />
              CONTRACT GOVERNANCE INTELLIGENCE
            </div>
            <h1 className="font-slab text-3xl sm:text-5xl lg:text-6xl font-bold text-green-dark tracking-tight mb-4 max-w-3xl mx-auto">
              Blast radius analysis & consumer contract safety
            </h1>
            <p className="text-text-dim text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Understand the full downstream ripple effect of every API modification before committing to production.
            </p>
          </div>
        </section>

        {/* 4 Contract Intelligence Pillars */}
        <section className="py-20 bg-butter-panel border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-butter-cream flex items-center justify-center text-green-dark shadow-xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-xl text-green-dark">
                            {p.title}
                          </h3>
                          <p className="text-xs text-text-dim font-medium">{p.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-sm text-text-dim leading-relaxed mb-6">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-green-dark/8 text-xs font-semibold text-green-mid flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                      <span>{p.benefit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Action Callout */}
        <section className="py-20 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="p-8 sm:p-12 bg-white rounded-3xl border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h3 className="display-font text-2xl sm:text-3xl font-bold text-green-dark mb-2">
                  Test contract intelligence in real-time
                </h3>
                <p className="text-text-dim text-sm sm:text-base leading-relaxed">
                  Open our interactive console to compare sample base and candidate OpenAPI documents and view real-time blast radius matrices.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link href="/dashboard" className="btn-butter">
                  <Terminal className="w-4 h-4" />
                  <span>Launch Live Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/workflow" className="btn-glass">
                  <span>Explore 4-Step Workflow</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
