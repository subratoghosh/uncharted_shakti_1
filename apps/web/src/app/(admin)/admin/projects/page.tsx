'use client';

// app/(admin)/admin/projects/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { Pagination } from '@/components/shared/Pagination';
import { formatDate } from '@/lib/format';
import type { Project } from '@shaktiq/shared';

const LIMIT = 20;

export default function AdminProjectsPage() {
  const [page, setPage] = useState(1);

  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'projects', page],
    queryFn: () => apiClient.admin.projects({ page, limit: LIMIT }),
  });

  const projects: Project[] = res?.ok ? res.data : [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--text)]">All Projects</h1>

      {error ? (
        <ErrorState message="Failed to load projects." onRetry={() => refetch()} />
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Full Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Owner
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Default Branch
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Spec Path
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
                  >
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows cols={6} rows={8} />
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="No projects found"
                        description="No projects have been created yet."
                      />
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="h-10 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <td className="px-3 py-2 text-sm text-[var(--text)] font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {project.fullName ?? project.repositoryUrl ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-[var(--text-muted)]">
                        {project.owner ?? project.ownerUserId ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-sm text-[var(--text-muted)]">
                        {project.defaultBranch ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {project.specPath ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-[var(--text-muted)] whitespace-nowrap">
                        {project.createdAt ? formatDate(project.createdAt) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!error && (
        <Pagination
          page={page}
          total={projects.length < LIMIT ? (page - 1) * LIMIT + projects.length : page * LIMIT + 1}
          limit={LIMIT}
          onPage={setPage}
        />
      )}
    </div>
  );
}
