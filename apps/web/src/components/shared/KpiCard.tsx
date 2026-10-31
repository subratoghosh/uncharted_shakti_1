// components/shared/KpiCard.tsx
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
  href?: string;
};

export function KpiCard({ label, value, sub, className, href }: Props) {
  const content = (
    <>
      <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text)] leading-tight">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </>
  );

  const baseClass = cn(
    'block bg-[var(--surface)] border border-[var(--border)] rounded-card p-5 transition-all duration-200',
    'hover:border-[var(--text)]/40 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30',
    href && 'hover:bg-[var(--surface-2)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)]',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
