import React from 'react';
import Link from 'next/link';
import { ShaktiqLogoIcon } from '../shared/ShaktiqLogoIcon';

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
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const content = (
    <div className="inline-flex items-center gap-2.5 group cursor-pointer select-none">
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
        <ShaktiqLogoIcon className={iconSizes[size]} theme={theme} />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${textSizes[size]}`}
        >
          <span className={isDark ? 'text-butter-cream' : 'text-[#1A3826]'}>shakt</span>
          <span className="text-[#52B143]">IQ</span>
        </span>
        <span
          className={`text-[9px] tracking-wider uppercase font-mono font-bold ${
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
