import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Database, ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | ShaktIQ - OpenAPI Release Intelligence',
  description:
    'Learn how ShaktIQ protects your OpenAPI specifications, git repositories, and schema payload data with zero telemetry leakage and strict tenant isolation.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 31, 2026';

  return (
    <MarketingLayout>
      <div className="pt-28 pb-20 bg-butter-bg text-green-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark text-butter-cream text-xs font-mono font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
              <span>Security & Data Governance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-slab font-bold tracking-tight text-green-dark">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-green-dark/75 max-w-2xl mx-auto leading-relaxed">
              ShaktIQ is engineered for mission-critical platform teams. We treat your OpenAPI specifications, API routes, and schema contracts with zero-trust architecture.
            </p>
            <p className="text-xs text-green-dark/60 font-mono">Last revised: {lastUpdated}</p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 bg-white/80 backdrop-blur-sm border border-green-dark/15 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Section 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  01
                </div>
                <h2>Information We Process</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                ShaktIQ collects and processes only the information required to execute deterministic OpenAPI breaking change detection, blast radius assessment, and release intelligence:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-green-dark/80">
                <li>
                  <strong className="text-green-dark">OpenAPI Specifications:</strong> YAML and JSON documents describing your HTTP APIs and endpoints submitted via GitHub Webhooks, CLI, or direct upload.
                </li>
                <li>
                  <strong className="text-green-dark">Account Credentials:</strong> Name, work email address, and hashed passwords (using argon2/scrypt with salt) or OAuth provider profile tokens.
                </li>
                <li>
                  <strong className="text-green-dark">Analysis Metadata:</strong> Git commit SHAs, pull request numbers, repository URLs, change fingerprints, and diff verdicts (SAFE / REVIEW / BLOCKED).
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  02
                </div>
                <h2>Zero Telemetry & Code Privacy Guarantee</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                We believe your internal API schemas are proprietary intellectual property:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-butter-bg border border-green-dark/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-dark mb-1">
                    <Lock className="w-3.5 h-3.5 text-green-accent" />
                    <span>No Third-Party Telemetry</span>
                  </div>
                  <p className="text-xs text-green-dark/70">
                    We do not inject third-party trackers, ad cookies, or cross-site tracking scripts.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-butter-bg border border-green-dark/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-dark mb-1">
                    <Database className="w-3.5 h-3.5 text-green-accent" />
                    <span>Isolated AST Execution</span>
                  </div>
                  <p className="text-xs text-green-dark/70">
                    AST semantic diffing executes in transient sandbox environments and is never shared across tenants.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  03
                </div>
                <h2>AI Processing & Gemini Intelligence</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                When AI release dossiers are enabled, ShaktIQ sends isolated diff chunks to Google Gemini 3.8 Flash via the official Google Gen AI SDK to synthesize non-breaking shim recommendations:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-green-dark/80">
                <li>Your API schemas are processed solely for the execution of your requested analysis run.</li>
                <li>Data sent to Gemini via API is not retained by Google or used to train public foundation models.</li>
                <li>AI analysis can be toggled completely off at any time using the <code>AI_EXPLANATIONS_ENABLED=false</code> platform configuration flag.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  04
                </div>
                <h2>Data Retention & Security Storage</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                All platform data is persisted using high-availability MongoDB replica sets with WiredTiger storage encryption. Access tokens are hashed using SHA-256 before storage. Spec snapshot diffs are retained according to your organization&apos;s configured data retention policies.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  05
                </div>
                <h2>Your Rights & Data Portability</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                Platform administrators can export all analysis history, project snapshots, and consumer blast radius matrices at any time via the REST API or console dashboard. Organization admins may request complete data purging upon account deletion.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3 pt-2 border-t border-green-dark/10">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  06
                </div>
                <h2>Contact & Security Disclosure</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                If you have security questions or wish to report a vulnerability, please reach out to our platform team at <a href="mailto:security@shaktiq.dev" className="text-green-dark font-bold underline">security@shaktiq.dev</a>.
              </p>
            </section>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark hover:underline"
            >
              <span>View Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-dark text-butter-cream text-xs font-bold shadow-md hover:bg-green-hero transition-all"
            >
              <span>Return to Console</span>
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
