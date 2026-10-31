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
    sm: { h: 28, maxW: 96 },
    md: { h: 36, maxW: 130 },
    lg: { h: 48, maxW: 170 },
  };

  const { h, maxW } = dimensions[size];

  const logoElement = (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none bg-transparent',
        collapsed ? 'w-8 h-8' : '',
        className,
      )}
      style={{
        height: `${h}px`,
        maxWidth: collapsed ? '32px' : `${maxW}px`,
      }}
    >
      {/* Dark theme logo (Bottom variant: white lightning & text, bright green Q) */}
      <img
        src="/shaktiq-dark.png"
        alt="ShaktIQ Logo"
        loading="eager"
        decoding="async"
        style={{
          maxHeight: `${h}px`,
          maxWidth: collapsed ? '32px' : `${maxW}px`,
          width: 'auto',
          height: '100%',
        }}
        className="hidden dark:block object-contain pointer-events-none select-none"
      />
      {/* Light theme logo (Top variant: dark green/black lightning & text, bright green Q) */}
      <img
        src="/shaktiq-light.png"
        alt="ShaktIQ Logo"
        loading="eager"
        decoding="async"
        style={{
          maxHeight: `${h}px`,
          maxWidth: collapsed ? '32px' : `${maxW}px`,
          width: 'auto',
          height: '100%',
        }}
        className="block dark:hidden object-contain pointer-events-none select-none"
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


