'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../../lib/api-client';
import { ReleaseVerdictBanner } from '../../../../../components/shared/ReleaseVerdictBanner';
import { SeverityBadge } from '../../../../../components/shared/SeverityBadge';
import { EndpointTag } from '../../../../../components/shared/EndpointTag';
import { formatDate, formatShortSha } from '../../../../../lib/format';
import { Printer } from 'lucide-react';

type Finding = {
  id: string;
  endpoint: string;
  method: string;
  changeType: string;
  severity: string;
  description: string;
  impact: string;
  recommendation: string;
};

type Run = {
  id: string;
  projectId: string;
  source: string;
  branch?: string;
  commitId?: string;
  previousVersion: string;
  currentVersion: string;
  status: string;
  createdAt: string;
  summary?: {
    total: number;
    breaking: number;
    warning: number;
    info: number;
    releaseStatus: 'safe' | 'review' | 'blocked';
    newCount: number;
    resolvedCount: number;
    unresolvedCount: number;
  };
};

export default function ReleaseReportPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;

  const { data: run, isLoading: loadingRun } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => apiClient<Run>(`/runs/${runId}`),
  });

  const { data: findings = [], isLoading: loadingFindings } = useQuery({
    queryKey: ['run-findings', runId],
    queryFn: () => apiClient<Finding[]>(`/runs/${runId}/findings`),
  });

  if (loadingRun || loadingFindings) {
    return <div className="p-12 text-center text-sm text-muted">Generating report...</div>;
  }

  if (!run) {
    return <div className="p-12 text-center text-sm text-muted">Run not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 bg-surface p-8 border border-border rounded-lg print:border-none print:shadow-none print:p-0">
      {/* Print Trigger (hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="text-xs text-muted">Official Release Assessment Document</div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-sm text-xs font-semibold hover:opacity-90"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            shakt<span className="text-[#52B143]">IQ</span> Release Compatibility Report
          </div>
          <span className="font-mono text-xs text-muted">ID: {formatShortSha(run.id)}</span>
        </div>
        <div className="grid grid-cols-2 text-xs text-muted font-mono gap-y-1">
          <div>Base Spec: {formatShortSha(run.previousVersion)}</div>
          <div>Head Spec: {formatShortSha(run.currentVersion)}</div>
          <div>Branch: {run.branch || 'main'}</div>
          <div>Generated: {formatDate(run.createdAt)}</div>
        </div>
      </div>

      {/* Release Verdict Banner */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Compatibility Verdict
        </h2>
        <ReleaseVerdictBanner status={run.summary?.releaseStatus || 'safe'} />
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-surface-2 border border-border rounded text-center">
        <div>
          <div className="text-xs text-muted font-semibold">Total Changes</div>
          <div className="text-xl font-bold">{run.summary?.total || 0}</div>
        </div>
        <div>
          <div className="text-xs text-sev-breaking font-semibold">Breaking</div>
          <div className="text-xl font-bold text-sev-breaking">{run.summary?.breaking || 0}</div>
        </div>
        <div>
          <div className="text-xs text-sev-warning font-semibold">Warning</div>
          <div className="text-xl font-bold text-sev-warning">{run.summary?.warning || 0}</div>
        </div>
        <div>
          <div className="text-xs text-sev-info font-semibold">Info</div>
          <div className="text-xl font-bold text-sev-info">{run.summary?.info || 0}</div>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-2">
          Detailed Findings Breakdown ({findings.length})
        </h2>

        {findings.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted italic">
            No breaking or warning changes were detected.
          </div>
        ) : (
          <div className="space-y-4">
            {findings.map((f, i) => (
              <div
                key={f.id + i}
                className="p-4 bg-surface-2 border border-border rounded-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <EndpointTag method={f.method} endpoint={f.endpoint} />
                  </div>
                  <span className="font-mono text-[10px] text-muted">{f.changeType}</span>
                </div>

                <div className="font-medium text-text">{f.description}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="font-semibold text-muted">Impact: </span>
                    <span className="text-text">{f.impact}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted">Recommendation: </span>
                    <span className="text-text">{f.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer Footer */}
      <div className="border-t border-border pt-4 text-xs text-muted text-center italic">
        This report assesses software compatibility based on the service specifications provided. It does
        not guarantee the release is safe.
      </div>
    </div>
  );
}
