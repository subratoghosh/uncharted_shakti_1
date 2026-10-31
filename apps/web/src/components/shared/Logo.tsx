'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href?: string;
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  subtitle?: string;
};

export function Logo({
  href = '/dashboard',
  collapsed = false,
  size = 'md',
  className,
  subtitle,
}: Props) {
  const sizeClasses = {
    sm: 'h-7 w-auto',
    md: 'h-9 w-auto',
    lg: 'h-12 w-auto',
  };

  const imageElement = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex items-center justify-center rounded-lg bg-white p-1 shadow-sm border border-[var(--border)] overflow-hidden shrink-0">
        <Image
          src="/logo.png"
          alt="ShaktIQ Logo"
          width={size === 'lg' ? 48 : size === 'sm' ? 28 : 36}
          height={size === 'lg' ? 48 : size === 'sm' ? 28 : 36}
          className="object-contain"
          priority
        />
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-bold text-base tracking-tight text-[var(--text)]">
              shakt<span className="text-[#22C55E]">IQ</span>
            </span>
          </div>
          {subtitle ? (
            <span className="text-[10px] font-mono tracking-widest text-[#22C55E] font-semibold mt-0.5 uppercase">
              {subtitle}
            </span>
          ) : (
            <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] mt-0.5">
              API Compatibility
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
        aria-label="ShaktIQ Home"
      >
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
