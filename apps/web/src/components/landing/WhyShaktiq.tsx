import React from 'react';
import { GitBranch, ShieldCheck, Zap, Network } from 'lucide-react';

export const WhyShaktiq: React.FC = () => {
  const differentiators = [
    {
      icon: GitBranch,
      title: 'Semantic Code Analysis vs Shallow Line Diffing',
      description:
        'Line-by-line diffs fail on whitespace, formatting changes, or reordered keys. shaktIQ performs deep structural analysis, isolating genuine breaking regressions from harmless changes.',
    },
    {
      icon: ShieldCheck,
      title: 'Non-Bypassable CI/CD Release Gates',
      description:
        'Zero broken clients in production. shaktIQ evaluates your release policy, calculating an objective 0-100 score and halting pull requests with an explicit BLOCKED verdict.',
    },
    {
      icon: Zap,
      title: 'Automated Patch Remediation & Safety Shims',
      description:
        'Don’t just flag broken releases—remediate them. shaktIQ automatically synthesizes non-breaking compatibility shims, route aliases, and deprecation wrappers in milliseconds.',
    },
    {
      icon: Network,
      title: 'Downstream Client & Dependency Impact Mapping',
      description:
        'Understand the ripple effect before deploy. shaktIQ correlates modified service routes and logic against downstream clients, web applications, and mobile apps.',
    },
  ];

  return (
    <section className="py-24 bg-butter-panel border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mb-4">
            Why platform teams choose <span>shakt<span className="text-[#52B143]">IQ</span></span> over static linters
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Engineered with mathematical precision to prevent breaking downstream production services while accelerating engineering release velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {differentiators.map((d, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col sm:flex-row items-start gap-5 group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-butter-cream shrink-0 flex items-center justify-center text-green-dark shadow-xs group-hover:scale-110 group-hover:bg-butter-gold transition-all duration-300">
                <d.icon className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-green-dark mb-2 group-hover:text-green-mid transition-colors">
                  {d.title}
                </h3>
                <p className="text-sm text-text-dim leading-relaxed">
                  {d.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
