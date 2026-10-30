// components/shared/EmptyState.tsx
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <p className="text-base font-medium text-[var(--text)] mb-1">{title}</p>
      <p className="text-sm text-[var(--text-muted)] mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

