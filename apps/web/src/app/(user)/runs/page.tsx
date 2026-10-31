'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate, shortSha } from '@/lib/format';
import type { Project, Run } from '@shaktiq/shared';
import { MOCK_PROJECT, MOCK_RUN_COMPLETED } from '@/mocks/mock-data';

export default function RunsPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projectsRes, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.projects.list(),
  });

  const projects: Project[] = projectsRes?.ok && Array.isArray(projectsRes.data) ? projectsRes.data : [];
  const activeProjectId = selectedProjectId || (projects[0]?.id ?? '');

  const { data: runsRes, isLoading: runsLoading, error: runsError, refetch } = useQuery({
    queryKey: ['runs', activeProjectId],
    queryFn: () => apiClient.runs.listForProject(activeProjectId, { limit: 50 }),
    enabled: !!activeProjectId,
  });

  const runs: Run[] = runsRes?.ok && Array.isArray(runsRes.data) ? runsRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text)]">Runs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Analysis runs, detection verdicts, and compatibility history
          </p>
        </div>
        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="project-filter" className="text-xs text-[var(--text-muted)]">
              Project:
            </label>
            <select
              id="project-filter"
              value={activeProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {projectsLoading ? (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 animate-pulse">
          <div className="h-4 w-48 bg-[var(--surface-2)] rounded" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects registered"
          description="Create a project to begin running breaking-change analyses."
          action={
            <Link
              href="/projects"
              className="inline-flex items-center h-9 px-4 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
            >
              Go to Projects
            </Link>
          }
        />
      ) : runsError ? (
        <ErrorState
          code="FETCH_ERROR"
          message={runsError instanceof Error ? runsError.message : 'Failed to load runs'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th scope="col" className="px-4">Status</th>
                  <th scope="col" className="px-4">Version</th>
                  <th scope="col" className="px-4">Source</th>
                  <th scope="col" className="px-4 text-right">Breaking</th>
                  <th scope="col" className="px-4 text-right">Warnings</th>
                  <th scope="col" className="px-4">Release Verdict</th>
                  <th scope="col" className="px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {runsLoading ? (
                  <SkeletonRows cols={7} rows={4} />
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        title="No runs yet for this project"
                        description="Start a manual run or push a commit to trigger automated analysis."
                        action={
                          <Link
                            href={`/projects/${activeProjectId}/runs/new`}
                            className="inline-flex items-center h-8 px-3 rounded bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90"
                          >
                            Run analysis
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/runs/${run.id}`)}
                      className="h-10 hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 whitespace-nowrap">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-4 font-mono text-xs whitespace-nowrap">
                        {shortSha(run.currentVersion)}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <SourceBadge source={run.source} />
                      </td>
                      <td className="px-4 text-right font-mono text-xs whitespace-nowrap">
                        <span className={run.summary?.breaking ? 'text-[var(--sev-breaking)] font-semibold' : 'text-[var(--text-muted)]'}>
                          {run.summary?.breaking ?? 0}
                        </span>
                      </td>
                      <td className="px-4 text-right font-mono text-xs whitespace-nowrap">
                        <span className={run.summary?.warning ? 'text-[var(--sev-warning)] font-semibold' : 'text-[var(--text-muted)]'}>
                          {run.summary?.warning ?? 0}
                        </span>
                      </td>
                      <td className="px-4 text-xs whitespace-nowrap">
                        {run.summary?.releaseStatus ? (
                          <span
                            className={`inline-flex items-center rounded text-xs px-2 py-0.5 font-medium ${
                              run.summary.releaseStatus === 'safe'
                                ? 'text-[var(--ok)] ok-bg'
                                : run.summary.releaseStatus === 'review'
                                ? 'text-[var(--sev-warning)] sev-warning-bg'
                                : 'text-[var(--sev-breaking)] sev-breaking-bg'
                            }`}
                          >
                            {run.summary.releaseStatus}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(run.createdAt)}
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
  );
}

