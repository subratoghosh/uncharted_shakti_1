import React from 'react';
import Link from 'next/link';
import { GitBranch, ExternalLink, ArrowRight } from 'lucide-react';
import { ShaktiqBrand } from './ShaktiqBrand';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#08261E] border-t border-green-mid/60 pt-16 pb-12 text-text-hero-sub">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-green-mid/50">
          {/* Brand Column */}
          <div className="space-y-4">
            <ShaktiqBrand href="/" size="md" theme="dark" />
            <p className="text-xs sm:text-sm text-text-hero-sub/90 leading-relaxed">
              Continuous OpenAPI compatibility, blast radius assessment, and autonomous Gemini AI release intelligence for platform engineering teams.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-dark border border-green-light/40 text-[11px] font-mono text-butter-cream shadow-xs">
                <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
                <span>Engine: Gemini 3.8 Flash • Operational</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-butter-cream font-mono">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-text-hero-sub">
              <li>
                <Link
                  href="/workflow"
                  className="group inline-flex items-center gap-1.5 text-text-hero-sub hover:text-butter-cream hover:translate-x-1.5 transition-all duration-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-butter-cream text-xs">→</span>
                  <span>5-Step Workflow Engine</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/why-us"
                  className="group inline-flex items-center gap-1.5 text-text-hero-sub hover:text-butter-cream hover:translate-x-1.5 transition-all duration-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-butter-cream text-xs">→</span>
                  <span>Why ShaktIQ (Security & Reliability)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/intelligence"
                  className="group inline-flex items-center gap-1.5 text-text-hero-sub hover:text-butter-cream hover:translate-x-1.5 transition-all duration-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-butter-cream text-xs">→</span>
                  <span>Blast Radius Intelligence</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="group inline-flex items-center gap-1.5 text-text-hero-sub hover:text-butter-cream hover:translate-x-1.5 transition-all duration-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-butter-cream text-xs">→</span>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="group inline-flex items-center gap-1.5 text-text-hero-sub hover:text-butter-cream hover:translate-x-1.5 transition-all duration-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-butter-cream text-xs">→</span>
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1.5 text-butter-cream hover:text-butter-gold font-bold hover:translate-x-1.5 transition-all duration-200"
                >
                  <span>Launch Interactive Console</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-butter-cream font-mono">
              Engineering Specs
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-text-hero-sub">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-text-hero-sub hover:text-white transition-colors">Deterministic AST Diff</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-text-hero-sub hover:text-white transition-colors">OpenAPI 3.0 & 3.1 Compliant</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-text-hero-sub hover:text-white transition-colors">GitHub Webhook Dispatcher</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-text-hero-sub hover:text-white transition-colors">Multi-Tier Release Gates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-text-hero-sub hover:text-white transition-colors">Fastify & MongoDB Engine</span>
              </li>
            </ul>
          </div>

          {/* Security & Open Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-butter-cream font-mono">
              Open Governance
            </h4>
            <p className="text-xs text-text-hero-sub/90 leading-relaxed mb-3">
              Zero telemetry leaks. Schema payloads remain strictly within your infrastructure perimeter.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/subratoghosh/uncharted_shakti_1"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-dark border border-green-light/40 hover:border-butter-cream/40 text-xs text-butter-cream hover:bg-green-mid transition-all duration-200"
              >
                <GitBranch className="w-3.5 h-3.5 text-butter-cream group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-butter-cream/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-hero-sub/90">
          <p>© {currentYear} ShaktIQ. Built with high-contrast Butter & Green design philosophy.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <Link
              href="/privacy"
              className="text-text-hero-sub hover:text-butter-cream transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-text-hero-sub hover:text-butter-cream transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/why-us"
              className="text-text-hero-sub hover:text-butter-cream transition-colors duration-200"
            >
              Security
            </Link>
            <Link
              href="/dashboard"
              className="text-butter-cream hover:text-butter-gold font-bold transition-colors duration-200"
            >
              Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
