'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { EndpointTag } from '@/components/shared/EndpointTag';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard, SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate, shortSha } from '@/lib/format';
import { Play, GitCompare, Flame, ArrowRight } from 'lucide-react';
import type { Project, Run, HotspotEndpoint } from '@shaktiq/shared';

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  const { data: projectRes, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.projects.get(projectId),
  });

  const { data: runsRes, isLoading: runsLoading } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => apiClient.runs.listForProject(projectId, { limit: 5 }),
  });

  const { data: hotspotsRes, isLoading: hotspotsLoading } = useQuery({
    queryKey: ['hotspots', projectId],
    queryFn: () => apiClient.memory.hotspots(projectId),
  });

  const project: Project | null = projectRes?.ok ? projectRes.data : null;
  const runs: Run[] = runsRes?.ok && Array.isArray(runsRes.data) ? runsRes.data : [];
  const hotspots: HotspotEndpoint[] = hotspotsRes?.ok && Array.isArray(hotspotsRes.data) ? hotspotsRes.data : [];
  const latestRun = runs[0] ?? null;

  if (projectError) {
    return (
      <ErrorState
        code="NOT_FOUND"
        message="Could not load project."
        onRetry={() => router.push('/projects')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-1">
            <Link href="/projects" className="hover:underline">Projects</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[var(--text)] font-medium">
              {projectLoading ? '…' : project?.name}
            </span>
          </nav>
          <h1 className="text-h2 font-semibold text-[var(--text)]">
            {projectLoading ? 'Loading…' : project?.name}
          </h1>
          {project && (
            <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
              {project.fullName} · {project.defaultBranch} · {project.specPath}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${projectId}/compare`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <GitCompare className="h-4 w-4" aria-hidden />
            <span>Compare</span>
          </Link>
          <Link
            href={`/projects/${projectId}/runs/new`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <Play className="h-4 w-4" aria-hidden />
            <span>Run analysis</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {runsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Latest Status"
              value={latestRun ? latestRun.summary?.releaseStatus ?? latestRun.status : 'None'}
              sub={latestRun ? `Run ${shortSha(latestRun.currentVersion)}` : 'No runs yet'}
            />
            <KpiCard
              label="Breaking Changes"
              value={latestRun?.summary?.breaking ?? 0}
              sub="Latest release"
            />
            <KpiCard
              label="Warnings"
              value={latestRun?.summary?.warning ?? 0}
              sub="Latest release"
            />
            <KpiCard
              label="Total Runs"
              value={runs.length}
              sub="Monitored versions"
            />
          </>
        )}
      </div>

      {/* Recent runs table */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text)]">Recent Runs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
              <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th scope="col" className="px-4">Status</th>
                <th scope="col" className="px-4">Version</th>
                <th scope="col" className="px-4">Source</th>
                <th scope="col" className="px-4 text-right">Breaking</th>
                <th scope="col" className="px-4 text-right">Warnings</th>
                <th scope="col" className="px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {runsLoading ? (
                <SkeletonRows cols={6} rows={3} />
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      title="No runs yet"
                      description="Run your first analysis to see breaking-change detections here."
                      action={
                        <Link
                          href={`/projects/${projectId}/runs/new`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90"
                        >
                          Run first analysis
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

      {/* Endpoint hotspots card (Project memory) */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
          <Flame className="h-4 w-4 text-[var(--sev-warning)]" aria-hidden />
          <h2 className="text-sm font-semibold text-[var(--text)]">Endpoint Hotspots (Memory)</h2>
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            Endpoints with recurring breaking changes (≥2 distinct runs)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
              <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th scope="col" className="px-4">Endpoint</th>
                <th scope="col" className="px-4 text-right">Occurrences</th>
                <th scope="col" className="px-4 text-right">Distinct Runs</th>
                <th scope="col" className="px-4">Last Seen</th>
                <th scope="col" className="px-4">Recurring Change Types</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {hotspotsLoading ? (
                <SkeletonRows cols={5} rows={3} />
              ) : hotspots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState
                      title="No hotspots detected"
                      description="No endpoints have multiple breaking changes across runs yet."
                    />
                  </td>
                </tr>
              ) : (
                hotspots.map((hs, i) => (
                  <tr key={i} className="h-10 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-4 whitespace-nowrap">
                      <EndpointTag method={hs.method} path={hs.endpoint} />
                    </td>
                    <td className="px-4 text-right font-mono text-xs whitespace-nowrap">
                      {hs.occurrences}
                    </td>
                    <td className="px-4 text-right font-mono text-xs font-semibold text-[var(--sev-warning)] whitespace-nowrap">
                      {hs.distinctRuns}
                    </td>
                    <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDate(hs.lastSeen)}
                    </td>
                    <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {hs.changeTypes?.join(', ') || '—'}
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
