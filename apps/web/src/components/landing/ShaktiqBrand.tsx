import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

type ShaktiqBrandProps = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
};

export const ShaktiqBrand: React.FC<ShaktiqBrandProps> = ({
  href = '/',
  size = 'md',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="inline-flex items-center gap-2.5 group cursor-pointer select-none">
      <div
        className={`relative flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          isDark
            ? 'bg-butter-cream text-green-dark shadow-sm'
            : 'bg-green-dark text-butter-cream shadow-sm'
        }`}
      >
        <ShieldCheck className={iconSizes[size]} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-accent ring-2 ring-white" />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-slab font-bold tracking-tight leading-none ${textSizes[size]} ${
            isDark ? 'text-butter-cream' : 'text-green-dark'
          }`}
        >
          Shakt<span className={isDark ? 'text-green-sage' : 'text-green-mid'}>IQ</span>
        </span>
        <span
          className={`text-[9px] tracking-wider uppercase font-mono font-semibold ${
            isDark ? 'text-text-hero-sub/70' : 'text-text-dim'
          }`}
        >
          API Intelligence
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
