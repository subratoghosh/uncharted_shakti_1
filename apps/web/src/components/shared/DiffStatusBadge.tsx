// components/shared/DiffStatusBadge.tsx
import { cn } from '@/lib/utils';
import type { DiffStatus } from '@shaktiq/shared';

type Props = { status: DiffStatus; className?: string };

const MAP: Record<DiffStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'text-[var(--sev-breaking)] sev-breaking-bg' },
  resolved: { label: 'Resolved', cls: 'text-[var(--ok)] ok-bg' },
  unresolved: { label: 'Unresolved', cls: 'text-[var(--sev-warning)] sev-warning-bg' },
};

export function DiffStatusBadge({ status, className }: Props) {
  const { label, cls } = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded text-xs font-medium px-2 py-0.5',
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

