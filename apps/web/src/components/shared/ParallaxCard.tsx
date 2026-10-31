'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  value: string | number;
  sub?: string;
  category?: string;
  description?: string;
  details?: { label: string; value: string | number }[];
  className?: string;
  badge?: string;
};

export function ParallaxCard({
  title,
  value,
  sub,
  category,
  description,
  details = [],
  className,
  badge,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (card) {
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      }
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)';
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <>
      {/* 3D Tilt Parallax Card with 120fps hardware acceleration */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen(true)}
        style={{
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          willChange: 'transform',
        }}
        className={cn(
          'group relative cursor-pointer select-none rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 transition-shadow duration-300 transform-gpu',
          'hover:border-[var(--text)]/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40',
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            {category && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                {category}
              </span>
            )}
            <h3 className="text-sm font-medium text-[var(--text-muted)] mt-0.5">{title}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] font-mono">
                {badge}
              </span>
            )}
            <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-[var(--text)]">{value}</span>
        </div>

        {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}

        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <span>Click to view breakdown</span>
          <span className="group-hover:text-[var(--text)] transition-colors">Details &rarr;</span>
        </div>
      </div>

      {/* Modal Popup dialog reducing frontend cluttered space */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">
                  {category ?? 'Metric Card'}
                </span>
                <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-card bg-[var(--surface-2)] p-4 border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] block">Summary Value</span>
                <span className="text-3xl font-bold text-[var(--text)] mt-1 block">{value}</span>
                {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
              </div>

              {description && (
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
              )}

              {details.length > 0 && (
                <div className="divide-y divide-[var(--border)] rounded-card border border-[var(--border)] overflow-hidden">
                  {details.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs bg-[var(--surface)]">
                      <span className="text-[var(--text-muted)]">{d.label}</span>
                      <span className="font-semibold text-[var(--text)] font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

