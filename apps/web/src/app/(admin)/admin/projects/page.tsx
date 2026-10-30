'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { formatDate } from '../../../../lib/format';
import { GitBranch, ArrowRight } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  fullName: string;
  repositoryUrl: string;
  defaultBranch: string;
  specPath: string;
  ownerUserId: string;
  createdAt: string;
};

export default function AdminProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => apiClient<Project[]>('/admin/projects'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Registered Projects</h1>
        <p className="text-sm text-muted">Platform-wide overview of all monitored repositories</p>
      </div>

      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Repositories ({projects.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Project Name</th>
                <th className="p-3">Repository</th>
                <th className="p-3">Default Branch</th>
                <th className="p-3">Spec Path</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    No projects registered on the platform.
                  </td>
                </tr>
              ) : (
                projects.map(p => (
                  <tr key={p.id} className="hover:bg-surface-2 transition-colors">
                    <td className="p-3 font-semibold text-text">{p.name}</td>
                    <td className="p-3 font-mono text-muted">{p.fullName}</td>
                    <td className="p-3 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-muted" />
                        {p.defaultBranch}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted">{p.specPath}</td>
                    <td className="p-3 text-muted">{formatDate(p.createdAt)}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
