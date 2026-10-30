'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { formatDate, formatShortSha } from '../../../../lib/format';
import { RefreshCw, ArrowRight } from 'lucide-react';

type Run = {
  id: string;
  projectId: string;
  source: string;
  status: string;
  previousVersion: string;
  currentVersion: string;
  createdAt: string;
  summary?: {
    total: number;
    breaking: number;
    warning: number;
    info: number;
    releaseStatus: string;
  };
};

export default function AdminRunsPage() {
  const queryClient = useQueryClient();

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['admin-runs'],
    queryFn: () => apiClient<Run[]>('/admin/runs'),
  });

  const retryMutation = useMutation({
    mutationFn: (runId: string) =>
      apiClient(`/admin/runs/${runId}/retry`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-runs'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Platform Runs</h1>
        <p className="text-sm text-muted">Global audit and execution history</p>
      </div>

      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Runs ({runs.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Run ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source</th>
                <th className="p-3">Diff Versions</th>
                <th className="p-3 text-right">Findings</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading runs...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No runs recorded on the platform.
                  </td>
                </tr>
              ) : (
                runs.map(r => (
                  <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                    <td className="p-3 font-mono font-medium text-accent">
                      <Link href={`/runs/${r.id}`}>{formatShortSha(r.id)}</Link>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-1.5 py-0.5 rounded text-[10px] bg-surface-2 border border-border">
                        {r.source}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted">
                      {formatShortSha(r.previousVersion)} &rarr; {formatShortSha(r.currentVersion)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {r.summary ? `${r.summary.breaking}B / ${r.summary.warning}W` : '—'}
                    </td>
                    <td className="p-3 text-muted">{formatDate(r.createdAt)}</td>
                    <td className="p-3 text-right space-x-2">
                      {r.status === 'failed' && (
                        <button
                          onClick={() => retryMutation.mutate(r.id)}
                          disabled={retryMutation.isPending}
                          className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                      <Link
                        href={`/runs/${r.id}`}
                        className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
