'use client';

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ConnectionDot } from '@/components/shared/ConnectionDot';
import { useConnectionStatus } from '@/hooks/use-connection-status';
import { cn } from '@/lib/utils';
import { Menu, LogOut, ChevronRight } from 'lucide-react';

type Crumb = { label: string; href?: string };

type Props = {
  breadcrumbs?: Crumb[];
  onMenuToggle?: () => void;
  className?: string;
};

export function Topbar({ breadcrumbs, onMenuToggle, className }: Props) {
  const { connected, reconnecting } = useConnectionStatus();

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 shrink-0',
        className,
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] lg:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0 flex-1">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" aria-hidden />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] truncate"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--text)] font-medium truncate" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ConnectionDot connected={connected} reconnecting={reconnecting} />
        <ThemeToggle />
      </div>
    </header>
  );
}

