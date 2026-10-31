'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'light',
  rounded = 'md',
  width,
  height,
  style,
  ...props
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  const shimmerClass = variant === 'dark' ? 'skeleton-shimmer-dark' : 'skeleton-shimmer';

  return (
    <div
      className={`relative overflow-hidden ${shimmerClass} ${roundedClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  variant?: 'light' | 'dark';
}> = ({ lines = 3, className = '', variant = 'light' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className="h-3.5"
          width={i === lines - 1 ? '65%' : i % 2 === 0 ? '100%' : '88%'}
        />
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" rounded="lg" />
          <Skeleton className="h-4 w-72" rounded="md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" rounded="full" />
          <Skeleton className="h-10 w-36" rounded="full" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="skeleton-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" rounded="md" />
              <Skeleton className="w-8 h-8" rounded="full" />
            </div>
            <Skeleton className="h-8 w-20" rounded="md" />
            <Skeleton className="h-3 w-32" rounded="sm" />
          </div>
        ))}
      </div>

      {/* Recent Runs Table / List */}
      <div className="skeleton-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#0C382E]/10">
          <Skeleton className="h-5 w-40" rounded="md" />
          <Skeleton className="h-4 w-20" rounded="md" />
        </div>
        <div className="space-y-3.5">
          {[1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-[#0C382E]/5 bg-[#FAF5E9]/50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6" rounded="full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44 sm:w-64" rounded="md" />
                  <Skeleton className="h-3 w-28 sm:w-36" rounded="sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16" rounded="full" />
                <Skeleton className="h-6 w-20" rounded="full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MarketingPageSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF4E6] text-[#0C382E] pt-24 pb-16 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Title Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-center">
            <Skeleton className="h-7 w-36" rounded="full" />
          </div>
          <Skeleton className="h-12 w-3/4 mx-auto" rounded="xl" />
          <Skeleton className="h-4 w-5/6 mx-auto" rounded="md" />
          <Skeleton className="h-4 w-2/3 mx-auto" rounded="md" />
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-3">
          <Skeleton className="h-11 w-40" rounded="full" />
          <Skeleton className="h-11 w-32" rounded="full" />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="skeleton-card p-6 space-y-4">
              <Skeleton className="w-12 h-12" rounded="xl" />
              <Skeleton className="h-6 w-4/5" rounded="md" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RunDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Run Top Banner */}
      <div className="skeleton-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24" rounded="full" />
              <Skeleton className="h-6 w-36" rounded="full" />
            </div>
            <Skeleton className="h-8 w-64" rounded="lg" />
          </div>
          <Skeleton className="w-24 h-24" rounded="full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#0C382E]/10">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="space-y-1">
              <Skeleton className="h-3 w-16" rounded="sm" />
              <Skeleton className="h-5 w-24" rounded="md" />
            </div>
          ))}
        </div>
      </div>

      {/* Code diff / remediation skeleton */}
      <div className="rounded-3xl p-6 bg-[#082820] text-butter-cream space-y-4 border border-[#0C382E]/40">
        <div className="flex items-center justify-between">
          <Skeleton variant="dark" className="h-5 w-48" rounded="md" />
          <Skeleton variant="dark" className="h-4 w-28" rounded="full" />
        </div>
        <div className="p-4 rounded-2xl bg-black/30 space-y-2 font-mono">
          <Skeleton variant="dark" className="h-4 w-3/4" rounded="sm" />
          <Skeleton variant="dark" className="h-4 w-1/2" rounded="sm" />
          <Skeleton variant="dark" className="h-4 w-5/6" rounded="sm" />
          <Skeleton variant="dark" className="h-4 w-2/3" rounded="sm" />
        </div>
      </div>
    </div>
  );
};
