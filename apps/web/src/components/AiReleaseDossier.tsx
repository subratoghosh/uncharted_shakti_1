'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Copy, Check } from 'lucide-react';
import type { MultiLayerDossier, Run, Finding } from '@/types/index';

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
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);

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
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Layer 2: Consumer Blast Radius & Vulnerability Matrix
              </h4>
              <span className="text-xs text-text-muted">Evaluated against real API consumption patterns</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mobile Apps */}
              <div className="border border-border bg-surface p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span>📱 Mobile Applications</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      aiDossier.blastRadius.mobileAppsRisk === 'CRITICAL' || aiDossier.blastRadius.mobileAppsRisk === 'HIGH'
                        ? 'badge-breaking'
                        : aiDossier.blastRadius.mobileAppsRisk === 'MEDIUM'
                        ? 'badge-warning'
                        : 'badge-ok'
                    }`}
                  >
                    {aiDossier.blastRadius.mobileAppsRisk}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {aiDossier.blastRadius.mobileAppsRisk === 'CRITICAL' || aiDossier.blastRadius.mobileAppsRisk === 'HIGH'
                    ? 'Client crash risk on outdated app stores without forward compatibility.'
                    : 'Backward compatible or low client failure footprint.'}
                </p>
              </div>

              {/* Web Frontend */}
              <div className="border border-border bg-surface p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span>💻 Web Frontend</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      aiDossier.blastRadius.webFrontendRisk === 'CRITICAL' || aiDossier.blastRadius.webFrontendRisk === 'HIGH'
                        ? 'badge-breaking'
                        : aiDossier.blastRadius.webFrontendRisk === 'MEDIUM'
                        ? 'badge-warning'
                        : 'badge-ok'
                    }`}
                  >
                    {aiDossier.blastRadius.webFrontendRisk}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {aiDossier.blastRadius.webFrontendRisk === 'CRITICAL' || aiDossier.blastRadius.webFrontendRisk === 'HIGH'
                    ? 'Form validations and data schemas may reject payloads unexpectedly.'
                    : 'Single-page applications adapt smoothly without breaking state.'}
                </p>
              </div>

              {/* Microservices */}
              <div className="border border-border bg-surface p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span>⚙️ Backend Microservices</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      aiDossier.blastRadius.microservicesRisk === 'CRITICAL' || aiDossier.blastRadius.microservicesRisk === 'HIGH'
                        ? 'badge-breaking'
                        : aiDossier.blastRadius.microservicesRisk === 'MEDIUM'
                        ? 'badge-warning'
                        : 'badge-ok'
                    }`}
                  >
                    {aiDossier.blastRadius.microservicesRisk}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {aiDossier.blastRadius.microservicesRisk === 'CRITICAL' || aiDossier.blastRadius.microservicesRisk === 'HIGH'
                    ? 'Internal RPC or REST consumers face HTTP 4xx/5xx cascade errors.'
                    : 'Service mesh contract checks remain compatible.'}
                </p>
              </div>

              {/* 3rd Party Integrations */}
              <div className="border border-border bg-surface p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span>🌐 3rd-Party & Webhooks</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      aiDossier.blastRadius.thirdPartyRisk === 'CRITICAL' || aiDossier.blastRadius.thirdPartyRisk === 'HIGH'
                        ? 'badge-breaking'
                        : aiDossier.blastRadius.thirdPartyRisk === 'MEDIUM'
                        ? 'badge-warning'
                        : 'badge-ok'
                    }`}
                  >
                    {aiDossier.blastRadius.thirdPartyRisk}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {aiDossier.blastRadius.thirdPartyRisk === 'CRITICAL' || aiDossier.blastRadius.thirdPartyRisk === 'HIGH'
                    ? 'External partner API consumers without migration window will break.'
                    : 'Partner contracts and event delivery payloads unharmed.'}
                </p>
              </div>
            </div>

            {/* Summary banner */}
            <div className="mt-3 p-3 rounded-lg border border-border bg-surface-2/60 text-xs text-text leading-relaxed">
              <span className="font-semibold text-text">Blast Radius Analysis: </span>
              {aiDossier.blastRadius.summary}
            </div>
          </div>

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
                <div key={idx} className="border border-border bg-surface rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-surface-2/40">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getMethodBadgeClass(insight.method)}`}>
                        {insight.method}
                      </span>
                      <span className="font-mono text-xs font-semibold">{insight.endpoint}</span>
                      <span className="text-border">|</span>
                      <span className="text-xs text-text-muted font-mono">{insight.changeType}</span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(insight.codeFixSnippet);
                        setCopiedSnippetIndex(idx);
                        setTimeout(() => setCopiedSnippetIndex(null), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-2 transition-colors"
                    >
                      {copiedSnippetIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied Patch!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-text-muted" />
                          <span>Copy Fix Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Consumer Impact Assessment
                      </div>
                      <p className="text-xs text-text leading-relaxed bg-surface-2 p-2.5 rounded border border-border">
                        {insight.consumerImpact}
                      </p>
                    </div>

                    {insight.mitigationStrategy && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                          Mitigation Strategy
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed bg-emerald-500/5 p-2 rounded border border-emerald-500/20">
                          {insight.mitigationStrategy}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Backward-Compatible Remediation Snippet
                      </div>
                      <pre className="font-mono text-xs bg-bg p-3 rounded-md border border-border overflow-x-auto text-emerald-400">
                        <code>{insight.codeFixSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
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
