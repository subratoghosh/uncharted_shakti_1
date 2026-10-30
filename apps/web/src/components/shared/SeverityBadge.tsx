// components/shared/SeverityBadge.tsx
import { cn } from '@/lib/utils';
import type { Severity } from '@shaktiq/shared';

type Props = { severity: Severity; className?: string };

const MAP: Record<Severity, { label: string; cls: string }> = {
  breaking: { label: 'Breaking', cls: 'text-[var(--sev-breaking)] sev-breaking-bg' },
  warning: { label: 'Warning', cls: 'text-[var(--sev-warning)] sev-warning-bg' },
  info: { label: 'Info', cls: 'text-[var(--sev-info)] sev-info-bg' },
};

export function SeverityBadge({ severity, className }: Props) {
  const { label, cls } = MAP[severity];
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

