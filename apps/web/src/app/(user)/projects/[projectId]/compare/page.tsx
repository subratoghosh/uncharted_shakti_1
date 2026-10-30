'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../../lib/api-client';
import { SeverityBadge } from '../../../../../components/shared/SeverityBadge';
import { EndpointTag } from '../../../../../components/shared/EndpointTag';
import { formatShortSha } from '../../../../../lib/format';
import { ArrowLeft, GitCompare } from 'lucide-react';

type Run = {
  id: string;
  previousVersion: string;
  currentVersion: string;
  createdAt: string;
};

type CompareFinding = {
  id: string;
  endpoint: string;
  method: string;
  changeType: string;
  severity: string;
  description: string;
  diffStatus: 'new' | 'resolved' | 'unresolved';
};

export default function CompareRunsPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const projectId = params.projectId;

  const initialBase = searchParams.get('base') || '';
  const initialHead = searchParams.get('head') || '';

  const [baseRunId, setBaseRunId] = useState(initialBase);
  const [headRunId, setHeadRunId] = useState(initialHead);
  const [activeTab, setActiveTab] = useState<'new' | 'resolved' | 'unresolved'>('new');

  const { data: runs = [] } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => apiClient<Run[]>(`/projects/${projectId}/runs`),
  });

  const { data: compareResults = [], isLoading } = useQuery({
    queryKey: ['compare', projectId, baseRunId, headRunId],
    queryFn: () =>
      apiClient<CompareFinding[]>(
        `/projects/${projectId}/compare?base=${encodeURIComponent(baseRunId)}&head=${encodeURIComponent(
          headRunId,
        )}`,
      ),
    enabled: Boolean(baseRunId && headRunId && baseRunId !== headRunId),
  });

  const newFindings = compareResults.filter(f => f.diffStatus === 'new');
  const resolvedFindings = compareResults.filter(f => f.diffStatus === 'resolved');
  const unresolvedFindings = compareResults.filter(f => f.diffStatus === 'unresolved');

  const displayedFindings =
    activeTab === 'new'
      ? newFindings
      : activeTab === 'resolved'
        ? resolvedFindings
        : unresolvedFindings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-accent" />
            <span>Run-to-Run Comparison</span>
          </h1>
          <p className="text-sm text-muted">Diff findings between two historical analysis runs</p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-surface border border-border rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text">Base Run</label>
          <select
            value={baseRunId}
            onChange={e => setBaseRunId(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent font-mono"
          >
            <option value="">Select Base Run...</option>
            {runs.map(r => (
              <option key={r.id} value={r.id}>
                Run #{formatShortSha(r.id)} ({formatShortSha(r.currentVersion)})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text">Head Run</label>
          <select
            value={headRunId}
            onChange={e => setHeadRunId(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent font-mono"
          >
            <option value="">Select Head Run...</option>
            {runs.map(r => (
              <option key={r.id} value={r.id}>
                Run #{formatShortSha(r.id)} ({formatShortSha(r.currentVersion)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff Tabs & Findings */}
      <div className="bg-surface border border-border rounded-lg">
        {/* Tabs */}
        <div className="flex items-center border-b border-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 ${
              activeTab === 'new'
                ? 'border-sev-breaking text-sev-breaking'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <span>New Findings</span>
            <span className="px-1.5 py-0.2 rounded-full bg-sev-breaking/10 text-sev-breaking">
              {newFindings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 ${
              activeTab === 'resolved'
                ? 'border-ok text-ok'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <span>Resolved Findings</span>
            <span className="px-1.5 py-0.2 rounded-full bg-ok/10 text-ok">
              {resolvedFindings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unresolved')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 ${
              activeTab === 'unresolved'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <span>Unresolved Findings</span>
            <span className="px-1.5 py-0.2 rounded-full bg-accent/10 text-accent">
              {unresolvedFindings.length}
            </span>
          </button>
        </div>

        {/* Findings List */}
        <div className="p-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted">
              Calculating diff aggregation...
            </div>
          ) : !baseRunId || !headRunId ? (
            <div className="p-8 text-center text-sm text-muted">
              Select two runs above to compute differences.
            </div>
          ) : displayedFindings.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              No findings in the {activeTab} category.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayedFindings.map(f => (
                <div key={f.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      <EndpointTag method={f.method} endpoint={f.endpoint} />
                    </div>
                    <div className="text-xs text-text">{f.description}</div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                    {f.changeType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
