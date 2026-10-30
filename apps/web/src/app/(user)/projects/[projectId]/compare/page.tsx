'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { DiffStatusBadge } from '@/components/shared/DiffStatusBadge';
import { EndpointTag } from '@/components/shared/EndpointTag';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate, shortSha, escapeText } from '@/lib/format';
import { GitCompare, ArrowRight } from 'lucide-react';
import type { Project, Run, FindingWithDiff, DiffStatus } from '@shaktiq/shared';

export default function ComparePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const searchParams = useSearchParams();

  const [baseRunId, setBaseRunId] = useState(searchParams.get('base') ?? '');
  const [headRunId, setHeadRunId] = useState(searchParams.get('head') ?? '');
  const [activeTab, setActiveTab] = useState<DiffStatus>('new');

  const { data: projectRes } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.projects.get(projectId),
  });

  const { data: runsRes, isLoading: runsLoading } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => apiClient.runs.listForProject(projectId, { limit: 50 }),
  });

  const project: Project | null = projectRes?.ok ? projectRes.data : null;
  const runs: Run[] = runsRes?.ok && Array.isArray(runsRes.data) ? runsRes.data : [];

  // Default selection if empty
  useEffect(() => {
    if (!baseRunId && runs.length > 1) {
      setBaseRunId(runs[1]?.id ?? '');
    }
    if (!headRunId && runs.length > 0) {
      setHeadRunId(runs[0]?.id ?? '');
    }
  }, [runs, baseRunId, headRunId]);

  const { data: compareRes, isLoading: compareLoading, error: compareError, refetch } = useQuery({
    queryKey: ['compare', projectId, baseRunId, headRunId],
    queryFn: () => apiClient.runs.compare(projectId, baseRunId, headRunId),
    enabled: !!projectId && !!baseRunId && !!headRunId,
  });

  const allFindings: FindingWithDiff[] =
    compareRes?.ok && Array.isArray(compareRes.data) ? compareRes.data : [];

  const newFindings = allFindings.filter((f) => f.diffStatus === 'new');
  const resolvedFindings = allFindings.filter((f) => f.diffStatus === 'resolved');
  const unresolvedFindings = allFindings.filter((f) => f.diffStatus === 'unresolved');

  const currentTabFindings =
    activeTab === 'new'
      ? newFindings
      : activeTab === 'resolved'
      ? resolvedFindings
      : unresolvedFindings;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-1">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">
            {project?.name ?? '…'}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--text)] font-medium">Compare</span>
        </nav>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Run-to-Run Comparison</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Fingerprint-based diff tracking: detect new, resolved, and unresolved breaking changes.
        </p>
      </div>

      {/* Selectors */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label htmlFor="base-select" className="text-xs font-semibold text-[var(--text-muted)]">
              Base Run (Previous)
            </label>
            <select
              id="base-select"
              value={baseRunId}
              onChange={(e) => setBaseRunId(e.target.value)}
              className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Select base run…</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {shortSha(r.currentVersion)} ({r.status}) - {formatDate(r.createdAt)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="head-select" className="text-xs font-semibold text-[var(--text-muted)]">
              Head Run (Target)
            </label>
            <select
              id="head-select"
              value={headRunId}
              onChange={(e) => setHeadRunId(e.target.value)}
              className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Select head run…</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {shortSha(r.currentVersion)} ({r.status}) - {formatDate(r.createdAt)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Diff Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-[var(--border)] gap-6" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'new'}
            onClick={() => setActiveTab('new')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-[var(--sev-breaking)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>New</span>
            <span className="rounded px-1.5 py-0.5 text-xs text-[var(--sev-breaking)] sev-breaking-bg font-semibold">
              {newFindings.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'resolved'}
            onClick={() => setActiveTab('resolved')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'resolved'
                ? 'border-[var(--ok)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>Resolved</span>
            <span className="rounded px-1.5 py-0.5 text-xs text-[var(--ok)] ok-bg font-semibold">
              {resolvedFindings.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'unresolved'}
            onClick={() => setActiveTab('unresolved')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'unresolved'
                ? 'border-[var(--sev-warning)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>Unresolved</span>
            <span className="rounded px-1.5 py-0.5 text-xs text-[var(--sev-warning)] sev-warning-bg font-semibold">
              {unresolvedFindings.length}
            </span>
          </button>
        </div>

        {/* Tab Panel */}
        {compareError ? (
          <ErrorState
            code="COMPARE_FAILED"
            message="Could not compare the selected runs."
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th scope="col" className="px-4">Diff Status</th>
                    <th scope="col" className="px-4">Severity</th>
                    <th scope="col" className="px-4">Endpoint</th>
                    <th scope="col" className="px-4">Change Type</th>
                    <th scope="col" className="px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {compareLoading ? (
                    <SkeletonRows cols={5} rows={3} />
                  ) : currentTabFindings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <EmptyState
                          title={`No ${activeTab} findings`}
                          description={`There are no findings classified as ${activeTab} between these two runs.`}
                        />
                      </td>
                    </tr>
                  ) : (
                    currentTabFindings.map((f) => (
                      <tr key={f.fingerprint} className="h-10 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 whitespace-nowrap">
                          <DiffStatusBadge status={f.diffStatus} />
                        </td>
                        <td className="px-4 whitespace-nowrap">
                          <SeverityBadge severity={f.severity} />
                        </td>
                        <td className="px-4 whitespace-nowrap">
                          <EndpointTag method={f.method} path={f.endpoint} />
                        </td>
                        <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {f.changeType}
                        </td>
                        <td className="px-4 text-xs text-[var(--text)]">
                          {escapeText(f.description)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

