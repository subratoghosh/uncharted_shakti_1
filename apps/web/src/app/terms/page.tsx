import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | shaktIQ - Release Safety & Compatibility Intelligence',
  description:
    'Review the terms of service governing access to shaktIQ breaking change detection, downstream client impact assessment, and release intelligence infrastructure.',
};

export const revalidate = 3600; // Cache static page for ultra-fast, zero-lag delivery

export default function TermsOfServicePage() {
  const lastUpdated = 'October 31, 2026';

  return (
    <MarketingLayout>
      <div className="pt-28 pb-20 bg-butter-bg text-green-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-dark text-butter-cream text-xs font-mono font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
              <span>Platform Governance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-slab font-bold tracking-tight text-green-dark">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-green-dark/75 max-w-2xl mx-auto leading-relaxed">
              These terms govern your use of the shaktIQ platform, developer tooling, compatibility analyzer engine, and release intelligence automation services.
            </p>
            <p className="text-xs text-green-dark/60 font-mono">Effective as of: {lastUpdated}</p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 bg-white/80 backdrop-blur-sm border border-green-dark/15 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Term 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  01
                </div>
                <h2>Acceptance of Terms</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                By accessing or using shaktIQ (including the web application, developer tools, VS Code extension, or version control webhooks), you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of an enterprise or organization, you represent that you have authority to bind that entity.
              </p>
            </section>

            {/* Term 2 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  02
                </div>
                <h2>Service Scope & Verification Engine</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                shaktIQ provides automated semantic code and specification comparison, downstream client impact evaluation, and intelligent remediation. The platform delivers release gate verdicts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 font-mono block mb-1">SAFE</span>
                  <p className="text-xs text-emerald-700">Additive and non-breaking changes approved for direct merge.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 font-mono block mb-1">REVIEW</span>
                  <p className="text-xs text-amber-700">Deprecations or parameter shifts requiring platform team sign-off.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-xs font-bold text-rose-800 font-mono block mb-1">BLOCKED</span>
                  <p className="text-xs text-rose-700">Breaking schema regressions preventing deployment until remediated.</p>
                </div>
              </div>
            </section>

            {/* Term 3 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  03
                </div>
                <h2>Account Governance & Security</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                Users must safeguard personal access tokens and service credentials. Administrators have the right to suspend or revoke access for any user in accordance with organizational security policies.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-green-dark/80">
                <li>You are solely responsible for actions originating from your registered tokens and accounts.</li>
                <li>You agree not to bypass rate limits, sandboxes, or authentication gateways.</li>
                <li>You will immediately notify shaktIQ administration of any compromised secrets or unauthorized access.</li>
              </ul>
            </section>

            {/* Term 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  04
                </div>
                <h2>Intellectual Property & Ownership</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                You retain complete, exclusive ownership of all software specifications, code schemas, repository configurations, and proprietary contracts uploaded or connected to shaktIQ. shaktIQ does not claim any intellectual property rights over your specifications.
              </p>
            </section>

            {/* Term 5 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  05
                </div>
                <h2>Disclaimer of Warranties & Liability</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                shaktIQ provides release gate analysis using deterministic semantic matching and multi-layer AI heuristics. While designed to prevent production incidents, you remain responsible for final deployment decisions and overall system architecture. shaktIQ is provided &quot;as is&quot; without warranties of uninterrupted uptime or error-free parsing of non-standard spec variants.
              </p>
            </section>

            {/* Term 6 */}
            <section className="space-y-3 pt-2 border-t border-green-dark/10">
              <div className="flex items-center gap-2.5 text-lg font-bold font-slab text-green-dark">
                <div className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center text-xs font-mono">
                  06
                </div>
                <h2>Modifications & Governing Law</h2>
              </div>
              <p className="text-sm leading-relaxed text-green-dark/80">
                We reserve the right to modify these terms as the platform introduces new detection capabilities and integrations. Continued use constitutes acceptance of updated terms.
              </p>
            </section>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark hover:underline"
            >
              <span>Read Privacy Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-dark text-butter-cream text-xs font-bold shadow-md hover:bg-green-hero transition-all"
            >
              <span>Launch shaktIQ Console</span>
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

