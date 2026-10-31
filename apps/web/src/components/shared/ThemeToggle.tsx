'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const isDark =
      resolvedTheme === 'dark' ||
      (typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark'));
    const nextTheme = isDark ? 'light' : 'dark';

    setTheme(nextTheme);

    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light/dark theme"
      title="Toggle light/dark theme"
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]',
        className,
      )}
    >
      {/* Sun icon is visible in dark mode to switch to light */}
      <Sun className="h-4 w-4 hidden dark:block text-amber-400" aria-hidden />
      {/* Moon icon is visible in light mode to switch to dark */}
      <Moon className="h-4 w-4 block dark:hidden text-[var(--text)]" aria-hidden />
    </button>
  );
}

