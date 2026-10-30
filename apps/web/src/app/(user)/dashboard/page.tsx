'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { formatDate } from '../../../lib/format';
import { FolderGit2, Plus, ArrowRight, ShieldCheck, Layers, GitBranch } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  specPath: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient<Project[]>('/projects'),
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted">
            Continuous API compatibility and breaking change detection
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-sm text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Monitored Projects</span>
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{loadingProjects ? '...' : projects.length}</div>
          <p className="text-xs text-muted">Tracked GitHub repositories</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Deterministic Diff Engine</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-ok">Active</div>
          <p className="text-xs text-muted">oasdiff 3.0/3.1 analyzer engine</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Release Gate Status</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-accent">Enforced</div>
          <p className="text-xs text-muted">Automated PR checks & VS Code sync</p>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-base">Your Projects</h2>
          <Link
            href="/projects"
            className="text-xs text-accent hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {loadingProjects ? (
            <div className="p-8 text-center text-sm text-muted">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FolderGit2 className="w-8 h-8 text-muted mx-auto opacity-50" />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">No projects registered yet</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Register your OpenAPI specification repository to start detecting breaking changes
                  automatically.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-sm text-xs font-semibold hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register First Project</span>
              </Link>
            </div>
          ) : (
            projects.map(p => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors block"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{p.name}</span>
                    <span className="text-xs font-mono text-muted">({p.fullName})</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted font-mono">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {p.defaultBranch}
                    </span>
                    <span>Spec: {p.specPath}</span>
                  </div>
                </div>
                <div className="text-xs text-muted">Added {formatDate(p.createdAt)}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
