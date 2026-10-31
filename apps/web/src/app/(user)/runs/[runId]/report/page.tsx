'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { VerdictBanner } from '@/components/shared/VerdictBanner';
import { Logo } from '@/components/shared/Logo';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { EndpointTag } from '@/components/shared/EndpointTag';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatDate, shortSha, escapeText } from '@/lib/format';
import { Printer, ArrowLeft } from 'lucide-react';
import type { Finding } from '@shaktiq/shared';
import type { RunReport } from '@/lib/types';

export default function ReleaseReportPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const resolvedParams = use(params);
  const runId = resolvedParams.runId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['report', runId],
    queryFn: () => apiClient.runs.report(runId),
  });

  const report: RunReport | null = data?.ok ? data.data : null;

  if (error) {
    return (
      <ErrorState
        code="REPORT_FETCH_FAILED"
        message="Could not load the release report."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading || !report) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[var(--surface-2)] rounded" />
        <div className="h-20 bg-[var(--surface-2)] rounded-card" />
        <div className="h-40 bg-[var(--surface-2)] rounded-card" />
      </div>
    );
  }

  const { run, project, summary, findings, releaseStatus } = report;

  const breaking = findings.filter((f: Finding) => f.severity === 'breaking');
  const warnings = findings.filter((f: Finding) => f.severity === 'warning');
  const info = findings.filter((f: Finding) => f.severity === 'info');

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Top action bar - hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/runs/${runId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          <span>Back to Run detail</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <Printer className="h-4 w-4" aria-hidden />
          <span>Print report</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-2">
        <div className="flex items-center justify-between">
          <Logo size="sm" href={`/runs/${runId}`} subtitle="RELEASE REPORT" />
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Run: {shortSha(run.currentVersion)}
          </span>
        </div>
        <h1 className="text-h1 font-bold text-[var(--text)] tracking-tight">
          {project.name}
        </h1>
        <p className="text-xs font-mono text-[var(--text-muted)]">
          Repository: {project.fullName} · Spec: {project.specPath} · Branch: {run.branch ?? 'main'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Generated on {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Release Verdict Banner */}
      <VerdictBanner status={releaseStatus} />

      {/* Summary Matrix */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Analysis Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded bg-[var(--surface-2)]">
            <span className="text-xs text-[var(--text-muted)] block">Total Changes</span>
            <span className="text-h2 font-semibold text-[var(--text)]">{summary.total}</span>
          </div>
          <div className="p-3 rounded sev-breaking-bg">
            <span className="text-xs text-[var(--sev-breaking)] block">Breaking</span>
            <span className="text-h2 font-semibold text-[var(--sev-breaking)]">{summary.breaking}</span>
          </div>
          <div className="p-3 rounded sev-warning-bg">
            <span className="text-xs text-[var(--sev-warning)] block">Warnings</span>
            <span className="text-h2 font-semibold text-[var(--sev-warning)]">{summary.warning}</span>
          </div>
          <div className="p-3 rounded sev-info-bg">
            <span className="text-xs text-[var(--sev-info)] block">Info</span>
            <span className="text-h2 font-semibold text-[var(--sev-info)]">{summary.info}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-xs text-center text-[var(--text-muted)]">
          <div>New: <span className="font-semibold text-[var(--text)]">{summary.newCount}</span></div>
          <div>Resolved: <span className="font-semibold text-[var(--text)]">{summary.resolvedCount}</span></div>
          <div>Unresolved: <span className="font-semibold text-[var(--text)]">{summary.unresolvedCount}</span></div>
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2">
          Detailed Findings ({findings.length})
        </h2>

        {findings.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No API changes detected between the base and head specifications.
          </p>
        ) : (
          <div className="space-y-4">
            {breaking.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--sev-breaking)] flex items-center gap-1.5">
                  <span>Breaking Changes ({breaking.length})</span>
                </h3>
                <FindingsList items={breaking} />
              </div>
            )}

            {warnings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--sev-warning)] flex items-center gap-1.5">
                  <span>Warnings ({warnings.length})</span>
                </h3>
                <FindingsList items={warnings} />
              </div>
            )}

            {info.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--sev-info)] flex items-center gap-1.5">
                  <span>Informational Changes ({info.length})</span>
                </h3>
                <FindingsList items={info} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer (exact text from prd.md FR-5) */}
      <footer className="pt-6 border-t border-[var(--border)] space-y-2">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
          This report assesses API compatibility based on the OpenAPI specifications provided. It does not guarantee the release is safe.
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">
          Report ID: {run.id} · Fingerprinted by @shaktiq/analyzer
        </p>
      </footer>
    </div>
  );
}

function FindingsList({ items }: { items: Finding[] }) {
  return (
    <ul className="space-y-3" role="list">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <EndpointTag method={item.method} path={item.endpoint} />
            <div className="flex items-center gap-2">
              <SeverityBadge severity={item.severity} />
              <span className="font-mono text-xs text-[var(--text-muted)]">{item.changeType}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text)] font-medium">{escapeText(item.description)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
            <div>
              <span className="font-semibold block text-[var(--text)]">Impact:</span>
              <span>{escapeText(item.impact)}</span>
            </div>
            <div>
              <span className="font-semibold block text-[var(--text)]">Recommendation:</span>
              <span>{escapeText(item.recommendation)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

