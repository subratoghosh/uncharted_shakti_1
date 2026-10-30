import React from 'react';
import Link from 'next/link';
import {
  Workflow,
  Network,
  Zap,
  ShieldCheck,
  ArrowRight,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';

const FEATURE_MODULES = [
  {
    title: '5-Step Workflow Engine',
    href: '/workflow',
    icon: Workflow,
    tag: 'Contract Governance',
    description:
      'Structured pipeline from schema ingestion to deep AST semantic diffing, blast radius calculation, and non-bypassable CI release gate approval.',
  },
  {
    title: 'Blast Radius Intelligence',
    href: '/intelligence',
    icon: Network,
    tag: 'Consumer Matrix',
    description:
      'Cross-references registered consumer microservices, mobile apps, and SDKs to calculate objective downstream breaking impact before code is merged.',
  },
  {
    title: 'Autonomous AI Dossier',
    href: '/dashboard',
    icon: Zap,
    tag: 'Gemini 3.8 Flash',
    description:
      'Synthesizes production-grade backward-compatible schema shims, route deprecation wrappers, and copy-paste ready migration code in under 300ms.',
  },
  {
    title: 'Why ShaktIQ Architecture',
    href: '/why-us',
    icon: ShieldCheck,
    tag: 'Enterprise Reliability',
    description:
      'Mathematical AST parsing eliminates false alarms while catching subtle schema ruptures that static linters and human code reviews consistently miss.',
  },
];

export const FeatureModules: React.FC = () => {
  return (
    <section className="py-20 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-green-accent" />
            PLATFORM ARCHITECTURE
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-3">
            Everything platform teams need to release APIs safely
          </h2>
          <p className="text-text-dim text-sm sm:text-base leading-relaxed">
            Explore our specialized platform modules engineered to automate breaking change detection, blast radius assessment, and remediation with institutional rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={mod.href}
                className="p-7 bg-white rounded-3xl border border-green-dark/12 shadow-xs hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark group-hover:bg-green-dark group-hover:text-butter-cream transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-dark/5 text-green-dark border border-green-dark/10">
                      {mod.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-green-dark mb-2 group-hover:text-green-mid transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-text-dim text-xs leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark group-hover:text-green-mid pt-3 border-t border-green-dark/8">
                  <span>Explore {mod.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
