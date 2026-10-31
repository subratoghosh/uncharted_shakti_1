'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href?: string;
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Logo({
  href = '/dashboard',
  collapsed = false,
  size = 'md',
  className,
}: Props) {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  const logoElement = (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded transition-colors overflow-hidden',
        // Theme background compatibility: white in light mode, dark/black in dark mode
        'bg-white dark:bg-[#1D1C1A]',
        heightClasses[size],
        collapsed ? 'w-10' : 'w-auto px-1.5',
        className,
      )}
    >
      {/* Light mode: white background with light logo */}
      <img
        src="/logo-light.png"
        alt="ShaktIQ Logo"
        className={cn(
          'block dark:hidden object-contain max-h-full w-auto select-none',
          collapsed ? 'h-7 w-7 object-cover' : 'h-full w-auto'
        )}
      />
      {/* Dark mode: dark/black background with dark logo */}
      <img
        src="/logo-dark.png"
        alt="ShaktIQ Logo"
        className={cn(
          'hidden dark:block object-contain max-h-full w-auto select-none',
          collapsed ? 'h-7 w-7 object-cover' : 'h-full w-auto'
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
        aria-label="ShaktIQ Home"
      >
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}
