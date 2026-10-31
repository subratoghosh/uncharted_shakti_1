'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate, shortSha } from '@/lib/format';
import { RefreshCw } from 'lucide-react';
import type { Run } from '@shaktiq/shared';
import { MOCK_RUN_COMPLETED } from '@/mocks/mock-data';

export default function AdminRunsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-runs', page, statusFilter],
    queryFn: () => apiClient.admin.runs({ page, limit, status: statusFilter || undefined }),
  });

  const retryMutation = useMutation({
    mutationFn: (runId: string) => apiClient.admin.retryRun(runId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-runs'] });
    },
  });

  const runs: Run[] = data?.ok && Array.isArray(data.data) ? data.data : [];
  const total = data?.ok && data.meta ? data.meta.total : runs.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text)]">All Runs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Global run audit log and manual retry management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-[var(--text-muted)] sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState
          code="FETCH_ERROR"
          message={error instanceof Error ? error.message : 'Failed to load runs'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th scope="col" className="px-4">Status</th>
                  <th scope="col" className="px-4">Project ID</th>
                  <th scope="col" className="px-4">Source</th>
                  <th scope="col" className="px-4">Version</th>
                  <th scope="col" className="px-4 text-right">Breaking</th>
                  <th scope="col" className="px-4 text-right">Warnings</th>
                  <th scope="col" className="px-4">Created</th>
                  <th scope="col" className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {isLoading ? (
                  <SkeletonRows cols={8} rows={5} />
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState
                        title="No runs found"
                        description="No analysis runs match the selected criteria."
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
                      <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {run.projectId}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <SourceBadge source={run.source} />
                      </td>
                      <td className="px-4 font-mono text-xs whitespace-nowrap">
                        {shortSha(run.currentVersion)}
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
                      <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(run.createdAt)}
                      </td>
                      <td className="px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {run.status === 'failed' && (
                          <button
                            onClick={() => retryMutation.mutate(run.id)}
                            disabled={retryMutation.isPending}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            title="Retry failed run"
                          >
                            <RefreshCw className={`h-3 w-3 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="border-t border-[var(--border)] p-4">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
