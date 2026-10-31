import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Workflow,
  GitBranch,
  Layers,
  Network,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Zap,
  Lock,
} from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Workflow Engine | ShaktIQ - 4 Disciplined Steps to Zero Breaking Changes',
  description:
    'Discover ShaktIQ’s 4-step release intelligence lifecycle: from git push schema ingestion to blast radius calculation, Gemini AI remediation, and non-bypassable release gates.',
};

export const revalidate = 3600; // Cache static page for ultra-fast, zero-lag delivery

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Automated Schema Ingestion',
    subtitle: 'GitHub Webhooks, GitLab CI, or Direct CLI Spec Upload',
    description:
      'Whenever a developer creates a commit or opens a pull request modifying an OpenAPI specification file (.yaml or .json), ShaktIQ triggers instantaneously via webhook or pre-commit hook.',
    badge: 'Step 1: Ingestion',
  },
  {
    step: '02',
    title: 'Blast Radius & Consumer Matrix',
    subtitle: 'Downstream dependency mapping and impact evaluation',
    description:
      'Modified endpoints are mapped against registered consumers. ShaktIQ determines if breaking changes touch core payment gateways, internal microservices, or public mobile SDKs.',
    badge: 'Step 2: Impact Analysis',
  },
  {
    step: '03',
    title: 'Autonomous Gemini AI Remediation',
    subtitle: 'Gemini 3.8 Flash synthesizes backward-compatible patches',
    description:
      'Rather than stopping at error alerts, ShaktIQ automatically generates non-breaking shims, deprecation headers with RFC 8594 sunset schedules, and sample migration route code.',
    badge: 'Step 3: AI Synthesis',
  },
  {
    step: '04',
    title: 'Non-Bypassable Release Gate',
    subtitle: 'Cryptographic SAFE / REVIEW / BLOCKED verdict',
    description:
      'The pull request is tagged with an explainable 0-100 release score. If critical breaking changes remain unmitigated, CI status checks prevent merging until remediated.',
    badge: 'Step 4: Release Gate',
  },
];

export default function WorkflowPage() {
  return (
    <MarketingLayout>
      <div className="flex flex-col pt-24 md:pt-28">
        {/* Header Hero */}
        <section className="py-16 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4 border border-green-dark/10">
              <Workflow className="w-3.5 h-3.5 text-green-accent" />
              THE 4-STEP LIFECYCLE
            </div>
            <h1 className="font-slab text-3xl sm:text-5xl lg:text-6xl font-bold text-green-dark tracking-tight mb-4 max-w-3xl mx-auto">
              From git push to verified release in 4 disciplined steps
            </h1>
            <p className="text-text-dim text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              How platform engineering teams achieve continuous API backward compatibility without bottlenecking product velocity.
            </p>
          </div>
        </section>

        {/* 5 Steps Interactive Flow */}
        <section className="py-20 bg-butter-panel border-b border-green-dark/10">
          <div className="max-w-[1000px] mx-auto px-6 space-y-8">
            {WORKFLOW_STEPS.map((s, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col sm:flex-row items-start gap-6 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-butter-cream text-green-dark font-mono font-bold text-xl flex items-center justify-center shrink-0 group-hover:bg-butter-gold group-hover:scale-105 transition-all shadow-xs">
                  {s.step}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-dark/5 text-green-dark font-mono">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-2xl text-green-dark mb-1 group-hover:text-green-mid transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold text-text-dim mb-3">{s.subtitle}</p>
                  <p className="text-sm text-text-dim leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Engineering Teams Ship 3x Faster */}
        <section className="py-20 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="heading-font text-3xl font-bold text-green-dark mb-3">
                Why engineering teams ship 3x faster with ShaktIQ
              </h2>
              <p className="text-text-dim text-sm sm:text-base">
                Eliminating manual API review bureaucracy while preventing catastrophic downstream contract drift.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-butter-cream flex items-center justify-center text-green-dark mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="heading-font font-bold text-xl text-green-dark mb-3">
                    Instant Feedback Loops
                  </h3>
                  <p className="text-text-dim text-sm leading-relaxed mb-6">
                    Developers get breaking change warnings inside their pull request comments within seconds of pushing, complete with exact line references and parameter names.
                  </p>
                </div>
                <div className="pt-4 border-t border-green-dark/8 text-xs font-semibold text-green-mid flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent" />
                  <span>Sub-50ms AST diff turnaround</span>
                </div>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-green-hero/10 flex items-center justify-center text-green-hero mb-6">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="heading-font font-bold text-xl text-green-dark mb-3">
                    Remediation Autopilot
                  </h3>
                  <p className="text-text-dim text-sm leading-relaxed mb-6">
                    No need to guess how to refactor. Gemini 3.8 Flash synthesizes backward-compatible alternatives, showing developers exactly how to support legacy consumers without stalling new features.
                  </p>
                </div>
                <div className="pt-4 border-t border-green-dark/8 text-xs font-semibold text-green-mid flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent" />
                  <span>Copy-paste ready patch code</span>
                </div>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-butter-gold/40 flex items-center justify-center text-green-dark mb-6">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="heading-font font-bold text-xl text-green-dark mb-3">
                    Audit-Ready History
                  </h3>
                  <p className="text-text-dim text-sm leading-relaxed mb-6">
                    Every evaluated run, comparison verdict, and policy override is permanently persisted with commit SHAs and author metadata for compliance governance.
                  </p>
                </div>
                <div className="pt-4 border-t border-green-dark/8 text-xs font-semibold text-green-mid flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent" />
                  <span>Complete historical diff audit log</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-butter-panel border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="p-8 sm:p-12 bg-white rounded-3xl border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h3 className="display-font text-2xl sm:text-3xl font-bold text-green-dark mb-2">
                  Experience the 4-step workflow in action
                </h3>
                <p className="text-text-dim text-sm sm:text-base leading-relaxed">
                  Open the interactive console to test sample base and head OpenAPI documents, inspect breaking change detections, and review AI-generated release dossiers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link href="/dashboard" className="btn-butter">
                  <Terminal className="w-4 h-4" />
                  <span>Launch Live Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/why-us" className="btn-glass">
                  <span>Explore Security Specs</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
