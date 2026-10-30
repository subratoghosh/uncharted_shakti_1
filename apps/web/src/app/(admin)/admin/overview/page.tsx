'use client';

// app/(admin)/admin/overview/page.tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { KpiCard } from '@/components/shared/KpiCard';
import { RunsBarChart } from '@/components/charts/RunsBarChart';
import { FindingsTrendChart } from '@/components/charts/FindingsTrendChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/shared/SkeletonRow';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatRelative } from '@/lib/format';
import type { RunStatus } from '@shaktiq/shared';

export default function AdminOverviewPage() {
  const {
    data: overviewRes,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => apiClient.admin.overview(),
  });

  const {
    data: healthRes,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['admin', 'workflowsHealth'],
    queryFn: () => apiClient.admin.workflowsHealth(),
  });

  const overview = overviewRes?.ok ? overviewRes.data : null;
  const health = healthRes?.ok ? healthRes.data : null;

  // Build bar chart data from overview run counts
  const barData: { status: string; count: number }[] = overview
    ? [
        { status: 'queued', count: overview.runs?.queued ?? 0 },
        { status: 'running', count: overview.runs?.running ?? 0 },
        { status: 'completed', count: overview.runs?.completed ?? 0 },
        { status: 'failed', count: overview.runs?.failed ?? 0 },
      ]
    : [];

  // Workflow health styling
  const healthStatusMap: Record<string, { cls: string; label: string }> = {
    ok: { cls: 'text-[var(--ok)]', label: 'OK' },
    degraded: { cls: 'text-[var(--sev-warning)]', label: 'Degraded' },
    unknown: { cls: 'text-[var(--text-muted)]', label: 'Unknown' },
  };

  const healthInfo = health
    ? (healthStatusMap[health.status] ?? healthStatusMap.unknown)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Admin Overview</h1>

      {/* KPI Cards */}
      {overviewError ? (
        <ErrorState
          message="Failed to load overview data."
          onRetry={() => refetchOverview()}
        />
      ) : overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Runs"
            value={overview.runs?.total ?? 0}
            sub={`${overview.runs?.last24h ?? 0} in last 24h`}
          />
          <KpiCard
            label="Running Now"
            value={overview.runs?.running ?? 0}
          />
          <KpiCard
            label="Failed Runs"
            value={overview.runs?.failed ?? 0}
          />
          <KpiCard
            label="Duplicate Events"
            value={overview.events?.duplicateCount ?? 0}
            sub={`${overview.events?.rejectedCount ?? 0} rejected`}
          />
        </div>
      ) : null}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Runs by status bar chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5">
          <p className="text-sm font-medium text-[var(--text)] mb-4">Runs by Status</p>
          {overviewLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="h-full w-full animate-pulse bg-[var(--surface-2)] rounded" />
            </div>
          ) : barData.length > 0 ? (
            <RunsBarChart data={barData} />
          ) : (
            <EmptyState title="No run data" description="No runs have been recorded yet." />
          )}
        </div>

        {/* Findings trend line chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5">
          <p className="text-sm font-medium text-[var(--text)] mb-4">Findings Trend</p>
          <EmptyState
            title="No trend data"
            description="Findings trend data is not available at the admin overview level."
          />
        </div>
      </div>

      {/* Workflow health card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5">
        <p className="text-sm font-medium text-[var(--text)] mb-3">Workflow Health</p>
        {healthError ? (
          <ErrorState
            message="Failed to load workflow health."
            onRetry={() => refetchHealth()}
          />
        ) : healthLoading ? (
          <div className="h-6 w-32 animate-pulse bg-[var(--surface-2)] rounded" />
        ) : health && healthInfo ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${healthInfo.cls}`}>
                {healthInfo.label}
              </span>
              {health.lastCheck && (
                <span className="text-xs text-[var(--text-muted)]">
                  Last checked {formatRelative(health.lastCheck)}
                </span>
              )}
            </div>
            {health.details && (
              <p className="text-sm text-[var(--text-muted)]">{health.details}</p>
            )}
          </div>
        ) : (
          <EmptyState title="No health data" description="Workflow health data unavailable." />
        )}
      </div>
    </div>
  );
}
