// components/shared/StatusBadge.tsx
import { cn } from '@/lib/utils';
import type { RunStatus } from '@shaktiq/shared';

type Props = { status: RunStatus; className?: string };

const MAP: Record<RunStatus, { label: string; cls: string; dot?: string }> = {
  queued: {
    label: 'Queued',
    cls: 'text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)]',
  },
  running: {
    label: 'Running',
    cls: 'text-[var(--accent)] bg-[rgba(107,140,255,0.1)] border border-[rgba(107,140,255,0.3)]',
    dot: 'bg-[var(--accent)] animate-pulse-dot',
  },
  completed: {
    label: 'Completed',
    cls: 'text-[var(--ok)] ok-bg',
  },
  failed: {
    label: 'Failed',
    cls: 'text-[var(--sev-breaking)] sev-breaking-bg',
  },
};

export function StatusBadge({ status, className }: Props) {
  const { label, cls, dot } = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded text-xs font-medium px-2 py-0.5',
        cls,
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dot)} aria-hidden />}
      {label}
    </span>
  );
}

