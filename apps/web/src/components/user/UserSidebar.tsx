'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Play,
  Key,
  Settings,
  Zap,
} from 'lucide-react';

type NavItem = { label: string; href: string; Icon: React.ElementType };

const USER_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', Icon: FolderKanban },
  { label: 'Runs', href: '/runs', Icon: Play },
  { label: 'Tokens', href: '/tokens', Icon: Key },
  { label: 'Settings', href: '/settings', Icon: Settings },
];

type Props = { collapsed?: boolean };

export function UserSidebar({ collapsed = false }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-150',
        collapsed ? 'w-14' : 'w-[232px]',
      )}
      aria-label="User navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[var(--border)] shrink-0">
        <Zap className="h-5 w-5 text-[var(--accent)] shrink-0" aria-hidden />
        {!collapsed && (
          <span className="font-semibold text-base text-[var(--text)] tracking-tight">
            ShaktIQ
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto" aria-label="Primary">
        <ul role="list" className="space-y-0.5 px-2">
          {USER_NAV.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors min-h-[36px]',
                    active
                      ? 'bg-[var(--surface-2)] text-[var(--text)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                  )}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

