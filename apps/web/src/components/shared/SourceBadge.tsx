// components/shared/SourceBadge.tsx
import { cn } from '@/lib/utils';
import type { Source } from '@shaktiq/shared';

type Props = { source: Source; className?: string };

const MAP: Record<Source, string> = {
  github: 'GitHub',
  manual: 'Manual',
  vscode: 'VS Code',
};

export function SourceBadge({ source, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded text-xs font-medium px-2 py-0.5',
        'text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)]',
        className,
      )}
    >
      {MAP[source]}
    </span>
  );
}

