import React from 'react';
import type { ReleaseStatus } from '@shaktiq/shared';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export function ReleaseVerdictBanner({ status }: { status?: ReleaseStatus | string | null }) {
  const s = status?.toLowerCase();

  let title = 'Safe based on configured checks';
  let badgeColor = 'bg-ok/10 text-ok border-ok/30';
  let Icon = CheckCircle;
  let description = 'No breaking changes detected between compared API specifications.';

  if (s === 'blocked') {
    title = 'Not ready: blocking changes detected';
    badgeColor = 'bg-sev-breaking/10 text-sev-breaking border-sev-breaking/30';
    Icon = AlertCircle;
    description =
      'Breaking API modifications were detected that will cause downstream consumer failures if released.';
  } else if (s === 'review') {
    title = 'Warning: review required';
    badgeColor = 'bg-sev-warning/10 text-sev-warning border-sev-warning/30';
    Icon = AlertTriangle;
    description =
      'Potentially breaking or significant API changes were detected that require manual review.';
  }

  return (
    <div className={`p-4 rounded-lg border ${badgeColor} transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-base leading-tight">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
          <p className="text-xs italic opacity-75 mt-2">
            *This report assesses API compatibility based on the OpenAPI specifications provided. It
            does not guarantee the release is safe.*
          </p>
        </div>
      </div>
    </div>
  );
}
