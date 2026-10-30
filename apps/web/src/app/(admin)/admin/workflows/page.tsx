'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatDate } from '@/lib/format';
import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw, GitBranch } from 'lucide-react';
import type { WorkflowHealth } from '@shaktiq/shared';

export default function AdminWorkflowsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-workflows-health'],
    queryFn: () => apiClient.admin.workflowsHealth(),
  });

  const health: WorkflowHealth | null = data?.ok ? data.data : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text)]">Workflow Health</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Status of n8n automation pipelines (shaktiq-analyze-run and shaktiq-error-handler)
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState
          code="HEALTH_CHECK_FAILED"
          message={error instanceof Error ? error.message : 'Unable to check workflow health'}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-[var(--surface-2)] rounded" />
          <div className="h-4 w-48 bg-[var(--surface-2)] rounded" />
        </div>
      ) : health ? (
        <div className="space-y-6">
          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center gap-3">
              {health.status === 'ok' ? (
                <div className="flex items-center gap-2 text-[var(--ok)]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                  <span className="font-semibold text-base">Operational</span>
                </div>
              ) : health.status === 'degraded' ? (
                <div className="flex items-center gap-2 text-[var(--sev-warning)]">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                  <span className="font-semibold text-base">Degraded</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <HelpCircle className="h-5 w-5" aria-hidden />
                  <span className="font-semibold text-base">Unknown</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Last Checked</span>
                <span className="text-sm text-[var(--text)] font-medium">
                  {formatDate(health.lastCheck)}
                </span>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Details</span>
                <span className="text-sm text-[var(--text)] font-mono">
                  {health.details || 'All workflows responding within normal parameters'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[var(--text)] font-medium text-sm">
              <GitBranch className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              <span>Orchestration Architecture</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              n8n orchestrates external GitHub API interactions, runs analysis steps deterministically, and triggers notifications. Fastify maintains business logic and data persistence in MongoDB. n8n communicates exclusively through verified <code className="font-mono text-xs bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">/api/v1/internal/*</code> endpoints.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
