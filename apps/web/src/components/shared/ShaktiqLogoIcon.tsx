import React from 'react';

interface ShaktiqLogoIconProps {
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

/**
 * Official shaktIQ Emblem
 * - Circular badge with code brackets (< >) and speed lines in vibrant green (#52b143)
 * - Central lightning bolt
 */
export function ShaktiqLogoIcon({ className = 'w-8 h-8', theme = 'auto' }: ShaktiqLogoIconProps) {
  const isDark = theme === 'dark';
  const boltColor = isDark ? '#FBF7EE' : '#1A3826';
  const greenColor = '#52B143';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle Segments (broken top and bottom by the lightning bolt) */}
      <path
        d="M 33 24 A 36 36 0 0 0 25 66 A 36 36 0 0 0 42 85"
        stroke={greenColor}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path
        d="M 68 25 A 36 36 0 0 1 75 66 A 36 36 0 0 1 58 85"
        stroke={greenColor}
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Code bracket left < */}
      <path
        d="M 23 42 L 13 50 L 23 58"
        stroke={greenColor}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Code bracket right > */}
      <path
        d="M 77 42 L 87 50 L 77 58"
        stroke={greenColor}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Speed lines on top-right */}
      <path d="M 64 15 L 86 15" stroke={greenColor} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 69 23 L 90 23" stroke={greenColor} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 74 31 L 94 31" stroke={greenColor} strokeWidth="5.5" strokeLinecap="round" />

      {/* Central Lightning Bolt */}
      <path
        d="M 58 7 L 38 46 L 53 46 L 43 93 L 68 41 L 52 41 Z"
        fill={boltColor}
      />
    </svg>
  );
}
