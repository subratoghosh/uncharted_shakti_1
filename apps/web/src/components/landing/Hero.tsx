'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Network,
  GitBranch,
  Zap,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const capabilities = [
    {
      icon: GitBranch,
      title: 'Continuous Contract Ingestion',
      description: 'Intercepts contract and code modifications via GitHub Webhooks, CLI, or CI pre-commit hooks.',
      tag: 'Real-Time Ingestion',
    },
    {
      icon: Network,
      title: 'Downstream Client Impact Matrix',
      description: 'Maps altered endpoints and logic against registered consumers to pinpoint mobile app and web service impact.',
      tag: 'Impact Matrix',
    },
    {
      icon: Cpu,
      title: 'Automated Patch Remediation',
      description: 'Synthesizes non-breaking backwards-compatible shims, parameter deprecation wrappers, and migration code.',
      tag: 'Intelligent Engine',
    },
    {
      icon: ShieldCheck,
      title: 'Non-Bypassable Release Gates',
      description: 'Blocks breaking PRs with cryptographic SAFE, REVIEW, or BLOCKED status and comprehensive confidence scoring.',
      tag: 'Policy Enforcement',
    },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0C382E] text-butter-cream overflow-hidden">
      {/* Background radial gradients for ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-green-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-butter-cream/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* LEFT COLUMN: Hero Copy & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark border border-green-light/40 text-xs font-mono text-butter-cream mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
              <span>CONTINUOUS RELEASE GOVERNANCE & SAFETY PLATFORM</span>
            </div>

            {/* Headline in SponFy slab-serif style */}
            <h1 className="font-slab text-[2.75rem] sm:text-7xl lg:text-[76px] leading-[1.04] font-light text-butter-cream tracking-tight mb-6">
              <span>Software releases</span>
              <br />
              <span className="relative inline-block text-butter-cream font-light">
                worth trusting
                {/* Paper Plane flight accent */}
                <span className="absolute -top-3 left-[210px] sm:left-[320px] pointer-events-none select-none animate-plane-hero-loop z-20 hidden sm:inline-block">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 68 68"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
                  >
                    <path
                      d="M10 34L58 14L40 54L30 38L10 34Z"
                      fill="#FFF0B3"
                      stroke="#0C382E"
                      strokeWidth="2"
                    />
                    <path d="M58 14L30 38" stroke="#0C382E" strokeWidth="2" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-text-hero-sub text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-normal">
              Deterministic breaking change prevention, downstream client impact assessment, and
              automated patch remediation dossiers. Zero unverified code breaks shipped to production.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link href="/dashboard" className="btn-butter">
                <Terminal className="w-4 h-4" />
                <span>Launch Live Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/workflow" className="btn-hero-ghost">
                <Layers className="w-4 h-4" />
                <span>Explore 4-Step Workflow</span>
              </Link>
            </div>

            {/* Social Proof / Capability Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-butter-cream/15 w-full text-xs text-text-hero-sub/90">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                <span>Deterministic Semantic Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                <span>Automated Patch Remediation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                <span>Automated Pull Request Safeguards</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: White Product Information & Architecture Panel */}
          <div className="lg:col-span-6 w-full">
            <div className="w-full bg-white text-[#0C382E] rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_24px_60px_rgba(0,0,0,0.28)] relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#0C382E]/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0C382E] text-butter-cream flex items-center justify-center font-bold shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-butter-cream" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#0C382E] tracking-tight">
                      ShaktIQ Platform Architecture
                    </h3>
                    <p className="text-[11px] text-[#0C382E]/70 font-mono">
                      Continuous Release Governance & Reliability Engine
                    </p>
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C382E]/5 border border-[#0C382E]/15 text-[10px] font-mono text-[#0C382E] font-semibold">
                  <Zap className="w-3 h-3 text-green-accent" />
                  <span>Real-Time Audit Velocity</span>
                </div>
              </div>

              {/* Product Capabilities List */}
              <div className="space-y-3">
                {capabilities.map((c, idx) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF5E9] border border-[#0C382E]/10 hover:border-[#0C382E]/30 hover:bg-[#F6EED8] transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#0C382E]/15 text-[#0C382E] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#0C382E] group-hover:text-butter-cream transition-colors shadow-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-xs text-[#0C382E] truncate">
                              {c.title}
                            </h4>
                            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0C382E]/10 text-[#0C382E] border border-[#0C382E]/15 shrink-0">
                              {c.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#0C382E]/80 leading-relaxed">
                            {c.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
