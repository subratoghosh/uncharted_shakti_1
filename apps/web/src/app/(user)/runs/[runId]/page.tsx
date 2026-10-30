'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { SeverityBadge } from '../../../../components/shared/SeverityBadge';
import { ReleaseVerdictBanner } from '../../../../components/shared/ReleaseVerdictBanner';
import { EndpointTag } from '../../../../components/shared/EndpointTag';
import { formatDate, formatShortSha } from '../../../../lib/format';
import { ArrowLeft, FileText, GitBranch, History, Bot, X, Search, Filter } from 'lucide-react';

type Finding = {
  id: string;
  fingerprint: string;
  endpoint: string;
  method: string;
  changeType: string;
  severity: 'breaking' | 'warning' | 'info';
  ruleId: string;
  description: string;
  impact: string;
  recommendation: string;
  locationText?: string;
  aiExplanation?: string;
};

type Run = {
  id: string;
  projectId: string;
  eventId: string;
  source: string;
  branch?: string;
  commitId?: string;
  previousVersion: string;
  currentVersion: string;
  status: string;
  createdAt: string;
  summary?: {
    total: number;
    breaking: number;
    warning: number;
    info: number;
    releaseStatus: 'safe' | 'review' | 'blocked';
    newCount: number;
    resolvedCount: number;
    unresolvedCount: number;
  };
  aiStatus?: string;
  aiSummary?: string;
};

type EndpointHistoryItem = {
  id: string;
  runId: string;
  severity: string;
  changeType: string;
  description: string;
  createdAt: string;
};

export default function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'breaking' | 'warning' | 'info'>(
    'all',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { data: run, isLoading: loadingRun } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => apiClient<Run>(`/runs/${runId}`),
  });

  const { data: findings = [], isLoading: loadingFindings } = useQuery({
    queryKey: ['run-findings', runId],
    queryFn: () => apiClient<Finding[]>(`/runs/${runId}/findings`),
  });

  const { data: endpointHistory = [] } = useQuery({
    queryKey: [
      'endpoint-history',
      run?.projectId,
      selectedFinding?.method,
      selectedFinding?.endpoint,
    ],
    queryFn: () =>
      apiClient<EndpointHistoryItem[]>(
        `/projects/${run?.projectId}/memory/endpoint?method=${encodeURIComponent(
          selectedFinding?.method || '',
        )}&path=${encodeURIComponent(selectedFinding?.endpoint || '')}`,
      ),
    enabled: Boolean(run?.projectId && selectedFinding),
  });

  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.endpoint.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.changeType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loadingRun) {
    return <div className="p-12 text-center text-sm text-muted">Loading run details...</div>;
  }

  if (!run) {
    return <div className="p-12 text-center text-sm text-muted">Run not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/projects/${run.projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project</span>
        </Link>

        <Link
          href={`/runs/${runId}/report`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface text-text rounded-sm text-xs font-medium hover:bg-surface-2 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Printable Report</span>
        </Link>
      </div>

      {/* Run Metadata Header */}
      <div className="p-5 bg-surface border border-border rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">Run #{formatShortSha(run.id)}</h1>
              <StatusBadge status={run.status} />
              <span className="capitalize px-1.5 py-0.5 rounded text-[10px] bg-surface-2 border border-border">
                {run.source}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted">
              {run.branch && (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {run.branch}
                </span>
              )}
              {run.commitId && <span>Commit: {formatShortSha(run.commitId)}</span>}
              <span>Created: {formatDate(run.createdAt)}</span>
            </div>
          </div>

          <div className="text-xs font-mono text-muted bg-surface-2 p-2.5 rounded border border-border">
            <div>Base: {formatShortSha(run.previousVersion)}</div>
            <div>Head: {formatShortSha(run.currentVersion)}</div>
          </div>
        </div>

        {/* Verdict Banner */}
        <ReleaseVerdictBanner status={run.summary?.releaseStatus || 'safe'} />

        {/* AI Summary Banner if present */}
        {run.aiSummary && (
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Summary (Generated via Claude)</span>
            </div>
            <p className="text-text opacity-90">{run.aiSummary}</p>
          </div>
        )}
      </div>

      {/* Findings Section */}
      <div className="bg-surface border border-border rounded-lg">
        {/* Filters bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <span className="font-semibold text-sm">Findings ({filteredFindings.length})</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent w-48"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded border border-border text-xs">
              {(['all', 'breaking', 'warning', 'info'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 rounded-xs capitalize ${
                    severityFilter === sev
                      ? 'bg-surface font-semibold text-text shadow-xs'
                      : 'text-muted'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Findings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Method & Endpoint</th>
                <th className="p-3">Change Type</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingFindings ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    Loading findings...
                  </td>
                </tr>
              ) : filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No findings matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="p-3">
                      <EndpointTag method={f.method} endpoint={f.endpoint} />
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted">{f.changeType}</td>
                    <td className="p-3 max-w-md truncate">{f.description}</td>
                    <td className="p-3 text-right">
                      <button className="text-accent hover:underline font-medium">Inspect</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finding Detail Side Drawer */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-surface border-l border-border w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selectedFinding.severity} />
                <span className="font-mono text-xs text-muted">{selectedFinding.ruleId}</span>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-muted hover:text-text p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Endpoint */}
            <div className="space-y-1">
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">
                Target Endpoint
              </div>
              <EndpointTag method={selectedFinding.method} endpoint={selectedFinding.endpoint} />
            </div>

            {/* Change Type & Description */}
            <div className="space-y-1">
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">
                Description
              </div>
              <div className="font-medium text-sm">{selectedFinding.description}</div>
              <div className="text-xs font-mono text-muted">{selectedFinding.changeType}</div>
            </div>

            {/* Impact */}
            <div className="p-3 bg-surface-2 border border-border rounded space-y-1">
              <div className="text-xs font-semibold text-sev-breaking uppercase tracking-wider">
                Consumer Impact
              </div>
              <div className="text-xs text-text opacity-90">{selectedFinding.impact}</div>
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-surface-2 border border-border rounded space-y-1">
              <div className="text-xs font-semibold text-accent uppercase tracking-wider">
                Recommended Action
              </div>
              <div className="text-xs text-text opacity-90">{selectedFinding.recommendation}</div>
            </div>

            {/* AI Explanation if available */}
            {selectedFinding.aiExplanation && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded space-y-1">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Explanation</span>
                </div>
                <div className="text-xs text-text opacity-90">{selectedFinding.aiExplanation}</div>
              </div>
            )}

            {/* Project Memory History */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Prior Endpoint Occurrences</span>
              </div>

              {endpointHistory.length === 0 ? (
                <div className="text-xs text-muted italic">
                  No prior breaking changes recorded on this endpoint in earlier runs.
                </div>
              ) : (
                <div className="space-y-2">
                  {endpointHistory.map((h, i) => (
                    <div
                      key={h.id + i}
                      className="p-2.5 bg-surface-2 border border-border rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-accent">
                          Run #{formatShortSha(h.runId)}
                        </span>
                        <span className="text-[10px] text-muted">{formatDate(h.createdAt)}</span>
                      </div>
                      <div className="text-muted">{h.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
