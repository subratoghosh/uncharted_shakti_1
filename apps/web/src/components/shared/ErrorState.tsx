// components/shared/ErrorState.tsx
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

type Props = {
  code?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ code, message, onRetry, className }: Props) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-card border border-[var(--sev-breaking-border)] bg-[var(--sev-breaking-bg)] px-5 py-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[var(--sev-breaking)]">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-medium text-sm">
          {code ? `Error: ${code}` : 'Something went wrong'}
        </span>
      </div>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

