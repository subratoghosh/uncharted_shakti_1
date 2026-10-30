import React from 'react';
import type { RunStatus } from '@shaktiq/shared';

export function StatusBadge({ status }: { status: RunStatus | string }) {
  const s = status.toLowerCase();

  if (s === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-ok/10 text-ok border border-ok/30">
        <span className="w-1.5 h-1.5 rounded-full bg-ok" />
        Completed
      </span>
    );
  }

  if (s === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/30">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
        Running
      </span>
    );
  }

  if (s === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sev-breaking/10 text-sev-breaking border border-sev-breaking/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sev-breaking" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-500/10 text-muted border border-border">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
      Queued
    </span>
  );
}
