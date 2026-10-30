// components/shared/EndpointTag.tsx
// Renders METHOD /path in monospace with method-colored neutral tag
import { cn } from '@/lib/utils';
import type { HttpMethod } from '@shaktiq/shared';

type Props = { method: HttpMethod; path: string; className?: string };

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-[var(--sev-info)]',
  POST: 'text-[var(--ok)]',
  DELETE: 'text-[var(--sev-breaking)]',
  PUT: 'text-[var(--sev-warning)]',
  PATCH: 'text-[var(--sev-warning)]',
};

export function EndpointTag({ method, path, className }: Props) {
  const methodColor = METHOD_COLORS[method] ?? 'text-[var(--text-muted)]';
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-mono text-sm', className)}
      aria-label={`${method} ${path}`}
    >
      <span className={cn('font-semibold text-xs', methodColor)}>{method}</span>
      <span className="text-[var(--text)]">{path}</span>
    </span>
  );
}

