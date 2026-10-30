// components/shared/SkeletonRow.tsx — Table skeleton loader
import { cn } from '@/lib/utils';

type Props = { cols?: number; rows?: number; className?: string };

function SkeletonCell({ width }: { width?: string }) {
  return (
    <td className="px-3 py-2.5">
      <div
        className={cn('h-4 rounded bg-[var(--surface-2)] animate-pulse', width ?? 'w-24')}
      />
    </td>
  );
}

export function SkeletonRows({ cols = 5, rows = 5, className }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className={cn('border-b border-[var(--border)]', className)}>
          {Array.from({ length: cols }).map((__, c) => (
            <SkeletonCell key={c} width={c === 0 ? 'w-16' : c === cols - 1 ? 'w-32' : 'w-24'} />
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3',
        className,
      )}
    >
      <div className="h-4 w-24 rounded bg-[var(--surface-2)] animate-pulse" />
      <div className="h-8 w-16 rounded bg-[var(--surface-2)] animate-pulse" />
    </div>
  );
}

