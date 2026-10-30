import React from 'react';
import type { Finding } from '@/types/index';

type ReleaseScoreGaugeProps = {
  score: number;
  findings: Finding[];
};

export function ReleaseScoreGauge({ score, findings }: ReleaseScoreGaugeProps) {
  const breakingCount = findings.filter((f) => f.severity === 'breaking').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const infoCount = findings.filter((f) => f.severity === 'info').length;

  const scoreColor =
    score >= 70
      ? 'text-emerald-500'
      : score >= 40
      ? 'text-amber-500'
      : 'text-rose-500';

  return (
    <div className="flex-shrink-0 flex items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-inner">
      <div className="text-center">
        <div className={`text-4xl font-extrabold tracking-tighter ${scoreColor}`}>
          {score}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mt-0.5">
          Release Score / 100
        </div>
      </div>
      <div className="border-l border-border pl-4 space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-text-muted">Breaking: {breakingCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-text-muted">Warning: {warningCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-text-muted">Info: {infoCount}</span>
        </div>
      </div>
    </div>
  );
}
