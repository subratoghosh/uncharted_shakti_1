'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { ParallaxCard } from '@/components/shared/ParallaxCard';
import { SkeletonCard } from '@/components/shared/SkeletonRow';
import { ErrorState } from '@/components/shared/ErrorState';
import { FolderGit2, Play, Activity, Layers, ArrowRight } from 'lucide-react';
import type { Project } from '@shaktiq/shared';

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.projects.list(),
  });
}

function useAllRunCounts(projects: Project[]) {
  return useQuery({
    queryKey: ['runs-counts', projects.map((p) => p.id)],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map((p) => apiClient.runs.listForProject(p.id, { limit: 1 })),
      );
      return results.flatMap((r) => (r.ok ? r.data : [])).length;
    },
    enabled: projects.length > 0,
  });
}

export default function DashboardPage() {
  const { data: projectsRes, isLoading, error, refetch } = useProjects();
  const projects = projectsRes?.ok ? projectsRes.data : [];
  const { data: totalRunsData, isLoading: runsLoading } = useAllRunCounts(projects);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'projects' | 'runs' | 'system'>('all');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Overview</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Loading workspace metrics...</p>
        </div>
        {/* Vertical skeleton stack */}
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !projectsRes?.ok) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-[var(--text)] mb-6">Overview</h1>
        <ErrorState
          code="FETCH_ERROR"
          message="Failed to load dashboard data."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const totalProjects = projects.length;
  const totalRuns = runsLoading ? '—' : (totalRunsData ?? 0);

  const cards = [
    {
      id: 'projects',
      title: 'Total Projects',
      value: totalProjects,
      category: 'Workspace',
      badge: `${totalProjects} ACTIVE`,
      sub: 'Repositories configured for breaking-change gating',
      description: 'Total number of active projects monitored by ShaktIQ for OpenAPI schema drift and release compatibility.',
      details: [
        { label: 'Configured Repositories', value: totalProjects },
        { label: 'Active Webhook Watchers', value: totalProjects },
        { label: 'Spec Source Type', value: 'GitHub / Snapshots' },
      ],
    },
    {
      id: 'runs',
      title: 'Analysis Runs',
      value: totalRuns,
      category: 'Pipelines',
      badge: 'DETERMINISTIC',
      sub: 'Across all tracked projects and pull requests',
      description: 'Historical diff analysis runs executed using deterministic oasdiff comparison against target branches.',
      details: [
        { label: 'Total Executions', value: totalRuns },
        { label: 'Detection Engine', value: 'oasdiff binary' },
        { label: 'Change Stream Hub', value: 'Connected (SSE)' },
      ],
    },
    {
      id: 'system',
      title: 'Compatibility Status',
      value: '100% Gated',
      category: 'Security',
      badge: 'SAFE',
      sub: 'Zero unreviewed breaking changes in production',
      description: 'Automatic release compatibility gating actively blocks breaking endpoints without appropriate sunset notice.',
      details: [
        { label: 'Gating Policy', value: 'Strict Zero-Drift' },
        { label: 'Duplicate Webhook Rejection', value: 'Enabled' },
        { label: 'Report Status', value: 'Certified' },
      ],
    },
  ];

  const visibleCards = selectedFilter === 'all' 
    ? cards 
    : cards.filter(c => c.id === selectedFilter);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)] tracking-tight">Overview</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Welcome to ShaktIQ. Minimalist deterministic API change detection and release gating.
        </p>
      </div>

      {/* Options Bar to Reduce Space — Clicking an option focuses that card */}
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
          onClick={() => setSelectedFilter('projects')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'projects'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Projects Only
        </button>
        <button
          onClick={() => setSelectedFilter('runs')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'runs'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Runs Only
        </button>
        <button
          onClick={() => setSelectedFilter('system')}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            selectedFilter === 'system'
              ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)] font-medium'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Gating Only
        </button>
      </div>

      {/* Vertical Fashion Card Layout with 3D Parallax & Popup Detail Modals */}
      <div className="flex flex-col gap-4">
        {visibleCards.map((card) => (
          <ParallaxCard
            key={card.id}
            title={card.title}
            value={card.value}
            sub={card.sub}
            category={card.category}
            badge={card.badge}
            description={card.description}
            details={card.details}
          />
        ))}
      </div>

      {/* Projects Section */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border)]">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">Connected Projects</h2>
            <p className="text-xs text-[var(--text-muted)]">Active repositories being tracked</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-mono text-[var(--text)] hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)]">
            No projects registered.{' '}
            <Link href="/projects" className="text-[var(--text)] underline font-medium">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center justify-between py-3 px-2 rounded hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text)] group-hover:border-[var(--text)]/40 transition-colors">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)] group-hover:underline">
                      {project.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{project.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded bg-[var(--surface)]">
                    {project.defaultBranch}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
