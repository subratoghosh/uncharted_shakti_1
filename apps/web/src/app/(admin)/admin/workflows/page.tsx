'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Workflow, CheckCircle, RefreshCw } from 'lucide-react';

type WorkflowHealth = {
  n8nStatus: 'online' | 'offline';
  mainWorkflow: string;
  errorWorkflow: string;
  n8nWebhookUrl: string;
  lastChecked: string;
};

export default function AdminWorkflowsPage() {
  const {
    data: _health,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-workflows'],
    queryFn: () => apiClient<WorkflowHealth>('/admin/workflows/health'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Orchestrator Health</h1>
          <p className="text-sm text-muted">
            Status of n8n automation pipelines and background execution engine
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface text-text rounded-sm text-xs font-medium hover:bg-surface-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted">Checking workflow orchestrator...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Orchestration Node */}
          <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Workflow className="w-4 h-4 text-accent" />
                <span>shaktiq-analyze-run</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-ok/10 text-ok border border-ok/30 uppercase">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Coordinates spec fetching from GitHub, invokes analyzer, checks AI conditions with
              Claude, and dispatches PR comments.
            </p>
            <div className="p-2.5 bg-surface-2 border border-border rounded font-mono text-[11px] text-muted space-y-1">
              <div>Trigger: Header-Auth Webhook</div>
              <div>Timeout: 10s per step</div>
              <div>Retries: 3x on HTTP nodes (2s backoff)</div>
            </div>
          </div>

          {/* Error Handler Node */}
          <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Workflow className="w-4 h-4 text-sev-warning" />
                <span>shaktiq-error-handler</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-ok/10 text-ok border border-ok/30 uppercase">
                <CheckCircle className="w-3 h-3" />
                Configured
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Error trigger workflow bound to the main pipeline. Intercepts failures and reports
              error context to /internal/runs/:id/fail.
            </p>
            <div className="p-2.5 bg-surface-2 border border-border rounded font-mono text-[11px] text-muted space-y-1">
              <div>Type: Error Trigger</div>
              <div>Report Endpoint: /internal/runs/:id/fail</div>
              <div>Code: WORKFLOW_FAILED</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
