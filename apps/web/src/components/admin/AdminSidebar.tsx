'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import {
  LayoutDashboard,
  FolderKanban,
  Play,
  Calendar,
  GitBranch,
  Users,
  ShieldAlert,
} from 'lucide-react';

type NavItem = { label: string; href: string; Icon: React.ElementType };

const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Overview', href: '/admin/overview', Icon: LayoutDashboard },
  { label: 'All Projects', href: '/admin/projects', Icon: FolderKanban },
  { label: 'All Runs', href: '/admin/runs', Icon: Play },
  { label: 'Events', href: '/admin/events', Icon: Calendar },
  { label: 'Workflows', href: '/admin/workflows', Icon: GitBranch },
  { label: 'Users', href: '/admin/users', Icon: Users },
];

type Props = { collapsed?: boolean };

export function AdminSidebar({ collapsed = false }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--surface)] border-r-2 border-[var(--sev-breaking)] transition-all duration-150',
        collapsed ? 'w-14' : 'w-[232px]',
      )}
      aria-label="Admin navigation"
    >
      {/* Logo + Admin label */}
      <div className="flex items-center px-3.5 h-14 border-b border-[var(--border)] shrink-0 overflow-hidden">
        <Logo href="/admin/overview" collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto" aria-label="Admin primary">
        <ul role="list" className="space-y-0.5 px-2">
          {ADMIN_NAV.map(({ label, href, Icon }) => {
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

