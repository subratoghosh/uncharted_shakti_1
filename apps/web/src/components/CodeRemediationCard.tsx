'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { MultiLayerDossier } from '@/types/index';

type FindingInsight = MultiLayerDossier['findingInsights'][number];

interface CodeRemediationCardProps {
  insight: FindingInsight;
  getMethodBadgeClass: (method: string) => string;
}

export function CodeRemediationCard({ insight, getMethodBadgeClass }: CodeRemediationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(insight.codeFixSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-surface rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-surface-2/40">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getMethodBadgeClass(
              insight.method
            )}`}
          >
            {insight.method}
          </span>
          <span className="font-mono text-xs font-semibold">{insight.endpoint}</span>
          <span className="text-border">|</span>
          <span className="text-xs text-text-muted font-mono">{insight.changeType}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-2 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied Patch!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-text-muted" />
              <span>Copy Fix Snippet</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
            Consumer Impact Assessment
          </div>
          <p className="text-xs text-text leading-relaxed bg-surface-2 p-2.5 rounded border border-border">
            {insight.consumerImpact}
          </p>
        </div>

        {insight.mitigationStrategy && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Mitigation Strategy
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed bg-emerald-500/5 p-2 rounded border border-emerald-500/20">
              {insight.mitigationStrategy}
            </p>
          </div>
        )}

        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
            Backward-Compatible Remediation Snippet
          </div>
          <pre className="font-mono text-xs bg-bg p-3 rounded-md border border-border overflow-x-auto text-emerald-400">
            <code>{insight.codeFixSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
