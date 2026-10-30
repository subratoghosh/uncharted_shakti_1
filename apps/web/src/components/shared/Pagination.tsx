// components/shared/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  page: number;
  total: number;
  limit: number;
  onPage: (n: number) => void;
  className?: string;
};

export function Pagination({ page, total, limit, onPage, className }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const btnClass =
    'inline-flex items-center justify-center h-9 px-3 rounded border border-[var(--border)] text-sm text-[var(--text)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

  return (
    <div className={cn('flex items-center gap-3', className)} aria-label="Pagination">
      <button
        className={btnClass}
        onClick={() => onPage(page - 1)}
        disabled={isFirst}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <span className="text-sm text-[var(--text-muted)] tabular-nums">
        Page <span className="font-medium text-[var(--text)]">{page}</span> of{' '}
        <span className="font-medium text-[var(--text)]">{totalPages}</span>
      </span>

      <button
        className={btnClass}
        onClick={() => onPage(page + 1)}
        disabled={isLast}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
