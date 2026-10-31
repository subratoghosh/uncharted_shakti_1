'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  // During SSR and before mount, render consistent static markup to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Switch theme"
        title="Switch theme"
        suppressHydrationWarning
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors',
          className,
        )}
      >
        <Sun className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = `Switch theme (currently ${theme ?? 'system'})`;

  return (
    <button
      onClick={cycle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
