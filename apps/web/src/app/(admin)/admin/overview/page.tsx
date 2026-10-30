'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Activity, Layers, GitCompare, AlertTriangle, Copy } from 'lucide-react';

type AdminOverview = {
  projectsCount: number;
  runsTotal: number;
  runsLast24h: number;
  runsByStatus: Record<string, number>;
  eventsTotal: number;
  duplicatesCount: number;
  rejectedCount: number;
  usersCount: number;
};

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => apiClient<AdminOverview>('/admin/overview'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Admin Mode
            </span>
          </div>
          <p className="text-sm text-muted">
            Platform-wide operations, audit telemetry, and workflow monitoring
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted">Loading platform telemetry...</div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
              <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
                <span>Active Projects</span>
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold">{stats?.projectsCount ?? 0}</div>
              <p className="text-[11px] text-muted">Across all platform users</p>
            </div>

            <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
              <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
                <span>Runs Last 24h</span>
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-bold text-accent">{stats?.runsLast24h ?? 0}</div>
              <p className="text-[11px] text-muted">{stats?.runsTotal ?? 0} lifetime runs</p>
            </div>

            <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
              <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
                <span>Duplicate Deliveries</span>
                <Copy className="w-4 h-4 text-ok" />
              </div>
              <div className="text-2xl font-bold text-ok">{stats?.duplicatesCount ?? 0}</div>
              <p className="text-[11px] text-muted">Idempotently deduplicated</p>
            </div>

            <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
              <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
                <span>Rejected Deliveries</span>
                <AlertTriangle className="w-4 h-4 text-sev-breaking" />
              </div>
              <div className="text-2xl font-bold text-sev-breaking">
                {stats?.rejectedCount ?? 0}
              </div>
              <p className="text-[11px] text-muted">Invalid HMAC signatures</p>
            </div>
          </div>

          {/* Runs Status Breakdown */}
          <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-accent" />
              <span>Runs Distribution by Status</span>
            </h2>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-surface-2 border border-border rounded">
                <div className="text-xs text-muted">Queued</div>
                <div className="text-lg font-bold">{stats?.runsByStatus?.queued ?? 0}</div>
              </div>
              <div className="p-3 bg-surface-2 border border-border rounded">
                <div className="text-xs text-accent">Running</div>
                <div className="text-lg font-bold text-accent">
                  {stats?.runsByStatus?.running ?? 0}
                </div>
              </div>
              <div className="p-3 bg-surface-2 border border-border rounded">
                <div className="text-xs text-ok">Completed</div>
                <div className="text-lg font-bold text-ok">
                  {stats?.runsByStatus?.completed ?? 0}
                </div>
              </div>
              <div className="p-3 bg-surface-2 border border-border rounded">
                <div className="text-xs text-sev-breaking">Failed</div>
                <div className="text-lg font-bold text-sev-breaking">
                  {stats?.runsByStatus?.failed ?? 0}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
