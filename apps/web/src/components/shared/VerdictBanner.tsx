// components/shared/VerdictBanner.tsx
// Exact verdict labels from design_system.md §10 and prd.md FR-5
import { cn } from '@/lib/utils';
import type { ReleaseStatus } from '@shaktiq/shared';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

type Props = { status: ReleaseStatus; className?: string };

const MAP: Record<
  ReleaseStatus,
  { label: string; cls: string; Icon: React.ElementType }
> = {
  safe: {
    label: 'Safe based on configured checks',
    cls: 'text-[var(--ok)] ok-bg',
    Icon: CheckCircle,
  },
  review: {
    label: 'Warning: review required',
    cls: 'text-[var(--sev-warning)] sev-warning-bg',
    Icon: AlertTriangle,
  },
  blocked: {
    label: 'Not ready: blocking changes detected',
    cls: 'text-[var(--sev-breaking)] sev-breaking-bg',
    Icon: XCircle,
  },
};

export function VerdictBanner({ status, className }: Props) {
  const { label, cls, Icon } = MAP[status];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 rounded-card px-5 py-4 text-base font-semibold',
        cls,
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

