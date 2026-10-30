'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { EndpointTag } from '@/components/shared/EndpointTag';
import { VerdictBanner } from '@/components/shared/VerdictBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { useRunStream } from '@/hooks/use-run-stream';
import { formatDate, shortSha, escapeText } from '@/lib/format';
import {
  FileText,
  GitCompare,
  X,
  History,
  Bot,
  AlertOctagon,
  Search,
} from 'lucide-react';
import type { Finding, Run, EndpointMemoryEntry, SseMessage } from '@shaktiq/shared';

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const resolvedParams = use(params);
  const runId = resolvedParams.runId;
  const queryClient = useQueryClient();

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Run
  const { data: runRes, isLoading: runLoading, error: runError, refetch: refetchRun } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => apiClient.runs.get(runId),
  });

  const run: Run | null = runRes?.ok ? runRes.data : null;
  const projectId = run?.projectId ?? '';

  // Live SSE updates for this run
  useRunStream({
    projectId,
    enabled: !!projectId && (run?.status === 'queued' || run?.status === 'running'),
    onMessage: (msg: SseMessage) => {
      if (msg.type === 'run.updated' && msg.data.id === runId) {
        void queryClient.invalidateQueries({ queryKey: ['run', runId] });
        void queryClient.invalidateQueries({ queryKey: ['findings', runId] });
      }
    },
  });

  // Fetch Findings
  const { data: findingsRes, isLoading: findingsLoading } = useQuery({
    queryKey: ['findings', runId, severityFilter, methodFilter, searchQuery],
    queryFn: () =>
      apiClient.runs.findings(runId, {
        severity: severityFilter || undefined,
        method: methodFilter || undefined,
        q: searchQuery || undefined,
      }),
    enabled: !!runId,
  });

  const findings: Finding[] =
    findingsRes?.ok && Array.isArray(findingsRes.data) ? findingsRes.data : [];

  // Memory history for selected finding
  const { data: memoryRes, isLoading: memoryLoading } = useQuery({
    queryKey: ['endpoint-memory', projectId, selectedFinding?.method, selectedFinding?.endpoint],
    queryFn: () =>
      selectedFinding && projectId
        ? apiClient.memory.endpoint(projectId, selectedFinding.method, selectedFinding.endpoint)
        : Promise.resolve({ ok: true as const, data: [] }),
    enabled: !!selectedFinding && !!projectId,
  });

  const memoryEntries: EndpointMemoryEntry[] =
    memoryRes?.ok && Array.isArray(memoryRes.data) ? memoryRes.data : [];

  // Close drawer on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedFinding(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (runError) {
    return (
      <ErrorState
        code="NOT_FOUND"
        message="Could not load run details."
        onRetry={() => void refetchRun()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Run Header */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)]">Run ID: {runId}</span>
              <div aria-live="polite">
                {run && <StatusBadge status={run.status} />}
              </div>
              {run && <SourceBadge source={run.source} />}
            </div>
            <h1 className="text-h2 font-semibold text-[var(--text)] font-mono">
              Version: {shortSha(run?.currentVersion)}
              {run?.previousVersion && (
                <span className="text-sm font-normal text-[var(--text-muted)] ml-2">
                  (base: {shortSha(run.previousVersion)})
                </span>
              )}
            </h1>
            {run?.commitId && (
              <p className="text-xs font-mono text-[var(--text-muted)]">Commit: {run.commitId}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {run?.projectId && (
              <Link
                href={`/projects/${run.projectId}/compare?base=${run.previousVersion ?? ''}&head=${run.id}`}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                <GitCompare className="h-3.5 w-3.5" aria-hidden />
                <span>Compare</span>
              </Link>
            )}
            <Link
              href={`/runs/${runId}/report`}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              <span>Release report</span>
            </Link>
          </div>
        </div>

        {/* Failed error banner */}
        {run?.status === 'failed' && (
          <div role="alert" className="rounded-card p-4 sev-breaking-bg space-y-1">
            <div className="flex items-center gap-2 text-[var(--sev-breaking)] font-medium text-sm">
              <AlertOctagon className="h-4 w-4" aria-hidden />
              <span>Analysis Failed: {run.errorCode ?? 'UNKNOWN_ERROR'}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {run.errorMessage ?? 'The specification analysis could not complete.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          <div>
            <span>Created: </span>
            <span className="text-[var(--text)] font-medium">
              {run ? formatDate(run.createdAt) : '…'}
            </span>
          </div>
          <div>
            <span>Branch: </span>
            <span className="text-[var(--text)] font-mono font-medium">
              {run?.branch ?? 'main'}
            </span>
          </div>
          <div>
            <span>Breaking Changes: </span>
            <span className="text-[var(--sev-breaking)] font-semibold">
              {run?.summary?.breaking ?? 0}
            </span>
          </div>
          <div>
            <span>Warnings: </span>
            <span className="text-[var(--sev-warning)] font-semibold">
              {run?.summary?.warning ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Release Verdict Banner */}
      {run?.summary?.releaseStatus && (
        <VerdictBanner status={run.summary.releaseStatus} />
      )}

      {/* Findings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Findings ({findings.length})
          </h2>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-[var(--text-muted)]" aria-hidden />
              <input
                type="text"
                placeholder="Search path or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 rounded border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">All Severities</option>
              <option value="breaking">Breaking</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Findings Table */}
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th scope="col" className="px-4">Severity</th>
                  <th scope="col" className="px-4">Endpoint</th>
                  <th scope="col" className="px-4">Change Type</th>
                  <th scope="col" className="px-4">Description</th>
                  <th scope="col" className="px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {findingsLoading ? (
                  <SkeletonRows cols={5} rows={4} />
                ) : findings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState
                        title="No findings detected"
                        description="This run detected zero breaking changes, warnings, or info-level diffs."
                      />
                    </td>
                  </tr>
                ) : (
                  findings.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedFinding(f)}
                      className="h-10 hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 whitespace-nowrap">
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <EndpointTag method={f.method} path={f.endpoint} />
                      </td>
                      <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {f.changeType}
                      </td>
                      <td className="px-4 text-xs text-[var(--text)] max-w-xs truncate">
                        {escapeText(f.description)}
                      </td>
                      <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(f.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Drawer for Finding Details */}
      {selectedFinding && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end"
          onClick={() => setSelectedFinding(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Finding detail"
        >
          <div
            className="w-full max-w-lg h-full bg-[var(--surface)] border-l border-[var(--border)] p-6 overflow-y-auto space-y-6 shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <EndpointTag method={selectedFinding.method} path={selectedFinding.endpoint} />
                <div className="flex items-center gap-2 pt-1">
                  <SeverityBadge severity={selectedFinding.severity} />
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {selectedFinding.changeType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                aria-label="Close drawer"
                className="h-8 w-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {escapeText(selectedFinding.description)}
              </p>
            </div>

            {/* Impact */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Consumer Impact
              </h3>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {escapeText(selectedFinding.impact)}
              </p>
            </div>

            {/* Recommendation */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Recommendation
              </h3>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {escapeText(selectedFinding.recommendation)}
              </p>
            </div>

            {/* AI Explanation (if present) */}
            {selectedFinding.aiExplanation && (
              <div className="rounded-card border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-xs">
                  <Bot className="h-4 w-4" aria-hidden />
                  <span>AI-generated explanation</span>
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed">
                  {escapeText(selectedFinding.aiExplanation)}
                </p>
              </div>
            )}

            {/* Memory Timeline Section */}
            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Project Memory Timeline
                </h3>
              </div>
              {memoryLoading ? (
                <div className="text-xs text-[var(--text-muted)]">Loading historical occurrences…</div>
              ) : memoryEntries.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  First breaking change detected on this endpoint.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    This endpoint broke in {memoryEntries.length} prior run(s):
                  </p>
                  <ul className="space-y-2" role="list">
                    {memoryEntries.map((m) => (
                      <li
                        key={m.id}
                        className="p-3 rounded border border-[var(--border)] bg-[var(--surface-2)] space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <SeverityBadge severity={m.severity} />
                          <span className="text-[var(--text-muted)]">{formatDate(m.createdAt)}</span>
                        </div>
                        <p className="text-xs font-mono text-[var(--text)]">{m.changeType}</p>
                        <p className="text-xs text-[var(--text-muted)]">{escapeText(m.description)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

