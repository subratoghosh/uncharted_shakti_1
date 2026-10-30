import React from 'react';
import type { MultiLayerDossier } from '@/types/index';

interface BlastRadiusMatrixProps {
  blastRadius: MultiLayerDossier['blastRadius'];
}

function getBadgeClass(risk: string) {
  if (risk === 'CRITICAL' || risk === 'HIGH') return 'badge-breaking';
  if (risk === 'MEDIUM') return 'badge-warning';
  return 'badge-ok';
}

export function BlastRadiusMatrix({ blastRadius }: BlastRadiusMatrixProps) {
  return (
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(
                blastRadius.mobileAppsRisk
              )}`}
            >
              {blastRadius.mobileAppsRisk}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {blastRadius.mobileAppsRisk === 'CRITICAL' || blastRadius.mobileAppsRisk === 'HIGH'
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(
                blastRadius.webFrontendRisk
              )}`}
            >
              {blastRadius.webFrontendRisk}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {blastRadius.webFrontendRisk === 'CRITICAL' || blastRadius.webFrontendRisk === 'HIGH'
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(
                blastRadius.microservicesRisk
              )}`}
            >
              {blastRadius.microservicesRisk}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {blastRadius.microservicesRisk === 'CRITICAL' || blastRadius.microservicesRisk === 'HIGH'
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(
                blastRadius.thirdPartyRisk
              )}`}
            >
              {blastRadius.thirdPartyRisk}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {blastRadius.thirdPartyRisk === 'CRITICAL' || blastRadius.thirdPartyRisk === 'HIGH'
              ? 'External partner API consumers without migration window will break.'
              : 'Partner contracts and event delivery payloads unharmed.'}
          </p>
        </div>
      </div>

      {/* Summary banner */}
      <div className="mt-3 p-3 rounded-lg border border-border bg-surface-2/60 text-xs text-text leading-relaxed">
        <span className="font-semibold text-text">Blast Radius Analysis: </span>
        {blastRadius.summary}
      </div>
    </div>
  );
}
