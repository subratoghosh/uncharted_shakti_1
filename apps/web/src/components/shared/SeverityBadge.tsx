import React from 'react';
import type { Severity } from '@shaktiq/shared';

export function SeverityBadge({ severity }: { severity: Severity | string }) {
  const sev = severity.toLowerCase();

  if (sev === 'breaking') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-sev-breaking/10 text-sev-breaking border border-sev-breaking/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sev-breaking" />
        Breaking
      </span>
    );
  }

  if (sev === 'warning') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-sev-warning/10 text-sev-warning border border-sev-warning/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sev-warning" />
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-sev-info/10 text-sev-info border border-sev-info/30">
      <span className="w-1.5 h-1.5 rounded-full bg-sev-info" />
      Info
    </span>
  );
}
