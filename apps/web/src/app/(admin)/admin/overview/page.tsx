'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ParallaxCard } from '@/components/shared/ParallaxCard';
import { RunsBarChart } from '@/components/charts/RunsBarChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/shared/SkeletonRow';
import { formatRelative } from '@/lib/format';

export default function AdminOverviewPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'runs' | 'events'>('all');

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

  const barData: { status: string; count: number }[] = overview
    ? [
        { status: 'queued', count: overview.runs?.queued ?? 0 },
        { status: 'running', count: overview.runs?.running ?? 0 },
        { status: 'completed', count: overview.runs?.completed ?? 0 },
        { status: 'failed', count: overview.runs?.failed ?? 0 },
      ]
    : [];

  const healthStatusMap: Record<string, { cls: string; label: string }> = {
    ok: { cls: 'text-[var(--ok)]', label: 'OK' },
    degraded: { cls: 'text-[var(--sev-warning)]', label: 'Degraded' },
    unknown: { cls: 'text-[var(--text-muted)]', label: 'Unknown' },
  };

  const healthInfo = health
    ? (healthStatusMap[health.status] ?? healthStatusMap.unknown)
    : null;

  const kpis = overview
    ? [
        {
          id: 'runs',
          title: 'Total Analysis Runs',
          value: overview.runs?.total ?? 0,
          category: 'Execution Hub',
          badge: `${overview.runs?.last24h ?? 0} in 24h`,
          sub: `${overview.runs?.running ?? 0} active, ${overview.runs?.failed ?? 0} failed`,
          description: 'Global execution volume across all projects. Runs are executed deterministically using oasdiff.',
          details: [
            { label: 'Total Executions', value: overview.runs?.total ?? 0 },
            { label: 'Completed', value: overview.runs?.completed ?? 0 },
            { label: 'Running Now', value: overview.runs?.running ?? 0 },
            { label: 'Failed', value: overview.runs?.failed ?? 0 },
            { label: 'Last 24 Hours', value: overview.runs?.last24h ?? 0 },
          ],
        },
        {
          id: 'events',
          title: 'Ingestion & Webhooks',
          value: overview.events?.total ?? 0,
          category: 'Webhook Delivery',
          badge: 'IDEMPOTENT',
          sub: `${overview.events?.duplicateCount ?? 0} duplicates prevented, ${overview.events?.rejectedCount ?? 0} rejected`,
          description: 'High-throughput SHA-256 HMAC verified GitHub webhooks. Duplicate payloads are idempotently deduplicated.',
          details: [
            { label: 'Total Events Received', value: overview.events?.total ?? 0 },
            { label: 'Duplicate Count', value: overview.events?.duplicateCount ?? 0 },
            { label: 'Rejected Invalid Signature', value: overview.events?.rejectedCount ?? 0 },
          ],
        },
      ]
    : [];

  const visibleKpis = selectedFilter === 'all'
    ? kpis
    : kpis.filter(k => k.id === selectedFilter);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)] tracking-tight">Admin Overview</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          System telemetry, webhook idempotency, and automated pipeline execution stats.
        </p>
      </div>

      {/* Options Bar to reduce viewport clutter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-3">
        <span className="text-xs font-mono text-[var(--text-muted)] mr-2">Filter Cards:</span>
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'all'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          All Cards
        </button>
        <button
          onClick={() => setSelectedFilter('runs')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'runs'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Runs
        </button>
        <button
          onClick={() => setSelectedFilter('events')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'events'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Webhooks
        </button>
      </div>

      {/* Vertical KPI Card Stack with 3D Parallax & Popup Detail Modal */}
      {overviewError ? (
        <ErrorState
          message="Failed to load overview data."
          onRetry={() => refetchOverview()}
        />
      ) : overviewLoading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleKpis.map((kpi) => (
            <ParallaxCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              sub={kpi.sub}
              category={kpi.category}
              badge={kpi.badge}
              description={kpi.description}
              details={kpi.details}
            />
          ))}
        </div>
      )}

      {/* Runs by Status Bar Chart */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5 hover:border-[var(--border)] transition-colors">
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

      {/* Workflow Health Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5 hover:border-[var(--border)] transition-colors">
        <p className="text-sm font-medium text-[var(--text)] mb-3">Workflow Engine Health</p>
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
