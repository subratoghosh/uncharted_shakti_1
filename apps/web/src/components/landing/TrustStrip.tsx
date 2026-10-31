import React from 'react';
import { Layers, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const pillars = [
    {
      icon: Layers,
      title: '100% Deterministic Code Verification',
      description:
        'No hallucinated false alarms or naive text-diff flaws. Deep structural comparison across routes, parameters, data payloads, and response structures.',
    },
    {
      icon: ShieldAlert,
      title: 'Downstream Impact & Client Matrix',
      description:
        'Calculates real-world downstream release impact. Immediately flags which microservice services, mobile apps, or web clients will break.',
    },
    {
      icon: Zap,
      title: 'Automated Patch Remediation',
      description:
        'Automated synthesis of production-ready backward-compatible fixes, deprecation shims, and safe evolution strategies.',
    },
  ];

  return (
    <section className="py-14 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 border border-green-dark/8 shadow-sm hover:bg-white hover:-translate-y-1.5 hover:border-green-dark/30 hover:shadow-card-hover transition-all duration-300 group cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-butter-cream shrink-0 flex items-center justify-center text-green-dark shadow-xs group-hover:scale-110 group-hover:bg-butter-gold transition-all duration-300">
                <p.icon className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-green-dark mb-1 group-hover:text-green-mid transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
