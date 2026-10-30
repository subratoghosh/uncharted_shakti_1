'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { KpiCard } from '@/components/shared/KpiCard';
import { SkeletonCard } from '@/components/shared/SkeletonRow';
import { ErrorState } from '@/components/shared/ErrorState';
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

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)] mb-6">Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !projectsRes?.ok) {
    return (
      <div>
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Overview</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Welcome back. Here is a summary of your ShaktIQ workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total Projects"
          value={totalProjects}
          href="/projects"
        />
        <KpiCard
          label="Total Runs"
          value={runsLoading ? '—' : (totalRunsData ?? 0)}
          sub="Across all projects"
        />
        <KpiCard
          label="Active Projects"
          value={totalProjects}
          sub="With at least one run"
        />
        <KpiCard
          label="Workspace"
          value="ShaktIQ"
          sub="API compatibility"
        />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 rounded"
          >
            View all
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No projects yet.{' '}
            <Link href="/projects" className="text-[var(--accent)] hover:underline">
              Create your first project
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2" role="list">
            {projects.slice(0, 5).map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{project.name}</p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{project.fullName}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {project.defaultBranch}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
