'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { FolderGit2, Plus, GitBranch, X } from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { Skeleton } from '../../../components/common/Skeleton';
import { OpenApiGuidanceCard } from '../../../components/shared/OpenApiGuidanceCard';

type Project = {
  id: string;
  name: string;
  fullName: string;
  repositoryUrl: string;
  defaultBranch: string;
  specPath: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [specPath, setSpecPath] = useState('openapi.yaml');
  const [error, setError] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient<Project[]>('/projects'),
  });

  const createMutation = useMutation({
    mutationFn: (newProject: {
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
      specPath: string;
    }) =>
      apiClient<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setName('');
      setRepositoryUrl('');
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({ name, repositoryUrl, defaultBranch, specPath });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-green-dark">Projects</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-dark text-butter-cream rounded-xl text-xs font-bold hover:bg-green-deep transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-surface border border-border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 w-2/3">
                  <Skeleton className="h-5 w-44" rounded="md" />
                  <Skeleton className="h-3 w-32" rounded="sm" />
                </div>
                <Skeleton className="h-5 w-16" rounded="sm" />
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <Skeleton className="h-4 w-20" rounded="sm" />
                <Skeleton className="h-4 w-28" rounded="sm" />
                <Skeleton className="h-4 w-24 ml-auto" rounded="sm" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-white shadow-xs space-y-4">
          <FolderGit2 className="w-8 h-8 text-green-mid mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-green-dark">No projects found</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-dark text-butter-cream rounded-xl text-xs font-bold hover:bg-green-deep transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="p-5 bg-surface border border-border rounded-lg hover:border-accent/40 transition-colors space-y-3 block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base leading-snug">{p.name}</h3>
                  <div className="text-xs font-mono text-muted">{p.fullName}</div>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border">
                  GitHub
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted font-mono pt-2 border-t border-border">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  {p.defaultBranch}
                </span>
                <span>File: {p.specPath}</span>
                <span className="ml-auto text-[11px] font-sans">{formatDate(p.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal: New Project */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Register New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-text p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text">GitHub Repository URL</label>
                <input
                  type="url"
                  required
                  value={repositoryUrl}
                  onChange={e => setRepositoryUrl(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text">Default Branch</label>
                  <input
                    type="text"
                    required
                    value={defaultBranch}
                    onChange={e => setDefaultBranch(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text">Spec / Route Path</label>
                    <span className="text-[10px] text-muted">Auto-detected if blank</span>
                  </div>
                  <input
                    type="text"
                    placeholder="openapi.yaml (or auto-detect)"
                    value={specPath}
                    onChange={e => setSpecPath(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Guidance Card for OpenAPI spec */}
              <OpenApiGuidanceCard compact />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-butter-warm text-green-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-green-dark text-butter-cream rounded-xl text-xs font-bold hover:bg-green-deep disabled:opacity-50 transition-all shadow-xs"
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
