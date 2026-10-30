'use client';

import { cn } from '@/lib/utils';

type Props = {
  connected: boolean;
  reconnecting?: boolean;
  className?: string;
};

/**
 * Live-connection dot for SSE state.
 * - Green: connected
 * - Amber + "Reconnecting…": disconnected/reconnecting
 * - per design_system.md §9 Offline SSE
 */
export function ConnectionDot({ connected, reconnecting = false, className }: Props) {
  return (
    <span
      className={cn('flex items-center gap-1.5 text-xs', className)}
      aria-live="polite"
      aria-label={connected ? 'Live updates connected' : reconnecting ? 'Reconnecting to live updates' : 'Live updates disconnected'}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          connected
            ? 'bg-[var(--ok)]'
            : reconnecting
            ? 'bg-amber-400 animate-pulse-dot'
            : 'bg-[var(--text-muted)]',
        )}
        aria-hidden
      />
      {!connected && (
        <span className="text-[var(--text-muted)]">
          {reconnecting ? 'Reconnecting…' : 'Disconnected'}
        </span>
      )}
    </span>
  );
}

