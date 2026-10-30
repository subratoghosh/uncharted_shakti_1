'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { ReleaseVerdictBanner } from '../../../../components/shared/ReleaseVerdictBanner';
import { EndpointTag } from '../../../../components/shared/EndpointTag';
import { formatDate, formatShortSha } from '../../../../lib/format';
import { Play, GitBranch, Flame, ArrowRight, GitCompare, Upload, X, History } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  specPath: string;
};

type Run = {
  id: string;
  projectId: string;
  source: string;
  branch?: string;
  status: string;
  previousVersion: string;
  currentVersion: string;
  createdAt: string;
  summary?: {
    total: number;
    breaking: number;
    warning: number;
    info: number;
    releaseStatus: 'safe' | 'review' | 'blocked';
  };
};

type Hotspot = {
  _id: { method: string; endpoint: string };
  occurrences: number;
  distinctRuns: number;
  lastSeen: string;
  changeTypes: string[];
};

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const queryClient = useQueryClient();

  const [showRunModal, setShowRunModal] = useState(false);
  const [baseSpec, setBaseSpec] = useState('');
  const [headSpec, setHeadSpec] = useState('');
  const [baseRef, setBaseRef] = useState('HEAD~1');
  const [headRef, setHeadRef] = useState('HEAD');
  const [modalMode, setModalMode] = useState<'text' | 'ref'>('text');
  const [runError, setRunError] = useState<string | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient<Project>(`/projects/${projectId}`),
  });

  const { data: runs = [], isLoading: loadingRuns } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => apiClient<Run[]>(`/projects/${projectId}/runs`),
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots', projectId],
    queryFn: () => apiClient<Hotspot[]>(`/projects/${projectId}/memory/hotspots`),
  });

  const runMutation = useMutation({
    mutationFn: (body: {
      baseSpec?: string;
      headSpec?: string;
      baseRef?: string;
      headRef?: string;
    }) =>
      apiClient<Run>(`/projects/${projectId}/runs`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs', projectId] });
      setShowRunModal(false);
      setRunError(null);
    },
    onError: (err: Error) => {
      setRunError(err.message || 'Failed to trigger analysis run');
    },
  });

  const handleTriggerRun = (e: React.FormEvent) => {
    e.preventDefault();
    setRunError(null);

    if (modalMode === 'text') {
      if (!headSpec.trim()) {
        setRunError('Please provide head specification content.');
        return;
      }
      runMutation.mutate({
        baseSpec: baseSpec || undefined,
        headSpec,
      });
    } else {
      runMutation.mutate({
        baseRef,
        headRef,
      });
    }
  };

  const latestRun = runs[0];
  const totalBreaking = runs.reduce((acc, r) => acc + (r.summary?.breaking || 0), 0);
  const totalWarnings = runs.reduce((acc, r) => acc + (r.summary?.warning || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {project?.name || 'Project Overview'}
            </h1>
            <span className="text-xs font-mono text-muted">({project?.fullName})</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted font-mono mt-1">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              {project?.defaultBranch || 'main'}
            </span>
            <span>Spec: {project?.specPath}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {runs.length >= 2 && (
            <Link
              href={`/projects/${projectId}/compare?base=${runs[1]?.id}&head=${runs[0]?.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface text-text rounded-sm text-xs font-medium hover:bg-surface-2"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Runs</span>
            </Link>
          )}

          <button
            onClick={() => setShowRunModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-sm text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Trigger Analysis</span>
          </button>
        </div>
      </div>

      {/* Latest Verdict Banner */}
      {latestRun && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Latest Release Verdict (Run #{formatShortSha(latestRun.id)})
          </div>
          <ReleaseVerdictBanner status={latestRun.summary?.releaseStatus || 'safe'} />
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Latest Verdict
          </div>
          <div className="text-xl font-bold capitalize">
            {latestRun?.summary?.releaseStatus || 'Safe'}
          </div>
          <p className="text-[11px] text-muted">Based on configured checks</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Breaking Changes
          </div>
          <div
            className={`text-xl font-bold ${totalBreaking > 0 ? 'text-sev-breaking' : 'text-ok'}`}
          >
            {totalBreaking}
          </div>
          <p className="text-[11px] text-muted">Across analyzed runs</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Warning Changes
          </div>
          <div
            className={`text-xl font-bold ${totalWarnings > 0 ? 'text-sev-warning' : 'text-text'}`}
          >
            {totalWarnings}
          </div>
          <p className="text-[11px] text-muted">Potentially breaking</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-lg space-y-1">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Total Runs
          </div>
          <div className="text-xl font-bold">{runs.length}</div>
          <p className="text-[11px] text-muted">GitHub, Manual & VS Code</p>
        </div>
      </div>

      {/* Hotspots Card (Project Memory) */}
      {hotspots.length > 0 && (
        <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-sev-warning">
            <Flame className="w-4 h-4" />
            <span>Endpoint Hotspots (Recurring Breaking Changes)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hotspots.map(h => (
              <div
                key={h._id.method + h._id.endpoint}
                className="p-3 bg-surface-2 border border-border rounded-sm flex items-center justify-between text-xs"
              >
                <EndpointTag method={h._id.method} endpoint={h._id.endpoint} />
                <div className="text-muted text-[11px] text-right">
                  <span className="font-semibold text-sev-breaking">{h.occurrences} breaking</span>{' '}
                  across <span className="font-semibold text-text">{h.distinctRuns} runs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Runs Table */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <History className="w-4 h-4 text-muted" />
            <span>Analysis Runs History</span>
          </h2>
          <span className="text-xs text-muted">{runs.length} runs total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Run ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source</th>
                <th className="p-3">Versions / Commit</th>
                <th className="p-3 text-right">Findings</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingRuns ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading runs...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No runs recorded yet. Push a commit or trigger a manual analysis above.
                  </td>
                </tr>
              ) : (
                runs.map(r => (
                  <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                    <td className="p-3 font-mono font-medium text-accent">
                      <Link href={`/runs/${r.id}`}>{formatShortSha(r.id)}</Link>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-1.5 py-0.5 rounded text-[10px] bg-surface-2 border border-border">
                        {r.source}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted">
                      {formatShortSha(r.previousVersion)} &rarr; {formatShortSha(r.currentVersion)}
                    </td>
                    <td className="p-3 text-right">
                      {r.summary ? (
                        <div className="inline-flex items-center gap-1 font-semibold">
                          <span
                            className={r.summary.breaking > 0 ? 'text-sev-breaking' : 'text-muted'}
                          >
                            {r.summary.breaking}B
                          </span>
                          <span>/</span>
                          <span
                            className={r.summary.warning > 0 ? 'text-sev-warning' : 'text-muted'}
                          >
                            {r.summary.warning}W
                          </span>
                          <span>/</span>
                          <span className="text-muted">{r.summary.info}I</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-muted">{formatDate(r.createdAt)}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/runs/${r.id}`}
                        className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                      >
                        <span>View</span>
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

      {/* Modal: Trigger Manual Analysis */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Trigger Manual Analysis</h2>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-muted hover:text-text p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
              <button
                onClick={() => setModalMode('text')}
                className={`pb-1 px-1 border-b-2 ${
                  modalMode === 'text'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted'
                }`}
              >
                Direct YAML Input
              </button>
              <button
                onClick={() => setModalMode('ref')}
                className={`pb-1 px-1 border-b-2 ${
                  modalMode === 'ref'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted'
                }`}
              >
                Git Ref Comparison
              </button>
            </div>

            {runError && (
              <div className="p-3 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded">
                {runError}
              </div>
            )}

            <form onSubmit={handleTriggerRun} className="space-y-4">
              {modalMode === 'text' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text">
                      Base OpenAPI Spec (YAML)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste base OpenAPI 3.x spec..."
                      value={baseSpec}
                      onChange={e => setBaseSpec(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text">
                      Head OpenAPI Spec (YAML) *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Paste modified OpenAPI 3.x spec to analyze..."
                      value={headSpec}
                      onChange={e => setHeadSpec(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text">Base Ref / Branch</label>
                    <input
                      type="text"
                      value={baseRef}
                      onChange={e => setBaseRef(e.target.value)}
                      className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text">Head Ref / Branch</label>
                    <input
                      type="text"
                      value={headRef}
                      onChange={e => setHeadRef(e.target.value)}
                      className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-3 py-1.5 border border-border rounded-sm text-xs font-medium hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={runMutation.isPending}
                  className="px-4 py-1.5 bg-accent text-white rounded-sm text-xs font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{runMutation.isPending ? 'Starting Run...' : 'Run Analysis'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
