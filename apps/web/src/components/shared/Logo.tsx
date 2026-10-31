'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration, default to light logo; once mounted, use resolvedTheme
  const isDark = mounted && resolvedTheme === 'dark';
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png';

  const dimensions = {
    sm: { h: 28, maxW: 84 },
    md: { h: 36, maxW: 120 },
    lg: { h: 48, maxW: 160 },
  };

  const { h, maxW } = dimensions[size];

  const logoElement = (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded transition-colors overflow-hidden select-none',
        // Background matches chosen light or dark mode
        'bg-white dark:bg-[#1D1C1A]',
        collapsed ? 'w-8 h-8 p-0.5' : 'px-1 py-0.5',
        className,
      )}
      style={{
        height: `${h}px`,
        maxWidth: collapsed ? '32px' : `${maxW}px`,
      }}
    >
      <img
        src={logoSrc}
        alt="ShaktIQ Logo"
        style={{
          maxHeight: `${h - 4}px`,
          maxWidth: collapsed ? '28px' : `${maxW - 8}px`,
          width: 'auto',
          height: 'auto',
        }}
        className="block object-contain pointer-events-none select-none"
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
