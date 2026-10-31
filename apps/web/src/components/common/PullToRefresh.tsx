'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const maxPull = 90;
  const triggerDistance = 65;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only initiate pull-to-refresh when user is scrolled to the very top
      if (window.scrollY <= 2) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;

      if (diff > 0 && window.scrollY <= 2) {
        // Apply friction to the pull distance
        const distance = Math.min(diff * 0.45, maxPull);
        setPullDistance(distance);
        if (distance > 10 && e.cancelable) {
          // Prevent default overscroll if pulling down
          // e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= triggerDistance && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(triggerDistance);

        // Haptic feedback if available on mobile devices
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(25);
          } catch {
            // Ignore if vibration permissions are blocked
          }
        }

        // Trigger Next.js router refresh
        router.refresh();

        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 700);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, router]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Pull down indicator pill */}
      <div
        className="fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 pointer-events-none flex items-center justify-center"
        style={{
          transform: `translate(-50%, ${pullDistance > 10 ? pullDistance - 15 : -60}px)`,
          opacity: pullDistance > 10 ? Math.min(pullDistance / triggerDistance, 1) : 0,
        }}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C382E] text-butter-cream shadow-lg border border-green-light/40 text-xs font-mono">
          <RefreshCw
            className={`w-3.5 h-3.5 text-butter-cream transition-transform duration-200 ${
              isRefreshing
                ? 'animate-spin'
                : pullDistance >= triggerDistance
                  ? 'rotate-180 text-butter-gold'
                  : ''
            }`}
          />
          <span className="font-sans font-semibold text-[11px]">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= triggerDistance
                ? 'Release to refresh'
                : 'Pull down to refresh'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.55}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

