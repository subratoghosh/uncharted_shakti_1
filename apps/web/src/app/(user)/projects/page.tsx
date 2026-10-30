'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/shared/SkeletonRow';
import { formatDate } from '@/lib/format';
import { Plus, GitBranch, FileCode } from 'lucide-react';
import type { Project } from '@shaktiq/shared';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [specPath, setSpecPath] = useState('openapi.yaml');
  const [formError, setFormError] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.projects.list(),
  });

  const createMutation = useMutation({
    mutationFn: (newProject: {
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
      specPath: string;
    }) => apiClient.projects.create(newProject),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setName('');
      setRepositoryUrl('');
      setDefaultBranch('main');
      setSpecPath('openapi.yaml');
      setFormError('');
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create project');
    },
  });

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!repositoryUrl.startsWith('https://github.com/')) {
      setFormError('Repository URL must begin with https://github.com/');
      return;
    }
    createMutation.mutate({ name, repositoryUrl, defaultBranch, specPath });
  }

  const projects: Project[] = data?.ok && Array.isArray(data.data) ? data.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text)]">Projects</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            OpenAPI spec repositories monitored for breaking changes
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span>New project</span>
        </button>
      </div>

      {showCreate && (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-base font-semibold text-[var(--text)]">Register New Project</h2>
          {formError && (
            <div role="alert" className="sev-breaking-bg rounded px-3 py-2 text-xs text-[var(--sev-breaking)]">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="name" className="text-xs font-medium text-[var(--text)]">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Orders API"
                className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="repo" className="text-xs font-medium text-[var(--text)]">
                Repository URL
              </label>
              <input
                id="repo"
                type="url"
                required
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="branch" className="text-xs font-medium text-[var(--text)]">
                Default branch
              </label>
              <input
                id="branch"
                type="text"
                required
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="spec" className="text-xs font-medium text-[var(--text)]">
                Spec path
              </label>
              <input
                id="spec"
                type="text"
                required
                value={specPath}
                onChange={(e) => setSpecPath(e.target.value)}
                className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="h-9 px-3 rounded border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 px-4 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error ? (
        <ErrorState
          code="FETCH_ERROR"
          message={error instanceof Error ? error.message : 'Failed to load projects'}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Register your first repository to begin automated breaking-change detection."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span>Create project</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              data-testid="project-card"
              className="block rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--text-muted)] transition-all space-y-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">{proj.name}</h2>
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{proj.fullName}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" aria-hidden />
                  <span className="font-mono">{proj.defaultBranch}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5" aria-hidden />
                  <span className="font-mono truncate">{proj.specPath}</span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] pt-1">
                Added {formatDate(proj.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
