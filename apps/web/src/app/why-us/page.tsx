import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Terminal,
  ArrowRight,
  GitBranch,
  Layers,
  Network,
  FileCheck2,
  AlertTriangle,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Why Us | shaktIQ - Deterministic OpenAPI Governance & Release Intelligence',
  description:
    'Learn how shaktIQ prevents breaking downstream API consumers, eliminates false alarms with deterministic AST diffing, and automates non-breaking patches with Gemini AI.',
};

export default function WhyUsPage() {
  const securityFeatures = [
    {
      icon: GitBranch,
      title: 'Deterministic AST Semantic Engine',
      subtitle: 'Abstract Syntax Tree comparison across endpoints, types, and constraints',
      description:
        'Line-by-line git diffs and regex linters trigger false alarms on reordered keys or formatting changes. shaktIQ parses both base and candidate OpenAPI documents into formal Abstract Syntax Trees, comparing types, default values, validations, and response schemas with mathematical certainty.',
      bullets: [
        'Full support for OpenAPI 3.0.x, 3.1.x, and Swagger 2.0 (YAML & JSON)',
        'Resolves nested $ref pointers, polymorphs (oneOf, anyOf), and complex schemas',
        'Sub-50ms execution time inside high-frequency CI pipelines',
      ],
    },
    {
      icon: Network,
      title: 'Blast Radius & Downstream Consumer Matrix',
      subtitle: 'Measure true downstream consumer breakage before code merges',
      description:
        'API schemas don’t live in a vacuum. A changed query parameter on a payment endpoint might silently break native iOS apps, merchant checkout integrations, or microservice listeners. shaktIQ maps every altered endpoint to registered consumers to calculate objective blast radius severity.',
      bullets: [
        'Categorizes impact across Core Microservices, Mobile Apps, and Public SDKs',
        'Automatic severity classification: BREAKING, WARNING, and INFO',
        'Prevents unexpected outages and customer-facing integration churn',
      ],
    },
    {
      icon: Cpu,
      title: 'Autonomous Gemini 3.8 Flash Remediation',
      subtitle: 'AI that writes production-grade backward-compatible schema patches',
      description:
        'Detecting a breaking change is only half the battle. shaktIQ harnesses Gemini 3.8 Flash to synthesize a complete Release Dossier containing root-cause analysis, deprecation roadmaps, and copy-paste ready non-breaking patches in milliseconds.',
      bullets: [
        'Instant backward-compatible shim generation and route alias code',
        'Deprecation tagging with Sunset and Link headers per IETF RFC 8594',
        'Structured executive impact briefings for API review committees',
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Strict Non-Bypassable CI/CD Release Gate',
      subtitle: 'Enforce SAFE, REVIEW, or BLOCKED release verdicts automatically',
      description:
        'Eliminate human oversight from your API release process. shaktIQ integrates into GitHub Actions, GitLab CI, and custom webhooks to evaluate schema pull requests against your organizational breaking change policy.',
      bullets: [
        'Calculates objective 0-100 release confidence score per run',
        'Blocks pull requests automatically when critical breaking changes exist',
        'Supports manual security override workflows with tamper-evident audit trails',
      ],
    },
  ];

  const comparisonItems = [
    {
      feature: 'Diff Technique',
      shaktiq: 'Deterministic AST node & semantic type parsing',
      traditional: 'Naive line diffing or regex keyword matching',
      manual: 'Manual eye-balling of 1,000+ line PR diffs',
    },
    {
      feature: 'Downstream Blast Radius',
      shaktiq: 'Automated consumer dependency impact matrix',
      traditional: 'Zero consumer context; flags changes in isolation',
      manual: 'Ad-hoc Slack messages asking "who uses this?"',
    },
    {
      feature: 'Remediation & Fixes',
      shaktiq: 'Gemini 3.8 Flash generates non-breaking code patches',
      traditional: 'Raw error list with zero remediation advice',
      manual: 'Days of architect debates over v2 migration strategy',
    },
    {
      feature: 'CI/CD Gate & Status',
      shaktiq: 'Cryptographic SAFE / REVIEW / BLOCKED verdict',
      traditional: 'Exit code 1 without explainable policy score',
      manual: 'Rubber-stamp PR approvals that break production',
    },
    {
      feature: 'Performance & Speed',
      shaktiq: 'Sub-50ms engine with instant sandbox playground',
      traditional: 'Heavy Java CLI tools that slow down pipelines',
      manual: 'Days or weeks waiting for API council approval',
    },
  ];

  return (
    <MarketingLayout>
      <div className="flex flex-col pt-24 md:pt-28">
        {/* Header Hero */}
        <section className="py-16 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4 border border-green-dark/10">
              <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
              ENGINEERING RELIABILITY SPECIFICATION
            </div>
            <h1 className="font-slab text-3xl sm:text-5xl lg:text-6xl font-bold text-green-dark tracking-tight mb-4 max-w-3xl mx-auto">
              Why leading platform teams standardize on <span>shakt<span className="text-[#52B143]">IQ</span></span>
            </h1>
            <p className="text-text-dim text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Eliminate breaking API changes before they reach staging, protect downstream consumer contracts, and accelerate release cycles with deterministic AST intelligence.
            </p>
          </div>
        </section>

        {/* 4 Deep Security & Reliability Pillars */}
        <section className="py-20 bg-butter-panel border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feat, idx) => {
                const Icon = feat.icon;
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
                            {feat.title}
                          </h3>
                          <p className="text-xs text-text-dim font-medium">{feat.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-sm text-text-dim leading-relaxed mb-6">
                        {feat.description}
                      </p>
                    </div>

                    <div className="border-t border-green-dark/8 pt-4">
                      <h4 className="text-xs font-bold text-green-dark uppercase tracking-wider mb-3">
                        Key Capabilities
                      </h4>
                      <ul className="space-y-2">
                        {feat.bullets.map((b, bIdx) => (
                          <li
                            key={bIdx}
                            className="flex items-start gap-2 text-xs text-text-muted leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Matrix Table */}
        <section className="py-20 bg-butter-bg border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="heading-font text-3xl font-bold text-green-dark mb-3">
                How <span>shakt<span className="text-[#52B143]">IQ</span></span> compares
              </h2>
              <p className="text-text-dim text-sm sm:text-base">
                A technical comparison against traditional linters and manual code reviews.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-green-dark/12 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-green-dark/10 bg-butter-warm/40">
                      <th className="p-5 font-bold text-green-dark text-xs uppercase tracking-wider">
                        Feature Dimension
                      </th>
                      <th className="p-5 font-bold text-green-dark text-xs uppercase tracking-wider bg-butter-cream/60">
                        shaktIQ Intelligence
                      </th>
                      <th className="p-5 font-bold text-text-dim text-xs uppercase tracking-wider">
                        Traditional Linters (oasdiff)
                      </th>
                      <th className="p-5 font-bold text-text-dim text-xs uppercase tracking-wider">
                        Manual PR Reviews
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-dark/8">
                    {comparisonItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-butter-panel/30 transition-colors">
                        <td className="p-5 font-bold text-green-dark text-sm">{item.feature}</td>
                        <td className="p-5 font-semibold text-green-mid bg-butter-cream/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                            <span>{item.shaktiq}</span>
                          </div>
                        </td>
                        <td className="p-5 text-text-dim text-xs">{item.traditional}</td>
                        <td className="p-5 text-text-dim text-xs">{item.manual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Action Callout */}
        <section className="py-20 bg-butter-panel border-b border-green-dark/10">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="p-8 sm:p-12 bg-white rounded-3xl border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-3">
                  <Terminal className="w-3.5 h-3.5 text-green-accent" />
                  TRY IT IN YOUR BROWSER
                </div>
                <h3 className="display-font text-2xl sm:text-3xl font-bold text-green-dark mb-2">
                  Test your OpenAPI specs in the live sandbox
                </h3>
                <p className="text-text-dim text-sm sm:text-base leading-relaxed">
                  No installation or API credentials required. Paste base and head specs or choose from our built-in production samples to inspect AST diffs in real-time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link href="/dashboard" className="btn-butter">
                  <Terminal className="w-4 h-4" />
                  <span>Launch Live Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/faq" className="btn-glass">
                  <span>Knowledge Base</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
