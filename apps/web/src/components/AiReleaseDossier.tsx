'use client';

import React from 'react';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import type { MultiLayerDossier, Run, Finding } from '@/types/index';
import { BlastRadiusMatrix } from './BlastRadiusMatrix';
import { CodeRemediationCard } from './CodeRemediationCard';

interface AiReleaseDossierProps {
  aiDossier: MultiLayerDossier | null;
  loadingDossier: boolean;
  selectedRun: Run | null;
  runs: Run[];
  findings: Finding[];
  onSelectRun: (runId: string) => void;
  onRefreshDossier: () => void;
  getMethodBadgeClass: (method: string) => string;
}

export function AiReleaseDossier({
  aiDossier,
  loadingDossier,
  selectedRun,
  runs,
  findings,
  onSelectRun,
  onRefreshDossier,
  getMethodBadgeClass,
}: AiReleaseDossierProps) {

  return (
    <div className="space-y-6">
      {/* Header with Run Selector and Re-Analyze Trigger */}
      <div className="border border-border bg-surface p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              Multi-Layer AI Release Intelligence
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-accent/10 text-accent border border-accent/20">
                {aiDossier?.generatedBy || 'gemini-3.8-flash'}
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Synthesized across 4 layers: Deterministic Diff • Consumer Blast Radius • Code Remediation • Executive Decision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRun?._id || selectedRun?.id || ''}
            onChange={(e) => onSelectRun(e.target.value)}
            className="bg-surface-2 border border-border px-3 py-1.5 rounded text-xs font-mono"
          >
            {runs.map((r) => (
              <option key={r._id || r.id} value={r._id || r.id}>
                {r.headSha?.slice(0, 7) || 'manual'} • {r.releaseStatus} ({new Date(r.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>

          <button
            onClick={onRefreshDossier}
            disabled={loadingDossier}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDossier ? 'animate-spin' : ''}`} />
            <span>{loadingDossier ? 'Analyzing with Gemini...' : 'Re-Generate Dossier'}</span>
          </button>
        </div>
      </div>

      {loadingDossier ? (
        <div className="border border-border bg-surface p-12 rounded-lg text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Evaluating Consumer Contracts & Semantic Blast Radius...</h4>
            <p className="text-xs text-text-muted mt-1">
              Gemini 3.8 Flash is inspecting OpenAPI changes, mapping client vulnerability, and generating code fix snippets.
            </p>
          </div>
        </div>
      ) : !aiDossier ? (
        <div className="border border-border bg-surface p-12 rounded-lg text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="font-semibold text-sm">No AI Dossier Available</h4>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Select a compatibility run to generate an AI release intelligence report with consumer impact analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Layer 1 & 4: Executive Verdict & Release Score Hero Card */}
          <div className="border border-border bg-gradient-to-br from-surface to-surface-2 p-6 rounded-xl shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      aiDossier.releaseScore >= 70
                        ? 'badge-ok'
                        : aiDossier.releaseScore >= 40
                        ? 'badge-warning'
                        : 'badge-breaking'
                    }`}
                  >
                    {aiDossier.verdictLabel}
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    Run: {selectedRun?.headSha?.slice(0, 7) || 'HEAD'}
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-text">
                  Executive Release Intelligence Summary
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  {aiDossier.verdictDescription}
                </p>
              </div>

              {/* Release Score Gauge */}
              <div className="flex-shrink-0 flex items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-inner">
                <div className="text-center">
                  <div
                    className={`text-4xl font-extrabold tracking-tighter ${
                      aiDossier.releaseScore >= 70
                        ? 'text-emerald-500'
                        : aiDossier.releaseScore >= 40
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {aiDossier.releaseScore}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mt-0.5">
                    Release Score / 100
                  </div>
                </div>
                <div className="border-l border-border pl-4 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-text-muted">Breaking: {findings.filter((f) => f.severity === 'breaking').length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-text-muted">Warning: {findings.filter((f) => f.severity === 'warning').length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="text-text-muted">Info: {findings.filter((f) => f.severity === 'info').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2: 4-Pillar Consumer Blast Radius Matrix */}
          <BlastRadiusMatrix blastRadius={aiDossier.blastRadius} />

          {/* Layer 3: Findings Deep Insights & Code Remediation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Layer 3: AI Code Remediation & Consumer Fixes ({aiDossier.findingInsights.length})
              </h4>
              <span className="text-xs text-text-muted">Automated backward-compatible code patches</span>
            </div>

            <div className="space-y-4">
              {aiDossier.findingInsights.map((insight, idx) => (
                <CodeRemediationCard
                  key={idx}
                  insight={insight}
                  getMethodBadgeClass={getMethodBadgeClass}
                />
              ))}

              {aiDossier.findingInsights.length === 0 && (
                <div className="border border-border bg-surface p-8 text-center rounded-lg text-text-muted text-xs">
                  No breaking changes detected. All consumer contracts remain valid and intact!
                </div>
              )}
            </div>
          </div>

          {/* Layer 4: Executive Stakeholder Directives & Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stakeholder Directives */}
            <div className="lg:col-span-2 border border-border bg-surface p-5 rounded-lg space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted flex items-center gap-2">
                Layer 4: Multi-Stakeholder Directives
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border bg-surface-2/50 p-3.5 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <span>🛠️ Tech Lead</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {aiDossier.stakeholderNotes.techLead}
                  </p>
                </div>

                <div className="border border-border bg-surface-2/50 p-3.5 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <span>🧪 QA Engineering</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {aiDossier.stakeholderNotes.qaEngineering}
                  </p>
                </div>

                <div className="border border-border bg-surface-2/50 p-3.5 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <span>📋 Product Owner</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {aiDossier.stakeholderNotes.productOwner}
                  </p>
                </div>
              </div>
            </div>

            {/* Executive Action Plan Checklist */}
            <div className="border border-border bg-surface p-5 rounded-lg space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Executive Action Plan
              </h4>

              <ul className="space-y-2 text-xs">
                {aiDossier.executiveActionPlan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-surface-2 border border-border">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-text leading-tight">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
