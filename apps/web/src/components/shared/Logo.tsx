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
        collapsed ? 'w-8 h-8 p-0.5' : 'px-1 py-0.5',
        className,
      )}
      style={{
        height: `${h}px`,
        maxWidth: collapsed ? '32px' : `${maxW}px`,
      }}
    >
      {/* Dark theme logo — shown automatically when .dark class is on html/body */}
      <img
        src="/logo-dark.png"
        alt="ShaktIQ Logo"
        style={{
          maxHeight: `${h - 4}px`,
          maxWidth: collapsed ? '28px' : `${maxW - 8}px`,
          width: 'auto',
          height: 'auto',
        }}
        className="hidden dark:block object-contain pointer-events-none select-none rounded"
      />
      {/* Light theme logo — shown automatically in light mode */}
      <img
        src="/logo-light.png"
        alt="ShaktIQ Logo"
        style={{
          maxHeight: `${h - 4}px`,
          maxWidth: collapsed ? '28px' : `${maxW - 8}px`,
          width: 'auto',
          height: 'auto',
        }}
        className="block dark:hidden object-contain pointer-events-none select-none rounded"
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

